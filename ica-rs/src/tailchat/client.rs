use crate::data_struct::tailchat::messages::SendingMessage;
// use crate::data_struct::tailchat::{ConverseId, GroupId, MessageId, UserId};

use rust_socketio::asynchronous::Client;

use colored::Colorize;
use serde_json::Value;
use tracing::{debug, warn};

pub async fn send_message(client: &Client, message: &SendingMessage) -> bool {
    let value: Value = message.as_value();
    match client.emit("chat.message.sendMessage", value).await {
        Ok(_) => {
            debug!("send_message {}", format!("{:#?}", message).cyan());
            true
        }
        Err(e) => {
            warn!("send_message faild:{}", format!("{:#?}", e).red());
            false
        }
    }
}
