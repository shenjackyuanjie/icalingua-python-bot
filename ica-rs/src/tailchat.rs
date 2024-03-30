pub mod events;

use futures_util::FutureExt;
use md5::{Digest, Md5};
use reqwest::{Body, ClientBuilder as reqwest_ClientBuilder};
use rust_socketio::asynchronous::{Client, ClientBuilder};
use rust_socketio::{Event, Payload, TransportType};
use serde_json::json;
use tracing::{event, span, Level};

use crate::config::TailchatConfig;
use crate::error::{ClientResult, TailchatError};
use crate::StopGetter;

pub async fn start_tailchat(
    config: TailchatConfig,
    stop_receiver: StopGetter,
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

    let client = reqwest_ClientBuilder::new().default_headers(header_map).build()?;
    let status = match client
        .post(&format!("{}/api/openapi/bot/login", config.host))
        .body(json!{{"appId": config.app_id, "token": token}}.to_string())
        .send()
        .await
    {
        Ok(resp) => {
            if resp.status().is_success() {
                let body = resp.text().await?;
                event!(Level::INFO, "login success: {}", body);
                body
            } else {
                Err(TailchatError::LoginFailed(resp.text().await?))
            }
        }
        Err(e) => return Err(TailchatError::LoginFailed(e.to_string())),
    };
    // notify:chat.message.delete
    // notify:chat.message.add

    Ok(())
}
