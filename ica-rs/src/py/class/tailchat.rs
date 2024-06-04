use pyo3::prelude::*;

use rust_socketio::asynchronous::Client;
use tracing::{debug, info, warn};

use crate::data_struct::tailchat::messages::{ReciveMessage, SendingMessage};
use crate::data_struct::tailchat::{ConverseId, GroupId, MessageId, UserId};
use crate::tailchat::client::send_message;

#[pyclass]
#[pyo3(name = "TailchatClient")]
pub struct TailchatClientPy {
    pub client: Client,
}

impl TailchatClientPy {
    pub fn new(client: &Client) -> Self {
        Self {
            client: client.clone(),
        }
    }
}

#[pyclass]
#[pyo3(name = "TailchatStatus")]
/// 预留?
pub struct TailchatStatusPy {}

#[pyclass]
#[pyo3(name = "TailchatReciveMessage")]
pub struct TailchatReciveMessagePy {
    pub message: ReciveMessage,
}

impl TailchatReciveMessagePy {
    pub fn from_recive_message(msg: &ReciveMessage) -> Self {
        Self {
            message: msg.clone(),
        }
    }
}

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "TailchatSendingMessage")]
pub struct TailchatSendingMessagePy {
    pub message: SendingMessage,
}

#[pymethods]
impl TailchatClientPy {
    pub fn send_message(&self, message: TailchatSendingMessagePy) -> bool {
        tokio::task::block_in_place(|| {
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(send_message(&self.client, &message.message))
        })
    }

    pub fn send_and_warn(&self, message: TailchatSendingMessagePy) -> bool {
        warn!("{}", message.message.content);
        self.send_message(message)
    }
    #[getter]
    pub fn get_version(&self) -> String { crate::VERSION.to_string() }
    #[getter]
    pub fn get_tailchat_version(&self) -> String { crate::TAILCHAT_VERSION.to_string() }
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

#[pymethods]
impl TailchatReciveMessagePy {
    #[getter]
    pub fn get_is_reply(&self) -> bool { self.message.is_reply() }
    #[getter]
    pub fn get_msg_id(&self) -> MessageId { self.message.msg_id.clone() }
    #[getter]
    pub fn get_content(&self) -> String { self.message.content.clone() }
    #[getter]
    pub fn get_sender_id(&self) -> UserId { self.message.sender_id.clone() }
    #[getter]
    pub fn get_group_id(&self) -> GroupId { self.message.group_id.clone() }
    #[getter]
    pub fn get_converse_id(&self) -> ConverseId { self.message.converse_id.clone() }
    /// 作为回复
    pub fn as_reply(&self) -> TailchatSendingMessagePy {
        TailchatSendingMessagePy {
            message: self.message.as_reply(),
        }
    }
    pub fn reply_with(&self, content: String) -> TailchatSendingMessagePy {
        TailchatSendingMessagePy {
            message: self.message.reply_with(&content),
        }
    }
}

#[pymethods]
impl TailchatSendingMessagePy {
    #[getter]
    pub fn get_content(&self) -> String { self.message.content.clone() }
    #[setter]
    pub fn set_content(&mut self, content: String) { self.message.content = content; }
    #[getter]
    pub fn get_converse_id(&self) -> ConverseId { self.message.converse_id.clone() }
    #[getter]
    pub fn get_group_id(&self) -> GroupId { self.message.group_id.clone() }
    pub fn with_content(&mut self, content: String) -> Self {
        self.message.content = content;
        self.clone()
    }
}
