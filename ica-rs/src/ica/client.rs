use crate::data_struct::ica::messages::{DeleteMessage, SendMessage};
use crate::MainStatus;

use colored::Colorize;
use ed25519_dalek::{Signature, Signer, SigningKey};
use rust_socketio::asynchronous::Client;
use rust_socketio::Payload;
use serde_json::Value;
use tracing::{debug, span, warn, Level};

/// "安全" 的 发送一条消息
pub async fn send_message(client: &Client, message: &SendMessage) -> bool {
    let value = message.as_value();
    match client.emit("sendMessage", value).await {
        Ok(_) => {
            debug!("send_message {}", format!("{:#?}", message).cyan());
            true
        }
        Err(e) => {
            warn!("send_message faild:{}", format!("{:#?}", e).red());
            false
        }
    }
}
/// "安全" 的 删除一条消息
pub async fn delete_message(client: &Client, message: &DeleteMessage) -> bool {
    let value = message.as_value();
    match client.emit("deleteMessage", value).await {
        Ok(_) => {
            debug!("delete_message {}", format!("{:#?}", message).yellow());
            true
        }
        Err(e) => {
            warn!("delete_message faild:{}", format!("{:#?}", e).red());
            false
        }
    }
}
/// "安全" 的 获取历史消息
/// ```typescript
/// async fetchHistory(messageId: string, roomId: number, currentLoadedMessagesCount: number)
/// ```
// #[allow(dead_code)]
// pub async fn fetch_history(client: &Client, roomd_id: RoomId) -> bool { false }

pub async fn sign_callback(payload: Payload, client: Client) {
    let span = span!(Level::INFO, "signing icalingua");
    let _guard = span.enter();

    // 获取数据
    let require_data = match payload {
        Payload::Text(json_value) => Some(json_value),
        _ => None,
    }
    .expect("Payload should be Json data");

    let (auth_key, version) = (&require_data[0], &require_data[1]);
    debug!("auth_key: {:?}, server_version: {:?}", auth_key, version);
    let auth_key = match &require_data.first() {
        Some(Value::String(auth_key)) => Some(auth_key),
        _ => None,
    }
    .expect("auth_key should be string");

    let salt = hex::decode(auth_key).expect("Got an invalid salt from the server");
    // 签名
    let private_key = MainStatus::global_config().ica().private_key.clone();

    let array_key: [u8; 32] = hex::decode(private_key)
        .expect("Not a vaild pub key")
        .try_into()
        .expect("Not a vaild pub key");
    let signing_key: SigningKey = SigningKey::from_bytes(&array_key);
    let signature: Signature = signing_key.sign(salt.as_slice());

    // 发送签名
    let sign = signature.to_bytes().to_vec();
    client.emit("auth", sign).await.expect("Faild to send signin data");
}
