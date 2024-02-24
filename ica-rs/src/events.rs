use colored::Colorize;
use rust_socketio::asynchronous::Client;
use rust_socketio::{Event, Payload};
use tracing::{info, warn};

use crate::client::{send_message, IcalinguaStatus};
use crate::data_struct::all_rooms::Room;
use crate::data_struct::messages::{Message, MessageTrait, NewMessage};
use crate::data_struct::online_data::OnlineData;
use crate::{py, VERSION};

/// 获取在线数据
pub async fn get_online_data(payload: Payload, _client: Client) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            let online_data = OnlineData::new_from_json(value);
            info!("update_online_data {}", format!("{:?}", online_data).cyan());
            unsafe {
                crate::ClientStatus.update_online_data(online_data);
            }
        }
    }
}

/// 接收消息
pub async fn add_message(payload: Payload, client: Client) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            let message: NewMessage = serde_json::from_value(value.clone()).unwrap();
            // 检测是否在过滤列表内
            if IcalinguaStatus::get_config().filter_list.contains(&message.msg.sender_id) {
                return;
            }
            info!("add_message {}", message.to_string().cyan());
            // info!("add_message {}", format!("{:#?}", message).cyan());
            // 就在这里处理掉最基本的消息
            // 之后的处理交给插件
            if message.content().eq("/bot-rs") && !message.is_from_self() && !message.is_reply() {
                let reply = message.reply_with(&format!("ica-async-rs pong v{}", VERSION));
                send_message(&client, &reply).await;
            }
            // python 插件
            py::call::new_message_py(&message, &client).await;
        }
    }
}

/// 理论上不会用到 (因为依赖一个客户端去请求)
/// 但反正实际上还是我去请求, 所以只是暂时
/// 加载一个房间的所有消息
pub async fn set_messages(payload: Payload, _client: Client) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            println!("{:#?}", value);
            let messages: Vec<Message> = serde_json::from_value(value["messages"].clone()).unwrap();
            let room_id = value["roomId"].as_i64().unwrap();
            info!("set_messages {} len: {}", room_id.to_string().cyan(), messages.len());
        }
    }
}

/// 撤回消息
pub async fn delete_message(payload: Payload, client: Client) {
    if let Payload::Text(values) = payload {
        // 消息 id
        if let Some(value) = values.first() {
            if let Some(msg_id) = value.as_str() {
                info!("delete_message {}", format!("{}", msg_id).yellow());

                py::call::delete_message_py(msg_id.to_string(), &client).await;
            }
        }
    }
}

pub async fn update_all_room(payload: Payload, _client: Client) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            if let Some(raw_rooms) = value.as_array() {
                let rooms: Vec<Room> =
                    raw_rooms.iter().map(|room| Room::new_from_json(room)).collect();
                unsafe {
                    crate::ClientStatus.update_rooms(rooms.clone());
                }
                info!("update_all_room {}", rooms.len());
            }
        }
    }
}

pub async fn succes_message(payload: Payload, _client: Client) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            info!("messageSuccess {}", value.to_string().green());
        }
    }
}

pub async fn failed_message(payload: Payload, _client: Client) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            warn!("messageFailed {}", value.to_string().red());
        }
    }
}

/// 所有
pub async fn any_event(event: Event, payload: Payload, _client: Client) {
    let handled = vec![
        // 真正处理过的
        "authSucceed",
        "authFailed",
        "authRequired",
        "requireAuth",
        "onlineData",
        "addMessage",
        "deleteMessage",
        "setAllRooms",
        "setMessages",
        // 也许以后会用到
        "messageSuccess",
        "messageFailed",
        "setAllChatGroups",
        // 忽略的
        "notify",
        "closeLoading", // 发送消息/加载新聊天 有一个 loading
        "updateRoom",
        // "syncRead",
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
                _ => (),
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
                println!("|{}", value.to_string());
            }
        }
        _ => (),
    }
}

pub async fn connect_callback(payload: Payload, _client: Client) {
    match payload {
        Payload::Text(values) => {
            if let Some(value) = values.first() {
                match value.as_str() {
                    Some("authSucceed") => {
                        info!("{}", "已经登录到 icalingua!".green())
                    }
                    Some("authFailed") => {
                        info!("{}", "登录到 icalingua 失败!".red());
                        panic!("登录失败")
                    }
                    Some("authRequired") => {
                        warn!("{}", "需要登录到 icalingua!".yellow())
                    }
                    Some(msg) => {
                        warn!("未知消息 {}", msg.yellow())
                    }
                    None => (),
                }
            }
        }
        _ => (),
    }
}
