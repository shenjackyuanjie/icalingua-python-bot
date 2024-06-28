use std::path::PathBuf;

use pyo3::prelude::*;
use rust_socketio::asynchronous::Client;
use tracing::{event, info, warn, Level};

use crate::data_struct::{ica, tailchat};
use crate::error::PyPluginError;
use crate::py::{class, PyPlugin, PyStatus};
use crate::MainStatus;

pub fn get_func<'py>(
    py_module: &Bound<'py, PyAny>,
    name: &'py str,
) -> Result<Bound<'py, PyAny>, PyPluginError> {
    // 要处理的情况:
    // 1. 有这个函数
    // 2. 没有这个函数
    // 3. 函数不是 Callable
    match py_module.hasattr(name) {
        Ok(contain) => {
            if contain {
                match py_module.getattr(name) {
                    Ok(func) => {
                        if func.is_callable() {
                            Ok(func)
                        } else {
                            // warn!("function<{}>: {:#?} in {:?} is not callable", name, func, path);
                            Err(PyPluginError::FuncNotCallable(
                                name.to_string(),
                                py_module.getattr("__name__").unwrap().extract::<String>().unwrap(),
                            ))
                        }
                    }
                    Err(e) => {
                        // warn!("failed to get function<{}> from {:?}: {:?}", name, path, e);
                        Err(PyPluginError::CouldNotGetFunc(
                            e,
                            name.to_string(),
                            py_module.getattr("__name__").unwrap().extract::<String>().unwrap(),
                        ))
                    }
                }
            } else {
                // debug!("no function<{}> in module {:?}", name, path);
                Err(PyPluginError::FuncNotFound(
                    name.to_string(),
                    py_module.getattr("__name__").unwrap().extract::<String>().unwrap(),
                ))
            }
        }
        Err(e) => {
            // warn!("failed to check function<{}> from {:?}: {:?}", name, path, e);
            Err(PyPluginError::CouldNotGetFunc(
                e,
                name.to_string(),
                py_module.getattr("__name__").unwrap().extract::<String>().unwrap(),
            ))
        }
    }
}

pub fn verify_plugins() {
    let mut need_reload_files: Vec<PathBuf> = Vec::new();
    let plugin_path = MainStatus::global_config().py().plugin_path.clone();

    for entry in std::fs::read_dir(plugin_path).unwrap().flatten() {
        let path = entry.path();
        if let Some(ext) = path.extension() {
            if ext == "py" && !PyStatus::verify_file(&path) {
                need_reload_files.push(path);
            }
        }
    }

    if need_reload_files.is_empty() {
        return;
    }
    info!("file change list: {:?}", need_reload_files);
    for reload_file in need_reload_files {
        match PyPlugin::new_from_path(&reload_file) {
            Some(plugin) => {
                PyStatus::add_file(reload_file.clone(), plugin);
                info!("重载 Python 插件: {:?}", reload_file);
            }
            None => {
                warn!("重载 Python 插件: {:?} 失败", reload_file);
            }
        }
    }
}

pub const ICA_NEW_MESSAGE_FUNC: &str = "on_ica_message";
pub const ICA_DELETE_MESSAGE_FUNC: &str = "on_ica_delete_message";

pub const TAILCHAT_NEW_MESSAGE_FUNC: &str = "on_tailchat_message";

macro_rules! call_py_func {
    ($args:expr, $plugin:expr, $plugin_path:expr, $func_name:expr, $client:expr) => {
        tokio::spawn(async move {
            Python::with_gil(|py| {
                if let Ok(py_func) = get_func($plugin.py_module.bind(py), $func_name) {
                    if let Err(py_err) = py_func.call1($args) {
                        let e = PyPluginError::FuncCallError(
                            py_err,
                            $func_name.to_string(),
                            $plugin_path.to_string_lossy().to_string(),
                        );
                        event!(
                            Level::WARN,
                            "failed to call function<{}>: {}\ntraceback: {}",
                            $func_name,
                            e,
                            // 获取 traceback
                            match &e {
                                PyPluginError::FuncCallError(py_err, _, _) => match py_err.traceback_bound(py) {
                                    Some(traceback) => match traceback.format() {
                                        Ok(trace) => trace,
                                        Err(trace_e) => format!("failed to format traceback: {:?}", trace_e),
                                    },
                                    None => "no traceback".to_string(),
                                },
                                _ => unreachable!(),
                            }
                        );
                    }
                }
            })
        })
    };
}

/// 执行 new message 的 python 插件
pub async fn ica_new_message_py(message: &ica::messages::NewMessage, client: &Client) {
    // 验证插件是否改变
    verify_plugins();

    let plugins = PyStatus::get_files();
    for (path, plugin) in plugins.iter() {
        let msg = class::ica::NewMessagePy::new(message);
        let client = class::ica::IcaClientPy::new(client);
        let args = (msg, client);
        // 甚至实际上压根不需要await这个spawn, 直接让他自己跑就好了(离谱)
        call_py_func!(args, plugin, path, ICA_NEW_MESSAGE_FUNC, client);
    }
}

pub async fn ica_delete_message_py(msg_id: ica::MessageId, client: &Client) {
    verify_plugins();

    let plugins = PyStatus::get_files();
    for (path, plugin) in plugins.iter() {
        let msg_id = msg_id.clone();
        let client = class::ica::IcaClientPy::new(client);
        let args = (msg_id.clone(), client);
        call_py_func!(args, plugin, path, ICA_DELETE_MESSAGE_FUNC, client);
    }
}

pub async fn tailchat_new_message_py(
    message: &tailchat::messages::ReceiveMessage,
    client: &Client,
) {
    verify_plugins();

    let plugins = PyStatus::get_files();
    for (path, plugin) in plugins.iter() {
        let msg = class::tailchat::TailchatReceiveMessagePy::from_recive_message(message);
        let client = class::tailchat::TailchatClientPy::new(client);
        let args = (msg, client);
        call_py_func!(args, plugin, path, TAILCHAT_NEW_MESSAGE_FUNC, client);
    }
}
