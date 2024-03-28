use std::path::PathBuf;

use pyo3::prelude::*;
use rust_socketio::asynchronous::Client;
use tracing::{debug, info, warn};

use crate::data_struct::ica::messages::NewMessage;
use crate::data_struct::ica::MessageId;
use crate::py::{class, PyPlugin, PyStatus};
use crate::MainStatus;

pub fn get_func<'py>(py_module: &'py PyAny, path: &PathBuf, name: &'py str) -> Option<&'py PyAny> {
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
                            Some(func)
                        } else {
                            warn!("function<{}>: {:#?} in {:?} is not callable", name, func, path);
                            None
                        }
                    }
                    Err(e) => {
                        warn!("failed to get function<{}> from {:?}: {:?}", name, path, e);
                        None
                    }
                }
            } else {
                debug!("no function<{}> in module {:?}", name, path);
                None
            }
        }
        Err(e) => {
            warn!("failed to check function<{}> from {:?}: {:?}", name, path, e);
            None
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

/// 执行 newpub const MATRIX_NEW_MESSAGE_FUNC: &str = "on_matrix_message";

/// 执行 new message 的 python 插件
pub async fn ica_new_message_py(message: &NewMessage, client: &Client) {
    // 验证插件是否改变
    verify_plugins();

    let plugins = PyStatus::get_files();
    for (path, plugin) in plugins.iter() {
        let msg = class::ica::NewMessagePy::new(message);
        let client = class::ica::IcaClientPy::new(client);
        let args = (msg, client);
        // 甚至实际上压根不需要await这个spawn, 直接让他自己跑就好了(离谱)
        tokio::spawn(async move {
            Python::with_gil(|py| {
                if let Some(py_func) =
                    get_func(plugin.py_module.as_ref(py), path, ICA_NEW_MESSAGE_FUNC)
                {
                    if let Err(e) = py_func.call1(args) {
                        warn!("failed to call function<{}>: {:?}", ICA_NEW_MESSAGE_FUNC, e);
                    }
                }
            })
        });
    }
}

pub async fn ica_delete_message_py(msg_id: MessageId, client: &Client) {
    verify_plugins();

    let plugins = PyStatus::get_files();
    for (path, plugin) in plugins.iter() {
        let msg_id = msg_id.clone();
        let client = class::ica::IcaClientPy::new(client);
        let args = (msg_id.clone(), client);
        tokio::spawn(async move {
            Python::with_gil(|py| {
                if let Some(py_func) =
                    get_func(plugin.py_module.as_ref(py), path, ICA_DELETE_MESSAGE_FUNC)
                {
                    if let Err(e) = py_func.call1(args) {
                        warn!("failed to call function<{}>: {:?}", ICA_DELETE_MESSAGE_FUNC, e);
                    }
                }
            })
        });
    }
}
