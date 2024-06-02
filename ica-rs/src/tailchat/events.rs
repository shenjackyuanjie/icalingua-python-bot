use colored::Colorize;
use rust_socketio::asynchronous::Client;
use rust_socketio::{Event, Payload};
use serde_json::json;
use tracing::info;

/// 所有
pub async fn any_event(event: Event, payload: Payload, _client: Client) {
    let handled = [
        // 真正处理过的
        "chat.message.sendMessage",
        // "notify:chat.message.add",
        // 也许以后会用到

        // 忽略的
    ];
    println!("event: {:?}", event);
    println!("payload: {:?}", payload);
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

pub async fn on_message(payload: Payload, client: Client) {
    match payload {
        Payload::Text(values) => {
            if let Some(value) = values.first() {
                info!("收到消息 {}", value.to_string().yellow());
            }
        }
        _ => (),
    }
}

pub async fn on_connect(payload: Payload, client: Client) {
    let _ = client.emit("chat.converse.findAndJoinRoom", json! {[]}).await;
    info!("连接成功 {:?}", payload);
}
