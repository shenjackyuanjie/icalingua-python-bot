use crate::config::IcaConfig;
use crate::data_struct::{all_rooms::Room, online_data::OnlineData};

use ed25519_dalek::{Signature, Signer, SigningKey};
use rust_socketio::{Payload, RawClient};
use serde_json::Value;
use tracing::debug;

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

    pub fn update_rooms(&mut self, rooms: Vec<Room>) {
        self.rooms = Some(rooms);
    }

    pub fn update_login_status(&mut self, login: bool) {
        self.login = login;
    }

    pub fn update_config(&mut self, config: IcaConfig) {
        self.config = Some(config);
    }

    pub fn get_config(&self) -> &IcaConfig {
        self.config.as_ref().unwrap()
    }
}

pub struct IcalinguaSinger {
    pub host: String,
    pub private_key: SigningKey,
}

impl IcalinguaSinger {
    pub fn new_from_config(config: &IcaConfig) -> Self {
        let host = config.host.clone();
        let pub_key = config.private_key.clone();
        Self::new_from_raw(host, pub_key)
    }

    pub fn new_from_raw(host: String, pub_key: String) -> Self {
        let array_key: [u8; 32] = hex::decode(pub_key)
            .expect("Not a vaild pub key")
            .try_into()
            .expect("Not a vaild pub key");

        let signing_key: SigningKey = SigningKey::from_bytes(&array_key);
        Self {
            host,
            private_key: signing_key,
        }
    }

    /// 最痛苦的一集
    ///
    /// 签名的回调函数
    pub fn sign_callback(&self, payload: Payload, client: RawClient) {
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
        let signature: Signature = self.private_key.sign(salt.as_slice());

        let sign = signature.to_bytes().to_vec();
        client
            .emit("auth", sign)
            .expect("Faild to send signin data");
    }
}
