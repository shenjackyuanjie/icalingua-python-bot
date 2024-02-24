use crate::config::IcaConfig;
use crate::data_struct::messages::SendMessage;
use crate::data_struct::{all_rooms::Room, online_data::OnlineData};
use crate::ClientStatus;

use colored::Colorize;
use ed25519_dalek::{Signature, Signer, SigningKey};
use rust_socketio::asynchronous::Client;
use rust_socketio::Payload;
use serde_json::Value;
use tracing::{debug, warn};

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

#[derive(Debug, Clone)]
pub struct IcalinguaStatus {
    pub login: bool,
    pub online_data: Option<OnlineData>,
    pub rooms: Option<Vec<Room>>,
    pub config: Option<IcaConfig>,
}

impl IcalinguaStatus {
    pub fn new() -> Self {
        Self {
            login: false,
            online_data: None,
            rooms: None,
            config: Some(IcaConfig::new_from_cli()),
        }
    }

    pub fn update_online_data(&mut self, online_data: OnlineData) {
        self.online_data = Some(online_data);
    }

    pub fn update_rooms(&mut self, rooms: Vec<Room>) { self.rooms = Some(rooms); }

    pub fn update_login_status(&mut self, login: bool) { self.login = login; }

    pub fn update_config(&mut self, config: IcaConfig) { self.config = Some(config); }

    pub fn get_online_data() -> &'static OnlineData {
        unsafe { ClientStatus.online_data.as_ref().expect("online_data should be set") }
    }

    pub fn get_config() -> &'static IcaConfig {
        unsafe { ClientStatus.config.as_ref().expect("config should be set") }
    }
}

pub async fn sign_callback(payload: Payload, client: Client) {
    // 获取数据
    let require_data = match payload {
        Payload::Text(json_value) => Some(json_value),
        _ => None,
    }
    .expect("Payload should be Json data");

    let (auth_key, version) = (&require_data[0], &require_data[1]);
    debug!("auth_key: {:?}, version: {:?}", auth_key, version);
    let auth_key = match &require_data.get(0) {
        Some(Value::String(auth_key)) => Some(auth_key),
        _ => None,
    }
    .expect("auth_key should be string");
    let salt = hex::decode(auth_key).expect("Got an invalid salt from the server");
    // 签名
    let private_key = IcalinguaStatus::get_config().private_key.clone();
    let array_key: [u8; 32] = hex::decode(private_key)
        .expect("Not a vaild pub key")
        .try_into()
        .expect("Not a vaild pub key");
    let signing_key: SigningKey = SigningKey::from_bytes(&array_key);
    let signature: Signature = signing_key.sign(salt.as_slice());

    let sign = signature.to_bytes().to_vec();
    client.emit("auth", sign).await.expect("Faild to send signin data");
}
