use std::time::Duration;

use futures_util::FutureExt;
use rust_socketio::asynchronous::{Client, ClientBuilder};
use rust_socketio::{Event, Payload, TransportType};
use tracing::info;

mod client;
mod config;
mod data_struct;
mod events;
mod py;

#[allow(non_upper_case_globals)]
pub static mut ClientStatus: client::IcalinguaStatus = client::IcalinguaStatus {
    login: false,
    current_loaded_messages_count: 0,
    online_data: None,
    rooms: None,
    config: None,
};

pub const VERSION: &str = env!("CARGO_PKG_VERSION");

macro_rules! wrap_callback {
    ($f:expr) => {
        |payload: Payload, client: Client| $f(payload, client).boxed()
    };
}

macro_rules! wrap_any_callback {
    ($f:expr) => {
        |event: Event, payload: Payload, client: Client| $f(event, payload, client).boxed()
    };
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_max_level(tracing::Level::DEBUG).init();
    info!("ica-async-rs v{}", VERSION);

    // 从命令行获取 host 和 key
    // 从命令行获取配置文件路径
    let ica_config = config::IcaConfig::new_from_cli();
    client::IcalinguaStatus::update_config(ica_config.clone());
    py::init_py(&ica_config);

    let socket = ClientBuilder::new(ica_config.host.clone())
        .transport_type(TransportType::Websocket)
        .on_any(wrap_any_callback!(events::any_event))
        .on("requireAuth", wrap_callback!(client::sign_callback))
        .on("message", wrap_callback!(events::connect_callback))
        .on("authSucceed", wrap_callback!(events::connect_callback))
        .on("authFailed", wrap_callback!(events::connect_callback))
        .on("messageSuccess", wrap_callback!(events::succes_message))
        .on("messageFailed", wrap_callback!(events::failed_message))
        .on("onlineData", wrap_callback!(events::get_online_data))
        .on("setAllRooms", wrap_callback!(events::update_all_room))
        .on("setMessages", wrap_callback!(events::set_messages))
        .on("addMessage", wrap_callback!(events::add_message))
        .on("deleteMessage", wrap_callback!(events::delete_message))
        .connect()
        .await
        .expect("Connection failed");

    info!("Connected");

    if ica_config.notice_start {
        for room in ica_config.notice_room.iter() {
            let startup_msg = crate::data_struct::messages::SendMessage::new(
                format!("ica-async-rs bot v{}", VERSION),
                room.clone(),
                None,
            );
            tokio::time::sleep(Duration::from_secs(1)).await;
            info!("发送启动消息到房间: {}", room);
            if let Err(e) =
                socket.emit("sendMessage", serde_json::to_value(startup_msg).unwrap()).await
            {
                info!("启动信息发送失败 房间:{}|e:{}", room, e);
            }
        }
    }

    tokio::time::sleep(Duration::from_secs(2)).await;
    // 等待一个输入
    info!("Press any key to exit");
    let mut input = String::new();
    std::io::stdin().read_line(&mut input).unwrap();

    socket.disconnect().await.expect("Disconnect failed");
    info!("Disconnected");
}
