use pyo3::prelude::*;

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

#[pyclass]
#[pyo3(name = "NewMessage")]
pub struct NewMessagePy {
    pub msg: NewMessage,
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

impl ReplyMessagePy {
    pub fn new(msg: ReplyMessage) -> Self {
        Self { msg }
    }
}

#[pyclass]
#[pyo3(name = "SendMessage")]
pub struct SendMessagePy {
    pub msg: SendMessage,
}

impl SendMessagePy {
    pub fn new(msg: SendMessage) -> Self {
        Self { msg }
    }
}
