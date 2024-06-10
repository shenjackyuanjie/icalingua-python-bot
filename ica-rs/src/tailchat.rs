pub mod client;
pub mod events;

use colored::Colorize;
use futures_util::FutureExt;
use md5::{Digest, Md5};
use reqwest::ClientBuilder as reqwest_ClientBuilder;
use rust_socketio::asynchronous::{Client, ClientBuilder};
use rust_socketio::{Event, Payload, TransportType};
use serde_json::{json, Value};
use tracing::{event, span, Level};

use crate::config::TailchatConfig;
use crate::data_struct::tailchat::status::LoginData;
use crate::error::{ClientResult, TailchatError};
use crate::{wrap_any_callback, wrap_callback, StopGetter};

pub async fn start_tailchat(
    config: TailchatConfig,
    stop_reciver: StopGetter,
) -> ClientResult<(), TailchatError> {
    let span = span!(Level::INFO, "Tailchat Client");
    let _enter = span.enter();

    event!(Level::INFO, "tailchat-async-rs v{} initing", crate::TAILCHAT_VERSION);

    let mut hasher = Md5::new();
    hasher.update(config.app_id.as_bytes());
    hasher.update(config.app_secret.as_bytes());

    let token = format!("{:x}", hasher.finalize());

    let mut header_map = reqwest::header::HeaderMap::new();
    header_map.append("Content-Type", "application/json".parse().unwrap());

    let client = reqwest_ClientBuilder::new().default_headers(header_map.clone()).build()?;
    let status = match client
        .post(&format!("{}/api/openapi/bot/login", config.host))
        .body(json! {{"appId": config.app_id, "token": token}}.to_string())
        .send()
        .await
    {
        Ok(resp) => {
            if resp.status().is_success() {
                let raw_data = resp.text().await?;

                let json_data = serde_json::from_str::<Value>(&raw_data).unwrap();
                let login_data = serde_json::from_value::<LoginData>(json_data["data"].clone());
                match login_data {
                    Ok(data) => data,
                    Err(e) => {
                        event!(Level::ERROR, "login failed: {}|{}", e, raw_data);
                        return Err(TailchatError::LoginFailed(e.to_string()));
                    }
                }
            } else {
                return Err(TailchatError::LoginFailed(resp.text().await?));
            }
        }
        Err(e) => return Err(TailchatError::LoginFailed(e.to_string())),
    };

    let socket = ClientBuilder::new(config.host)
        .auth(json!({"token": status.jwt.clone()}))
        .transport_type(TransportType::Websocket)
        .on_any(wrap_any_callback!(events::any_event))
        .on("notify:chat.message.add", wrap_callback!(events::on_message))
        .on("notify:chat.message.delete", wrap_callback!(events::on_msg_delete))
        .on(
            "notify:chat.converse.updateDMConverse",
            wrap_callback!(events::on_converse_update),
        )
        // .on("notify:chat.message.update", wrap_callback!(events::on_message))
        // .on("notify:chat.message.addReaction", wrap_callback!(events::on_msg_update))
        .connect()
        .await
        .unwrap();

    event!(Level::INFO, "{}", "已经连接到 tailchat!".green());

    // sleep for 500ms to wait for the connection to be established
    tokio::time::sleep(std::time::Duration::from_millis(500)).await;

    socket.emit("chat.converse.findAndJoinRoom", json!([])).await.unwrap();

    event!(Level::INFO, "{}", "tailchat 已经加入房间".green());

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
                        Err(TailchatError::SocketIoError(
                            rust_socketio::Error::IncompleteResponseFromEngineIo(inner_e),
                        ))
                    }
                }
                e => {
                    event!(Level::ERROR, "socketio client stopped with error: {}", e);
                    Err(TailchatError::SocketIoError(e))
                }
            }
        }
    }
}
