pub mod call;
pub mod class;
pub mod config;

use std::path::Path;
use std::time::SystemTime;
use std::{collections::HashMap, path::PathBuf};

use colored::Colorize;
use pyo3::prelude::*;
use pyo3::types::PyTuple;
use tracing::{event, info, span, warn, Level};

use crate::MainStatus;

#[derive(Debug, Clone)]
pub struct PyStatus {
    pub files: Option<PyPlugins>,
    pub config: Option<config::PluginConfigFile>,
}

pub type PyPlugins = HashMap<PathBuf, PyPlugin>;
pub type RawPyPlugin = (PathBuf, Option<SystemTime>, String);

impl PyStatus {
    pub fn init() {
        unsafe {
            if PYSTATUS.files.is_none() {
                PYSTATUS.files = Some(HashMap::new());
            }
            if PYSTATUS.config.is_none() {
                let plugin_path = MainStatus::global_config().py().config_path.clone();
                let mut config =
                    config::PluginConfigFile::from_config_path(&PathBuf::from(plugin_path))
                        .unwrap();
                config.verify_and_init();
                PYSTATUS.config = Some(config);
            }
        }
    }

    pub fn add_file(path: PathBuf, plugin: PyPlugin) { Self::get_map_mut().insert(path, plugin); }

    pub fn verify_file(path: &PathBuf) -> bool {
        Self::get_map().get(path).map_or(false, |plugin| plugin.verifiy())
    }

    pub fn get_map() -> &'static PyPlugins {
        unsafe {
            match PYSTATUS.files.as_ref() {
                Some(files) => files,
                None => {
                    Self::init();
                    PYSTATUS.files.as_ref().unwrap()
                }
            }
        }
    }

    pub fn get_map_mut() -> &'static mut PyPlugins {
        unsafe {
            match PYSTATUS.files.as_mut() {
                Some(files) => files,
                None => {
                    Self::init();
                    PYSTATUS.files.as_mut().unwrap()
                }
            }
        }
    }

    pub fn get_config() -> &'static config::PluginConfigFile {
        unsafe {
            match PYSTATUS.config.as_ref() {
                Some(config) => config,
                None => {
                    Self::init();
                    PYSTATUS.config.as_ref().unwrap()
                }
            }
        }
    }

    pub fn get_config_mut() -> &'static mut config::PluginConfigFile {
        unsafe {
            match PYSTATUS.config.as_mut() {
                Some(config) => config,
                None => {
                    Self::init();
                    PYSTATUS.config.as_mut().unwrap()
                }
            }
        }
    }

    /// 获取某个插件的状态
    /// 以 config 优先
    pub fn get_status(path: &PathBuf) -> Option<bool> {
        Self::get_config_mut().sync_status_from_config();
        Self::get_map().get(path).map(|plugin| plugin.enabled)
    }

    pub fn set_status(path: &Path, status: bool) {
        let cfg = Self::get_config_mut();
        cfg.set_status(path, status);
        let map = Self::get_map_mut();
        if let Some(plugin) = map.get_mut(path) {
            plugin.enabled = status;
        }
    }

    pub fn display() -> String {
        let map = Self::get_map();
        format!(
            "Python 插件 {{ {} }}",
            map.iter()
                .map(|(k, v)| format!("{:?}-{}", k, v.enabled))
                .collect::<Vec<String>>()
                .join("\n")
        )
    }
}

pub fn get_py_err_traceback(py_err: &PyErr) -> String {
    Python::with_gil(|py| match py_err.traceback_bound(py) {
        Some(traceback) => match traceback.format() {
            Ok(trace) => trace,
            Err(e) => format!("{:?}", e),
        },
        None => "".to_string(),
    })
    .red()
    .to_string()
}

#[derive(Debug, Clone)]
pub struct PyPlugin {
    pub file_path: PathBuf,
    pub changed_time: Option<SystemTime>,
    pub py_module: Py<PyAny>,
    pub enabled: bool,
}

impl PyPlugin {
    /// 从文件创建一个新的
    pub fn new_from_path(path: &PathBuf) -> Option<Self> {
        let raw_file = load_py_file(path);
        match raw_file {
            Ok(raw_file) => match Self::try_from(raw_file) {
                Ok(plugin) => Some(plugin),
                Err(e) => {
                    warn!(
                        "加载 Python 插件文件{:?}: {:?} 失败\n{}",
                        path,
                        e,
                        get_py_err_traceback(&e)
                    );
                    None
                }
            },
            Err(e) => {
                warn!("加载插件 {:?}: {:?} 失败", path, e);
                None
            }
        }
    }

    /// 从文件更新
    pub fn reload_from_file(&mut self) {
        let raw_file = load_py_file(&self.file_path);
        match raw_file {
            Ok(raw_file) => match Self::try_from(raw_file) {
                Ok(plugin) => {
                    self.py_module = plugin.py_module;
                    self.changed_time = plugin.changed_time;
                    self.enabled = PyStatus::get_config().get_status(self.file_path.as_path());
                    event!(Level::INFO, "更新 Python 插件文件 {:?} 完成", self.file_path);
                }
                Err(e) => {
                    warn!(
                        "更新 Python 插件文件{:?}: {:?} 失败\n{}",
                        self.file_path,
                        e,
                        get_py_err_traceback(&e)
                    );
                }
            },
            Err(e) => {
                warn!("更新插件 {:?}: {:?} 失败", self.file_path, e);
            }
        }
    }

    /// 检查文件是否被修改
    pub fn verifiy(&self) -> bool {
        match get_change_time(&self.file_path) {
            None => false,
            Some(time) => {
                if let Some(changed_time) = self.changed_time {
                    time.eq(&changed_time)
                } else {
                    true
                }
            }
        }
    }
}

pub const CONFIG_DATA_NAME: &str = "CONFIG_DATA";

impl TryFrom<RawPyPlugin> for PyPlugin {
    type Error = PyErr;
    fn try_from(value: RawPyPlugin) -> Result<Self, Self::Error> {
        let (path, changed_time, content) = value;
        let py_module = match py_module_from_code(&content, &path) {
            Ok(module) => module,
            Err(e) => {
                warn!("加载 Python 插件: {:?} 失败", e);
                return Err(e);
            }
        };
        Python::with_gil(|py| {
            let module = py_module.bind(py);
            if let Ok(config_func) = call::get_func(module, "on_config") {
                match config_func.call0() {
                    Ok(config) => {
                        if config.is_instance_of::<PyTuple>() {
                            let (config, default) = config.extract::<(String, String)>().unwrap();
                            let base_path = MainStatus::global_config().py().config_path;

                            let mut base_path: PathBuf = PathBuf::from(base_path);

                            if !base_path.exists() {
                                warn!("python 插件路径不存在, 创建: {:?}", base_path);
                                std::fs::create_dir_all(&base_path)?;
                            }
                            base_path.push(&config);

                            let config_value = if base_path.exists() {
                                info!("加载 {:?} 的配置文件 {:?} 中", path, base_path);
                                let content = std::fs::read_to_string(&base_path)?;
                                toml::from_str(&content)
                            } else {
                                warn!("配置文件 {:?} 不存在, 创建默认配置", base_path);
                                // 写入默认配置
                                std::fs::write(base_path, &default)?;
                                toml::from_str(&default)
                            };
                            match config_value {
                                Ok(config) => {
                                    let py_config =
                                        Bound::new(py, class::ConfigDataPy::new(config));
                                    if let Err(e) = py_config {
                                        warn!("添加配置文件信息失败: {:?}", e);
                                        return Err(e);
                                    }
                                    let py_config = py_config.unwrap();
                                    // 先判定一下原来有没有
                                    if let Ok(true) = module.hasattr(CONFIG_DATA_NAME) {
                                        // get 过来, 后面直接覆盖, 这里用于发个警告
                                        match module.getattr(CONFIG_DATA_NAME) {
                                            Ok(old_config) => {
                                                // 先判断是不是 None, 直接忽略掉 None
                                                // 毕竟有可能有占位
                                                if !old_config.is_none() {
                                                    warn!(
                                                        "Python 插件 {:?} 的配置文件信息已经存在\n原始内容: {}",
                                                        path, old_config
                                                    );
                                                }
                                            }
                                            Err(e) => {
                                                warn!(
                                                    "Python 插件 {:?} 的配置文件信息已经存在, 但获取失败:{:?}",
                                                    path, e
                                                );
                                            }
                                        }
                                    }
                                    match module.setattr(CONFIG_DATA_NAME, py_config) {
                                        Ok(()) => Ok(PyPlugin {
                                            file_path: path,
                                            changed_time,
                                            py_module: module.into_py(py),
                                            enabled: true,
                                        }),
                                        Err(e) => {
                                            warn!(
                                                "Python 插件 {:?} 的配置文件信息设置失败:{:?}",
                                                path, e
                                            );
                                            Err(PyErr::new::<pyo3::exceptions::PyTypeError, _>(
                                                format!(
                                                    "Python 插件 {:?} 的配置文件信息设置失败:{:?}",
                                                    path, e
                                                ),
                                            ))
                                        }
                                    }
                                }
                                Err(e) => {
                                    warn!(
                                        "加载 Python 插件 {:?} 的配置文件信息时失败:{:?}",
                                        path, e
                                    );
                                    Err(PyErr::new::<pyo3::exceptions::PyTypeError, _>(format!(
                                        "加载 Python 插件 {:?} 的配置文件信息时失败:{:?}",
                                        path, e
                                    )))
                                }
                            }
                        } else if config.is_none() {
                            // 没有配置文件
                            Ok(PyPlugin {
                                file_path: path,
                                changed_time,
                                py_module: module.into_py(py),
                                enabled: true,
                            })
                        } else {
                            warn!(
                                "加载 Python 插件 {:?} 的配置文件信息时失败:返回的不是 [str, str]",
                                path
                            );
                            Err(PyErr::new::<pyo3::exceptions::PyTypeError, _>(
                                "返回的不是 [str, str]".to_string(),
                            ))
                        }
                    }
                    Err(e) => {
                        warn!("加载 Python 插件 {:?} 的配置文件信息时失败:{:?}", path, e);
                        Err(e)
                    }
                }
            } else {
                Ok(PyPlugin {
                    file_path: path,
                    changed_time,
                    py_module: module.into_py(py),
                    enabled: true,
                })
            }
        })
    }
}

pub static mut PYSTATUS: PyStatus = PyStatus {
    files: None,
    config: None,
};

pub fn load_py_plugins(path: &PathBuf) {
    if path.exists() {
        event!(Level::INFO, "找到位于 {:?} 的插件", path);
        // 搜索所有的 py 文件 和 文件夹单层下面的 py 文件
        match path.read_dir() {
            Err(e) => {
                event!(Level::WARN, "读取插件路径失败 {:?}", e);
            }
            Ok(dir) => {
                for entry in dir {
                    let entry = entry.unwrap();
                    let path = entry.path();
                    if let Some(ext) = path.extension() {
                        if ext == "py" {
                            if let Some(plugin) = PyPlugin::new_from_path(&path) {
                                PyStatus::add_file(path, plugin);
                            }
                        }
                    }
                }
            }
        }
    } else {
        event!(Level::WARN, "插件加载目录不存在: {:?}", path);
    }
    PyStatus::get_config_mut().sync_status_from_config();
    event!(
        Level::INFO,
        "python 插件目录: {:?} 加载完成, 加载到 {} 个插件",
        path,
        PyStatus::get_map().len()
    );
}

pub fn get_change_time(path: &Path) -> Option<SystemTime> { path.metadata().ok()?.modified().ok() }

pub fn py_module_from_code(content: &str, path: &Path) -> PyResult<Py<PyAny>> {
    Python::with_gil(|py| -> PyResult<Py<PyAny>> {
        let module: PyResult<Py<PyAny>> = PyModule::from_code_bound(
            py,
            content,
            &path.to_string_lossy(),
            &path.file_name().unwrap().to_string_lossy(),
            // !!!! 请注意, 一定要给他一个名字, cpython 会自动把后面的重名模块覆盖掉前面的
        )
        .map(|module| module.into());
        module
    })
}

/// 传入文件路径
/// 返回 hash 和 文件内容
pub fn load_py_file(path: &PathBuf) -> std::io::Result<RawPyPlugin> {
    let changed_time = get_change_time(path);
    let content = std::fs::read_to_string(path)?;
    Ok((path.clone(), changed_time, content))
}

/// Python 侧初始化
pub fn init_py() {
    // 从 全局配置中获取 python 插件路径
    let span = span!(Level::INFO, "初始化 python 及其插件.ing");
    let _enter = span.enter();

    let plugin_path = MainStatus::global_config().py().plugin_path;

    event!(Level::INFO, "正在初始化 python");
    pyo3::prepare_freethreaded_python();

    PyStatus::init();
    let plugin_path = PathBuf::from(plugin_path);
    load_py_plugins(&plugin_path);
    event!(Level::DEBUG, "python 插件列表: {}", PyStatus::display());

    info!("python inited")
}

pub fn post_py() -> anyhow::Result<()> {
    PyStatus::get_config_mut().sync_status_to_config();
    PyStatus::get_config()
        .write_to_file(&PathBuf::from(MainStatus::global_config().py().config_path))?;
    Ok(())
}
