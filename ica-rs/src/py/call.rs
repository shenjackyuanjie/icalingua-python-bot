use std::path::PathBuf;

use pyo3::prelude::*;
use rust_socketio::asynchronous::Client;
use tracing::{debug, warn};

use crate::data_struct::messages::NewMessage;
use crate::data_struct::MessageId;
use crate::py::{class, verify_plugins, PyStatus};

pub fn get_func<'a>(py_module: &'a PyAny, path: &PathBuf, name: &'a str) -> Option<&'a PyAny> {
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

/// 执行 new message 的 python 插件
pub async fn new_message_py(message: &NewMessage, client: &Client) {
    // 验证插件是否改变
    verify_plugins();

    let plugins = PyStatus::get_files();
    for (path, (_, py_module)) in plugins.iter() {
        let msg = class::NewMessagePy::new(message);
        let client = class::IcaClientPy::new(client);
        // 甚至实际上压根不需要await这个spawn, 直接让他自己跑就好了(离谱)
        tokio::spawn(async move {
            Python::with_gil(|py| {
                let args = (msg, client);
                if let Some(py_func) = get_func(py_module.as_ref(py), &path, "on_message") {
                    if let Err(e) = py_func.call1(args) {
                        warn!("failed to call function<on_new_message>: {:?}", e);
                    }
                }
            })
        });
    }
}

pub async fn delete_message_py(msg_id: MessageId, client: &Client) {
    verify_plugins();
    let plugins = PyStatus::get_files();
    for (path, (_, py_module)) in plugins.iter() {
        let msg_id = msg_id.clone();
        let client = class::IcaClientPy::new(client);
        tokio::spawn(async move {
            Python::with_gil(|py| {
                let args = (msg_id.clone(), client);
                if let Some(py_func) = get_func(py_module.as_ref(py), &path, "on_delete_message") {
                    if let Err(e) = py_func.call1(args) {
                        warn!("failed to call function<on_delete_message>: {:?}", e);
                    }
                }
            })
        });
    }
}
