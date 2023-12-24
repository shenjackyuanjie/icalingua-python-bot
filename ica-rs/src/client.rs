use serde_json::Value;
use ed25519_dalek::{Signature, Signer, SigningKey};
use rust_socketio::{ClientBuilder, Event, Payload, RawClient};

pub struct IcalinguaSinger {
    pub host: String,
    pub private_key: SigningKey,
}

impl IcalinguaSinger {
    pub fn new_from_config(config_file_path: String) -> Self {
        // try read config from file
        let config = std::fs::read_to_string(config_file_path).expect("Failed to read config file");
        let config: toml::Value = toml::from_str(&config).expect("Failed to parse config file");
        let host = config["host"]
            .as_str()
            .expect("host should be string")
            .to_string();
        let pub_key = config["private_key"]
            .as_str()
            .expect("private_key should be string")
            .to_string();

        Self::new_from_raw(host, pub_key)
    }

    pub fn new_from_raw(host: String, pub_key: String) -> Self {
        let array_key: [u8; 32] = hex::decode(pub_key).unwrap().try_into().unwrap();

        let signing_key: SigningKey = SigningKey::from_bytes(&array_key);
        Self {
            host,
            private_key: signing_key,
        }
    }

    pub fn sign_for_salt(&self, salt: String) -> Vec<u8> {
        let salt: Vec<u8> = hex::decode(salt).unwrap();
        let signature: Signature = self.private_key.sign(salt.as_slice());

        signature.to_bytes().to_vec()
    }

    pub fn sign_callback(&self, payload: Payload, client: RawClient, _id: Option<i32>) {
        let require_data = match payload {
            Payload::Text(json_value) => Some(json_value),
            _ => None,
        }
        .expect("Payload should be Json data");

        let (auth_key, version) = (&require_data[0], &require_data[1]);
        // println!("auth_key: {:?}, version: {:?}", auth_key, version);
        let auth_key = match &require_data.get(0) {
            Some(Value::String(auth_key)) => Some(auth_key),
            _ => None,
        }
        .expect("auth_key should be string");

        let salt = hex::decode(auth_key).expect("Got an invalid salt from the server");
        let signature: Signature = self.private_key.sign(salt.as_slice());

        let sign = signature.to_bytes().to_vec();
        client.emit("auth", sign).unwrap();
    }
}
