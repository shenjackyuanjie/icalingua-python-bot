use colored::Colorize;
use rust_socketio::asynchronous::Client;
use rust_socketio::{Event, Payload};
use tracing::info;

use crate::data_struct::tailchat::messages::ReciveMessage;

/// 所有
pub async fn any_event(event: Event, payload: Payload, _client: Client) {
    let handled = [
        // 真正处理过的
        "notify:chat.message.add",
        "notify:chat.message.delete",
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

pub async fn on_message(payload: Payload, _client: Client) {
    match payload {
        Payload::Text(values) => {
            if let Some(value) = values.first() {
                let message: ReciveMessage = serde_json::from_value(value.clone()).unwrap();
                info!("收到消息 {:?}", message);
            }
        }
        _ => (),
    }
}
pub async fn on_msg_delete(payload: Payload, _client: Client) {
    match payload {
        Payload::Text(values) => {
            if let Some(value) = values.first() {
                info!("删除消息 {}", value.to_string().red());
            }
        }
        _ => (),
    }
}
