use pyo3::prelude::*;
use tracing::{debug, info, warn};
use rust_socketio::asynchronous::Client;
use tokio::runtime::Runtime;

use crate::client::send_message;
use crate::data_struct::messages::{NewMessage, ReplyMessage, SendMessage};
use crate::ClientStatus;

#[pyclass]
#[pyo3(name = "IcaStatus")]
pub struct IcaStatusPy {}

#[pymethods]
impl IcaStatusPy {
    #[new]
    pub fn py_new() -> Self {
        Self {}
    }

    #[getter]
    pub fn get_login(&self) -> bool {
        unsafe { ClientStatus.login }
    }

    #[getter]
    pub fn get_online(&self) -> bool {
        unsafe {
            match ClientStatus.online_data.as_ref() {
                Some(data) => data.online,
                None => false,
            }
        }
    }

    #[getter]
    pub fn get_self_id(&self) -> Option<i64> {
        unsafe {
            match ClientStatus.online_data.as_ref() {
                Some(data) => Some(data.qqid),
                None => None,
            }
        }
    }

    #[getter]
    pub fn get_nick_name(&self) -> Option<String> {
        unsafe {
            match ClientStatus.online_data.as_ref() {
                Some(data) => Some(data.nick.clone()),
                None => None,
            }
        }
    }

    #[getter]
    pub fn get_ica_version(&self) -> Option<String> {
        unsafe {
            match ClientStatus.online_data.as_ref() {
                Some(data) => Some(data.icalingua_info.ica_version.clone()),
                None => None,
            }
        }
    }

    #[getter]
    pub fn get_os_info(&self) -> Option<String> {
        unsafe {
            match ClientStatus.online_data.as_ref() {
                Some(data) => Some(data.icalingua_info.os_info.clone()),
                None => None,
            }
        }
    }

    #[getter]
    pub fn get_resident_set_size(&self) -> Option<String> {
        unsafe {
            match ClientStatus.online_data.as_ref() {
                Some(data) => Some(data.icalingua_info.resident_set_size.clone()),
                None => None,
            }
        }
    }

    #[getter]
    pub fn get_heap_used(&self) -> Option<String> {
        unsafe {
            match ClientStatus.online_data.as_ref() {
                Some(data) => Some(data.icalingua_info.heap_used.clone()),
                None => None,
            }
        }
    }

    #[getter]
    pub fn get_load(&self) -> Option<String> {
        unsafe {
            match ClientStatus.online_data.as_ref() {
                Some(data) => Some(data.icalingua_info.load.clone()),
                None => None,
            }
        }
    }
}

impl IcaStatusPy {
    pub fn new() -> Self {
        Self {}
    }
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

    pub fn __str__(&self) -> String {
        format!("{:?}", self.msg)
    }

    #[getter]
    pub fn get_content(&self) -> String {
        self.msg.content.clone()
    }
    #[getter]
    pub fn get_sender_id(&self) -> i64 {
        self.msg.sender_id
    }
    #[getter]
    pub fn get_is_from_self(&self) -> bool {
        self.msg.is_from_self()
    }
}

impl NewMessagePy {
    pub fn new(msg: &NewMessage) -> Self {
        Self { msg: msg.clone() }
    }
}

#[pyclass]
#[pyo3(name = "ReplyMessage")]
pub struct ReplyMessagePy {
    pub msg: ReplyMessage,
}

#[pymethods]
impl ReplyMessagePy {
    pub fn __str__(&self) -> String {
        format!("{:?}", self.msg)
    }
}

impl ReplyMessagePy {
    pub fn new(msg: ReplyMessage) -> Self {
        Self { msg }
    }
}

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "SendMessage")]
pub struct SendMessagePy {
    pub msg: SendMessage,
}

#[pymethods]
impl SendMessagePy {
    pub fn __str__(&self) -> String {
        format!("{:?}", self.msg)
    }
}

impl SendMessagePy {
    pub fn new(msg: SendMessage) -> Self {
        Self { msg }
    }
}

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "IcaClient")]
pub struct IcaClientPy {
    pub client: Client,
}

#[pymethods]
impl IcaClientPy {
    // fn send_message(&self, message: SendMessagePy) -> bool {
    //     // Some(send_message(&self.client, &message.msg).await)
    //     true
    //     // // Ok(send_message(&self.client, &message.msg).await)
    //     // let mut future;
    //     // Python::with_gil(|gil| {
    //     //     let this = self_.borrow(gil);
    //     //     future = send_message(&this.client, &message.msg);
    //     // });
    //     // Ok(future.await)
    // }
    pub fn send_message(&self, message: SendMessagePy) -> bool {
        // let handle = tokio::runtime::Handle::current();
        // handle.block_on(send_message(&self.client, &message.msg))
        tokio::task::block_in_place(|| {
            let rt = Runtime::new().unwrap();
            rt.block_on(send_message(&self.client, &message.msg))
        })
    }

    #[staticmethod]
    pub fn send_message_a(
        py: Python,
        client: IcaClientPy,
        message: SendMessagePy,
    ) -> PyResult<&PyAny> {
        // send_message(&client.client, &message.msg).await
        pyo3_asyncio::tokio::future_into_py(py, async move {
            Ok(send_message(&client.client, &message.msg).await)
        })
    }

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
