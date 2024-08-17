use std::path::PathBuf;
use std::sync::Arc;

use colored::Colorize;
use rust_socketio::asynchronous::Client;
use rust_socketio::{Event, Payload};
use tracing::{event, info, Level};

use crate::data_struct::tailchat::messages::ReceiveMessage;
use crate::data_struct::tailchat::status::{BotStatus, UpdateDMConverse};
use crate::tailchat::client::{emit_join_room, send_message};
use crate::{help_msg, py, MainStatus, TAILCHAT_VERSION, VERSION};

/// 所有
pub async fn any_event(event: Event, payload: Payload, _client: Client, _status: Arc<BotStatus>) {
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

pub async fn on_message(payload: Payload, client: Client, _status: Arc<BotStatus>) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            let message: ReceiveMessage = match serde_json::from_value(value.clone()) {
                Ok(v) => v,
                Err(e) => {
                    event!(Level::WARN, "tailchat_msg {}", value.to_string().red());
                    event!(Level::WARN, "tailchat_msg {}", format!("{:?}", e).red());
                    return;
                }
            };
            event!(Level::INFO, "tailchat_msg {}", message.to_string().yellow());

            if !message.is_reply() {
                if message.content == "/bot-rs" {
                    let reply = message.reply_with(&format!(
                        "shenbot v{}\ntailchat-async-rs pong v{}",
                        VERSION, TAILCHAT_VERSION
                    ));
                    send_message(&client, &reply).await;
                } else if message.content == "/bot-ls" {
                    let reply = message.reply_with(&format!(
                        "shenbot-py v{}\n{}",
                        VERSION,
                        if MainStatus::global_config().check_py() {
                            py::PyStatus::display()
                        } else {
                            "未启用 Python 插件".to_string()
                        }
                    ));
                    send_message(&client, &reply).await;
                } else if message.content == "/bot-help" {
                    let reply = message.reply_with(&help_msg());
                    send_message(&client, &reply).await;
                }
                if MainStatus::global_config().tailchat().admin_list.contains(&message.sender_id) {
                    // admin 区
                    if message.content.starts_with("/bot-enable") {
                        // 先判定是否为 admin
                        // 尝试获取后面的信息
                        let mut content = message.content.split_whitespace();
                        content.next();
                        if let Some(name) = content.next() {
                            let path_name = PathBuf::from(name);
                            match py::PyStatus::get_status(&path_name) {
                                None => {
                                    let reply = message.reply_with("未找到插件");
                                    send_message(&client, &reply).await;
                                }
                                Some(true) => {
                                    let reply = message.reply_with("无变化, 插件已经启用");
                                    send_message(&client, &reply).await;
                                }
                                Some(false) => {
                                    py::PyStatus::set_status(&path_name, true);
                                    let reply = message.reply_with("启用插件完成");
                                    send_message(&client, &reply).await;
                                }
                            }
                        }
                    } else if message.content.starts_with("/bot-disable") {
                        let mut content = message.content.split_whitespace();
                        content.next();
                        if let Some(name) = content.next() {
                            let path_name = PathBuf::from(name);
                            match py::PyStatus::get_status(&path_name) {
                                None => {
                                    let reply = message.reply_with("未找到插件");
                                    send_message(&client, &reply).await;
                                }
                                Some(false) => {
                                    let reply = message.reply_with("无变化, 插件已经禁用");
                                    send_message(&client, &reply).await;
                                }
                                Some(true) => {
                                    py::PyStatus::set_status(&path_name, false);
                                    let reply = message.reply_with("禁用插件完成");
                                    send_message(&client, &reply).await;
                                }
                            }
                        }
                    }
                }
            }
            py::call::tailchat_new_message_py(&message, &client).await;
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
                    event!(Level::WARN, "tailchat updateDMConverse {}", value.to_string().red());
                    event!(Level::WARN, "tailchat updateDMConverse {}", format!("{:?}", e).red());
                    return;
                }
            };
            info!("更新会话 {}", format!("{:?}", update_info).cyan());
        }
    }
}
