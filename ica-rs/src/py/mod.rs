pub mod class;

use std::time::SystemTime;
use std::{collections::HashMap, path::PathBuf};

use pyo3::{prelude::*, types::IntoPyDict};
use rust_socketio::asynchronous::Client;
use tracing::{debug, info, warn};

use crate::config::IcaConfig;
use crate::data_struct::messages::NewMessage;

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
                    debug!("No files in py status");
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

    pub fn verify_file(path: &PathBuf, change_time: &Option<SystemTime>) -> bool {
        unsafe {
            match PYSTATUS.files.as_ref() {
                Some(files) => match files.get(path) {
                    Some((changed_time, _)) => change_time == changed_time,
                    None => false,
                },
                None => false,
            }
        }
    }
}

pub static mut PYSTATUS: PyStatus = PyStatus { files: None };

pub fn run() {
    Python::with_gil(|py| {
        let bot_status = class::IcaStatusPy::new();
        let _bot_status: &PyCell<_> = PyCell::new(py, bot_status).unwrap();

        let locals = [("state", _bot_status)].into_py_dict(py);
        py.run(
            "from pathlib import Path\nprint(Path.cwd())\nprint(state)",
            None,
            Some(locals),
        )
        .unwrap();
    });
}

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
                                match load_py_file(&path) {
                                    Ok((changed_time, content)) => {
                                        let py_module = Python::with_gil(|py| -> Py<PyAny> {
                                            let module: Py<PyAny> = PyModule::from_code(
                                                py,
                                                &content,
                                                &path.to_string_lossy(),
                                                "",
                                            )
                                            .unwrap()
                                            .into();
                                            module
                                        });
                                        PyStatus::add_file(path, changed_time, py_module);
                                    }
                                    Err(e) => {
                                        warn!("failed to load file: {:?} | e: {:?}", path, e);
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

/// 执行 new message 的 python 插件
pub async fn new_message_py(message: &NewMessage, client: &Client) {
    let cwd = std::env::current_dir().unwrap();
    let plugins = PyStatus::get_files();
    for (path, (_, py_module)) in plugins.iter() {
        // 切换工作目录到运行的插件的位置
        if let Err(e) = std::env::set_current_dir(path.parent().unwrap()) {
            warn!("failed to set current dir: {:?}", e);
        }
        Python::with_gil(|py| {
            let msg = class::NewMessagePy::new(message);
            let client = class::IcaClientPy::new(client);
            let args = (msg, client);
            let async_py_func = py_module.getattr(py, "on_message");
            match async_py_func {
                Ok(async_py_func) => {
                    async_py_func.as_ref(py).call1(args).unwrap();
                }
                Err(e) => {
                    warn!("failed to get on_message function: {:?}", e);
                }
            }
        });
    }
    // 最后切换回来
    if let Err(e) = std::env::set_current_dir(cwd) {
        warn!("failed to set current dir: {:?}", e);
    }
}
