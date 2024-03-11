use pyo3::prelude::*;
use rust_socketio::asynchronous::Client;
use tokio::runtime::Runtime;
use toml::Value as TomlValue;
use tracing::{debug, info, warn};

use crate::client::{delete_message, send_message, BotStatus};
use crate::data_struct::messages::{
    DeleteMessage, MessageTrait, NewMessage, ReplyMessage, SendMessage,
};
use crate::data_struct::MessageId;
use crate::ClientStatus_Global;

#[pyclass]
#[pyo3(name = "IcaStatus")]
pub struct IcaStatusPy {}

#[pymethods]
impl IcaStatusPy {
    #[new]
    pub fn py_new() -> Self { Self {} }
    #[getter]
    pub fn get_login(&self) -> bool { unsafe { ClientStatus_Global.login } }
    #[getter]
    pub fn get_online(&self) -> bool { BotStatus::get_online_data().online }
    #[getter]
    pub fn get_self_id(&self) -> i64 { BotStatus::get_online_data().qqid }
    #[getter]
    pub fn get_nick_name(&self) -> String { BotStatus::get_online_data().nick.clone() }
    #[getter]
    pub fn get_loaded_messages_count(&self) -> u64 { BotStatus::get_loaded_messages_count() }
    #[getter]
    pub fn get_ica_version(&self) -> String {
        BotStatus::get_online_data().icalingua_info.ica_version.clone()
    }

    #[getter]
    pub fn get_os_info(&self) -> String {
        BotStatus::get_online_data().icalingua_info.os_info.clone()
    }

    #[getter]
    pub fn get_resident_set_size(&self) -> String {
        BotStatus::get_online_data().icalingua_info.resident_set_size.clone()
    }

    #[getter]
    pub fn get_heap_used(&self) -> String {
        BotStatus::get_online_data().icalingua_info.heap_used.clone()
    }

    #[getter]
    pub fn get_load(&self) -> String { BotStatus::get_online_data().icalingua_info.load.clone() }
}

impl IcaStatusPy {
    pub fn new() -> Self { Self {} }
}

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "NewMessage")]
pub struct NewMessagePy {
    pub msg: NewMessage,
}

#[pymethods]
impl NewMessagePy {
    pub fn reply_with(&self, content: String) -> SendMessagePy {
        SendMessagePy::new(self.msg.reply_with(&content))
    }
    pub fn as_deleted(&self) -> DeleteMessagePy { DeleteMessagePy::new(self.msg.as_deleted()) }
    pub fn __str__(&self) -> String { format!("{:?}", self.msg) }
    #[getter]
    pub fn get_id(&self) -> MessageId { self.msg.msg_id().clone() }
    #[getter]
    pub fn get_content(&self) -> String { self.msg.content().clone() }
    #[getter]
    pub fn get_sender_id(&self) -> i64 { self.msg.sender_id() }
    #[getter]
    pub fn get_is_from_self(&self) -> bool { self.msg.is_from_self() }
    #[getter]
    pub fn get_is_reply(&self) -> bool { self.msg.is_reply() }
}

impl NewMessagePy {
    pub fn new(msg: &NewMessage) -> Self { Self { msg: msg.clone() } }
}

#[pyclass]
#[pyo3(name = "ReplyMessage")]
pub struct ReplyMessagePy {
    pub msg: ReplyMessage,
}

#[pymethods]
impl ReplyMessagePy {
    pub fn __str__(&self) -> String { format!("{:?}", self.msg) }
}

impl ReplyMessagePy {
    pub fn new(msg: ReplyMessage) -> Self { Self { msg } }
}

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "SendMessage")]
pub struct SendMessagePy {
    pub msg: SendMessage,
}

#[pymethods]
impl SendMessagePy {
    pub fn __str__(&self) -> String { format!("{:?}", self.msg) }
    /// 设置消息内容
    /// 用于链式调用
    pub fn with_content(&mut self, content: String) -> Self {
        self.msg.content = content;
        self.clone()
    }
    #[getter]
    pub fn get_content(&self) -> String { self.msg.content.clone() }
    #[setter]
    pub fn set_content(&mut self, content: String) { self.msg.content = content; }
}

impl SendMessagePy {
    pub fn new(msg: SendMessage) -> Self { Self { msg } }
}

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "DeleteMessage")]
pub struct DeleteMessagePy {
    pub msg: DeleteMessage,
}

#[pymethods]
impl DeleteMessagePy {
    pub fn __str__(&self) -> String { format!("{:?}", self.msg) }
}

impl DeleteMessagePy {
    pub fn new(msg: DeleteMessage) -> Self { Self { msg } }
}

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "IcaClient")]
pub struct IcaClientPy {
    pub client: Client,
}

#[pymethods]
impl IcaClientPy {
    pub fn send_message(&self, message: SendMessagePy) -> bool {
        tokio::task::block_in_place(|| {
            let rt = Runtime::new().unwrap();
            rt.block_on(send_message(&self.client, &message.msg))
        })
    }

    pub fn send_and_warn(&self, message: SendMessagePy) -> bool {
        warn!(message.msg.content);
        tokio::task::block_in_place(|| {
            let rt = Runtime::new().unwrap();
            rt.block_on(send_message(&self.client, &message.msg))
        })
    }

    pub fn delete_message(&self, message: DeleteMessagePy) -> bool {
        tokio::task::block_in_place(|| {
            let rt = Runtime::new().unwrap();
            rt.block_on(delete_message(&self.client, &message.msg))
        })
    }

    /// 仅作占位
    /// (因为目前来说, rust调用 Python端没法启动一个异步运行时
    /// 所以只能 tokio::task::block_in_place 转换成同步调用)
    #[staticmethod]
    pub fn send_message_a(
        py: Python,
        client: IcaClientPy,
        message: SendMessagePy,
    ) -> PyResult<&PyAny> {
        pyo3_asyncio::tokio::future_into_py(py, async move {
            Ok(send_message(&client.client, &message.msg).await)
        })
    }

    #[getter]
    pub fn get_status(&self) -> IcaStatusPy { IcaStatusPy::new() }
    #[getter]
    pub fn get_version(&self) -> String { crate::VERSION.to_string() }

    pub fn debug(&self, content: String) {
        debug!("{}", content);
    }

    pub fn info(&self, content: String) {
        info!("{}", content);
    }

    pub fn warn(&self, content: String) {
        warn!("{}", content);
    }
}

impl IcaClientPy {
    pub fn new(client: &Client) -> Self {
        Self {
            client: client.clone(),
        }
    }
}

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "ConfigRequest")]
pub struct ConfigRequestPy {
    pub path: String,
}

#[pymethods]
impl ConfigRequestPy {
    #[new]
    pub fn py_new(path: String) -> Self { Self { path } }
}

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "ConfigData")]
pub struct ConfigDataPy {
    pub data: TomlValue,
}

#[pymethods]
impl ConfigDataPy {
    pub fn __getitem__(self_: PyRef<'_, Self>, key: String) -> Option<Py<PyAny>> {
        match self_.data.get(&key) {
            Some(value) => match value {
                TomlValue::String(s) => Some(s.into_py(self_.py())),
                TomlValue::Integer(i) => Some(i.into_py(self_.py())),
                TomlValue::Float(f) => Some(f.into_py(self_.py())),
                TomlValue::Boolean(b) => Some(b.into_py(self_.py())),
                TomlValue::Array(a) => {
                    let new_self = Self::new(TomlValue::Array(a.clone()));
                    let py_value = new_self.into_py(self_.py());
                    Some(py_value)
                }
                TomlValue::Table(t) => {
                    let new_self = Self::new(TomlValue::Table(t.clone()));
                    let py_value = new_self.into_py(self_.py());
                    Some(py_value)
                }
                _ => None,
            },
            None => None,
        }
    }
    pub fn have_key(&self, key: String) -> bool { self.data.get(&key).is_some() }
}

impl ConfigDataPy {
    pub fn new(data: TomlValue) -> Self { Self { data } }
}
