use ed25519_dalek::{Signature, Signer, SigningKey};
use rust_socketio::{ClientBuilder, Event, Payload, RawClient};

pub struct IcalinguaSinger {
    pub host: String,
    pub pub_key: SigningKey,
}

impl IcalinguaSinger {
    pub fn new(host: String, pub_key: &str) -> Self {
        let array_key: [u8; 32] = hex::decode(pub_key).unwrap().try_into().unwrap();

        let signing_key: SigningKey = SigningKey::from_bytes(&array_key);
        Self {
            host,
            pub_key: signing_key,
        }
    }

    pub fn sign_for_salt(&self, salt: String) -> Vec<u8> {
        let salt: Vec<u8> = hex::decode(salt).unwrap();
        let signature: Signature = self.pub_key.sign(salt.as_slice());

        signature.to_bytes().to_vec()
    }
}
