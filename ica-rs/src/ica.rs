pub mod client;
pub mod events;

use rust_socketio::asynchronous::{Client, ClientBuilder};
use rust_socketio::{async_any_callback, async_callback};
use rust_socketio::{Event, Payload, TransportType};
use tracing::{event, span, Level};

use crate::config::IcaConfig;
use crate::error::{ClientResult, IcaError};
use crate::StopGetter;

const ICA_PROTOCOL_VERSION: &str = "2.12.9";

pub async fn start_ica(config: &IcaConfig, stop_reciver: StopGetter) -> ClientResult<(), IcaError> {
    let span = span!(Level::INFO, "Icalingua Client");
    let _enter = span.enter();

    event!(Level::INFO, "ica-async-rs v{} initing", crate::ICA_VERSION);

    let socket = match ClientBuilder::new(config.host.clone())
        .transport_type(TransportType::Websocket)
        .on_any(async_any_callback!(events::any_event))
        .on("requireAuth", async_callback!(client::sign_callback))
        .on("message", async_callback!(events::connect_callback))
        .on("authSucceed", async_callback!(events::connect_callback))
        .on("authFailed", async_callback!(events::connect_callback))
        .on("messageSuccess", async_callback!(events::success_message))
        .on("messageFailed", async_callback!(events::failed_message))
        .on("onlineData", async_callback!(events::get_online_data))
        .on("setAllRooms", async_callback!(events::update_all_room))
        .on("setMessages", async_callback!(events::set_messages))
        .on("addMessage", async_callback!(events::add_message))
        .on("deleteMessage", async_callback!(events::delete_message))
        .connect()
        .await
    {
        Ok(client) => {
            event!(Level::INFO, "socketio connected");
            client
        }
        Err(e) => {
            event!(Level::ERROR, "socketio connect failed: {}", e);
            return Err(IcaError::SocketIoError(e));
        }
    };

    if config.notice_start {
        for room in config.notice_room.iter() {
            let startup_msg = crate::data_struct::ica::messages::SendMessage::new(
                format!("shenbot v {}\nica-async-rs v{}", crate::VERSION, crate::ICA_VERSION),
                *room,
                None,
            );
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;

            event!(Level::INFO, "发送启动消息到房间: {}", room);

            if let Err(e) =
                socket.emit("sendMessage", serde_json::to_value(startup_msg).unwrap()).await
            {
                event!(Level::INFO, "启动信息发送失败 房间:{}|e:{}", room, e);
            }
        }
    }
    // 等待停止信号
    stop_reciver.await.ok();
    event!(Level::INFO, "socketio client stopping");
    match socket.disconnect().await {
        Ok(_) => {
            event!(Level::INFO, "socketio client stopped");
            Ok(())
        }
        Err(e) => {
            // 单独处理 SocketIoError(IncompleteResponseFromEngineIo(WebsocketError(AlreadyClosed)))
            match e {
                rust_socketio::Error::IncompleteResponseFromEngineIo(inner_e) => {
                    if inner_e.to_string().contains("AlreadyClosed") {
                        event!(Level::INFO, "socketio client stopped");
                        Ok(())
                    } else {
                        event!(Level::ERROR, "socketio client stopped with error: {:?}", inner_e);
                        Err(IcaError::SocketIoError(
                            rust_socketio::Error::IncompleteResponseFromEngineIo(inner_e),
                        ))
                    }
                }
                e => {
                    event!(Level::ERROR, "socketio client stopped with error: {}", e);
                    Err(IcaError::SocketIoError(e))
                }
            }
        }
    }
}
