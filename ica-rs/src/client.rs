use crate::config::IcaConfig;

use ed25519_dalek::{Signature, Signer, SigningKey};
use rust_socketio::{Payload, RawClient};
use serde_json::Value;

pub struct IcalinguaSinger {
    pub host: String,
    pub private_key: SigningKey,
}

impl IcalinguaSinger {
    pub fn new_from_config(config: IcaConfig) -> Self {
        let host = config.host;
        let pub_key = config.private_key;
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
        println!("auth_key: {:?}, version: {:?}", auth_key, version);
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
