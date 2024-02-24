pub mod call;
pub mod class;

use std::time::SystemTime;
use std::{collections::HashMap, path::PathBuf};

use pyo3::prelude::*;
use tracing::{debug, info, warn};

use crate::client::IcalinguaStatus;
use crate::config::IcaConfig;

#[derive(Debug, Clone)]
pub struct PyStatus {
    pub files: Option<HashMap<PathBuf, (Option<SystemTime>, Py<PyAny>)>>,
}

impl PyStatus {
    pub fn get_files() -> &'static HashMap<PathBuf, (Option<SystemTime>, Py<PyAny>)> {
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

    pub fn add_file(path: PathBuf, changed_time: Option<SystemTime>, py_module: Py<PyAny>) {
        unsafe {
            match PYSTATUS.files.as_mut() {
                Some(files) => {
                    files.insert(path, (changed_time, py_module));
                }
                None => {
                    let mut files = HashMap::new();
                    files.insert(path, (changed_time, py_module));
                    PYSTATUS.files = Some(files);
                }
            }
        }
    }

    pub fn verify_file(path: &PathBuf) -> bool {
        unsafe {
            match PYSTATUS.files.as_ref() {
                Some(files) => match files.get(path) {
                    Some((changed_time, _)) => {
                        if let Some(changed_time) = changed_time {
                            if let Some(new_changed_time) = get_change_time(path) {
                                if new_changed_time != *changed_time {
                                    return false;
                                }
                            }
                        }
                        true
                    }
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
                    if let Ok(entry) = entry {
                        let path = entry.path();
                        if let Some(ext) = path.extension() {
                            if ext == "py" {
                                match load_py_module(&path) {
                                    Some((changed_time, py_module)) => {
                                        PyStatus::add_file(path.clone(), changed_time, py_module);
                                    }
                                    None => {
                                        warn!("加载 Python 插件: {:?} 失败", path);
                                    }
                                }
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

pub fn verify_plugins() {
    let mut need_reload_files: Vec<PathBuf> = Vec::new();
    let plugin_path = IcalinguaStatus::get_config()
        .py_plugin_path
        .as_ref()
        .unwrap()
        .to_owned();
    for entry in std::fs::read_dir(&plugin_path).unwrap() {
        if let Ok(entry) = entry {
            let path = entry.path();
            if let Some(ext) = path.extension() {
                if ext == "py" {
                    if !PyStatus::verify_file(&path) {
                        need_reload_files.push(path);
                    }
                }
            }
        }
    }

    if need_reload_files.is_empty() {
        return;
    }
    info!("file change list: {:?}", need_reload_files);
    for reload_file in need_reload_files {
        match load_py_module(&reload_file) {
            Some((changed_time, py_module)) => {
                PyStatus::add_file(reload_file.clone(), changed_time, py_module);
            }
            None => {
                warn!("重载 Python 插件: {:?} 失败", reload_file);
            }
        }
    }
}

pub fn get_change_time(path: &PathBuf) -> Option<SystemTime> {
    path.metadata().ok()?.modified().ok()
}

/// 传入文件路径
/// 返回 hash 和 文件内容
pub fn load_py_file(path: &PathBuf) -> std::io::Result<(Option<SystemTime>, String)> {
    let changed_time = get_change_time(&path);
    let content = std::fs::read_to_string(path)?;
    Ok((changed_time, content))
}

pub fn load_py_module(path: &PathBuf) -> Option<(Option<SystemTime>, Py<PyAny>)> {
    let (changed_time, content) = match load_py_file(&path) {
        Ok((changed_time, content)) => (changed_time, content),
        Err(e) => {
            warn!("failed to load file: {:?} | e: {:?}", path, e);
            return None;
        }
    };
    let py_module: PyResult<Py<PyAny>> = Python::with_gil(|py| -> PyResult<Py<PyAny>> {
        let module: PyResult<Py<PyAny>> = PyModule::from_code(
            py,
            &content,
            &path.to_string_lossy(),
            &path.to_string_lossy(),
            // !!!! 请注意, 一定要给他一个名字, cpython 会自动把后面的重名模块覆盖掉前面的
        )
        .map(|module| module.into());
        module
    });
    match py_module {
        Ok(py_module) => Some((changed_time, py_module)),
        Err(e) => {
            warn!("failed to load file: {:?} | e: {:?}", path, e);
            None
        }
    }
}

pub fn init_py(config: &IcaConfig) {
    debug!("initing python threads");
    pyo3::prepare_freethreaded_python();
    if let Some(plugin_path) = &config.py_plugin_path {
        let path = PathBuf::from(plugin_path);
        load_py_plugins(&path);
        debug!("python 插件列表: {:#?}", PyStatus::get_files());
    }

    info!("python inited")
}
