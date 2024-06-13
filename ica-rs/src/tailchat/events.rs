use colored::Colorize;
use rust_socketio::asynchronous::Client;
use rust_socketio::{Event, Payload};
use tracing::info;

use crate::data_struct::tailchat::messages::ReciveMessage;
use crate::data_struct::tailchat::status::UpdateDMConverse;
use crate::tailchat::client::{emit_join_room, send_message};

/// 所有
pub async fn any_event(event: Event, payload: Payload, _client: Client) {
    let handled = [
        // 真正处理过的
        "notify:chat.message.add",
        "notify:chat.message.delete",
        "notify:chat.converse.updateDMConverse",
        // 也许以后会用到
        "notify:chat.message.update",
        "notify:chat.message.addReaction",
        "notify:chat.message.removeReaction",
        // 忽略的
        "notify:chat.inbox.append", // 被 @ 之类的事件
    ];
    match &event {
        Event::Custom(event_name) => {
            if handled.contains(&event_name.as_str()) {
                return;
            }
        }
        Event::Message => {
            match payload {
                Payload::Text(values) => {
                    if let Some(value) = values.first() {
                        if handled.contains(&value.as_str().unwrap()) {
                            return;
                        }
                        info!("收到消息 {}", value.to_string().yellow());
                    }
                }
                _ => {
                    return;
                }
            }
            return;
        }
        _ => (),
    }
    match payload {
        Payload::Binary(ref data) => {
            println!("event: {} |{:?}", event, data)
        }
        Payload::Text(ref data) => {
            print!("event: {}", event.as_str().purple());
            for value in data {
                println!("|{}", value);
            }
        }
        _ => (),
    }
}

#[allow(clippy::collapsible_if)]
pub async fn on_message(payload: Payload, client: Client) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            let message: ReciveMessage = match serde_json::from_value(value.clone()) {
                Ok(v) => v,
                Err(e) => {
                    info!("tailchat_msg {}", value.to_string().red());
                    info!("tailchat_msg {}", format!("{:?}", e).red());
                    return;
                }
            };
            info!("tailchat_msg {}", message.to_string().cyan());

            if !message.is_reply() {
                if message.content == "/bot-rs" {
                    let reply = message.reply_with(&format!(
                        "shenbot v{}\ntailchat-async-rs pong v{}",
                        crate::VERSION,
                        crate::TAILCHAT_VERSION
                    ));
                    send_message(&client, &reply).await;
                }
            }
            crate::py::call::tailchat_new_message_py(&message, &client).await;
        }
    }
}
pub async fn on_msg_delete(payload: Payload, _client: Client) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            info!("删除消息 {}", value.to_string().red());
        }
    }
}

pub async fn on_converse_update(payload: Payload, client: Client) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            emit_join_room(&client).await;
            let update_info: UpdateDMConverse = match serde_json::from_value(value.clone()) {
                Ok(value) => value,
                Err(e) => {
                    info!("tailchat updateDMConverse {}", value.to_string().red());
                    info!("tailchat updateDMConverse {}", format!("{:?}", e).red());
                    return;
                }
            };
            info!("更新会话 {}", format!("{:?}", update_info).cyan());
        }
    }
}
