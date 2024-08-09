pub mod call;
pub mod class;
pub mod config;

use std::path::Path;
use std::time::SystemTime;
use std::{collections::HashMap, path::PathBuf};

use colored::Colorize;
use pyo3::prelude::*;
use pyo3::types::PyTuple;
use tracing::{debug, info, span, warn, Level};

use crate::MainStatus;

#[derive(Debug, Clone)]
pub struct PyStatus {
    pub files: Option<HashMap<PathBuf, PyPlugin>>,
}

pub type PyPluginData = HashMap<PathBuf, PyPlugin>;
pub type RawPyPlugin = (PathBuf, Option<SystemTime>, String);

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
                                    match module.hasattr(CONFIG_DATA_NAME) {
                                        Ok(true) => {
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
                                        _ => {}
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

impl PyStatus {
    pub fn get_files() -> &'static PyPluginData {
        unsafe {
            match PYSTATUS.files.as_ref() {
                Some(files) => files,
                None => {
                    PYSTATUS.files = Some(HashMap::new());
                    PYSTATUS.files.as_ref().unwrap()
                }
            }
        }
    }

    pub fn add_file(path: PathBuf, plugin: PyPlugin) {
        unsafe {
            match PYSTATUS.files.as_mut() {
                Some(files) => {
                    files.insert(path, plugin);
                }
                None => {
                    let mut files: PyPluginData = HashMap::new();
                    files.insert(path, plugin);
                    PYSTATUS.files = Some(files);
                }
            }
        }
    }

    pub fn verify_file(path: &PathBuf) -> bool {
        unsafe {
            match PYSTATUS.files.as_ref() {
                Some(files) => match files.get(path) {
                    Some(plugin) => plugin.verifiy(),
                    None => false,
                },
                None => false,
            }
        }
    }
}

pub static mut PYSTATUS: PyStatus = PyStatus { files: None };

pub fn load_py_plugins(path: &PathBuf) {
    if path.exists() {
        info!("finding plugins in: {:?}", path);
        // 搜索所有的 py 文件 和 文件夹单层下面的 py 文件
        match path.read_dir() {
            Err(e) => {
                warn!("failed to read plugin path: {:?}", e);
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
        warn!("plugin path not exists: {:?}", path);
    }
    info!(
        "python 插件目录: {:?} 加载完成, 加载到 {} 个插件",
        path,
        PyStatus::get_files().len()
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
    let span = span!(Level::INFO, "Init Python Plugin");
    let _enter = span.enter();

    let global_config = MainStatus::global_config().py();

    debug!("initing python threads");
    pyo3::prepare_freethreaded_python();

    let plugin_path = PathBuf::from(global_config.plugin_path);
    load_py_plugins(&plugin_path);
    debug!("python 插件列表: {:#?}", PyStatus::get_files());

    info!("python inited")
}
