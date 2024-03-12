pub mod client;
pub mod events;

use futures_util::FutureExt;
use rust_socketio::asynchronous::{Client, ClientBuilder};
use rust_socketio::{Event, Payload, TransportType};
use tracing::info;

use crate::config::IcaConfig;
use crate::{wrap_any_callback, wrap_callback};

pub async fn start_ica(config: &IcaConfig, stop_reciver: tokio::sync::oneshot::Receiver<()>) {
    let socket = ClientBuilder::new(config.host.clone())
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

    if config.notice_start {
        for room in config.notice_room.iter() {
            let startup_msg = crate::data_struct::ica::messages::SendMessage::new(
                format!("ica-async-rs bot v{}", crate::VERSION),
                *room,
                None,
            );
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            info!("发送启动消息到房间: {}", room);
            if let Err(e) =
                socket.emit("sendMessage", serde_json::to_value(startup_msg).unwrap()).await
            {
                info!("启动信息发送失败 房间:{}|e:{}", room, e);
            }
        }
    }
    // 等待停止信号
    stop_reciver.await.ok();
    socket.disconnect().await.expect("Disconnect failed");
}
