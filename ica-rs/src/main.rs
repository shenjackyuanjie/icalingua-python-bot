mod client;

use ed25519_dalek::{Signature, Signer, SigningKey};
use rust_socketio::{ClientBuilder, Event, Payload, RawClient};
use serde_json::Value;
use std::time::Duration;

#[allow(unused)]
fn require_auth_callback(payload: Payload, client: RawClient, _id: Option<i32>) {
    let key = std::env::args().nth(2).expect("No key given");
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

    let array_key: [u8; 32] = hex::decode(key)
        .expect("Key should be hex")
        .try_into()
        .expect("Key should be 32 bytes");

    let signing_key = SigningKey::from_bytes(&array_key);

    let salt = hex::decode(auth_key).expect("Got an invalid salt from the server");
    let signature: Signature = signing_key.sign(salt.as_slice());
    // let sign = hex::encode(signature.to_bytes());
    let sign = signature.to_bytes().to_vec();
    client.emit("auth", sign).unwrap();
}

#[allow(unused)]
fn any_event(event: Event, payload: Payload, _client: RawClient, id: Option<i32>) {
    println!("event: {} |{:?}|id{:?}", event, payload, id)
}

fn ws_main() {
    // define a callback which is called when a payload is received
    // this callback gets the payload as well as an instance of the
    // socket to communicate with the server
    let connect_call_back = |payload: Payload, _client: RawClient, _id| {
        match payload {
            Payload::Text(values) => {
                if values.first() == Some(&Value::String("authSucceed".to_string())) {
                    // 一个绿色的 "已经连接到 icalingua 服务器"
                    println!("\x1b[32m已经登录到 icalingua!\x1b[0m");
                }
            },
            _ => ()
        }
    };
    // 从命令行获取 host 和 key
    let host = std::env::args().nth(1).expect("No host given");

    // get a socket that is connected to the admin namespace

    let socket = ClientBuilder::new(host)
        // .namespace("/admin")
        .on_any(any_event)
        .on("message", connect_call_back)
        .on("requireAuth", require_auth_callback)
        .connect()
        .expect("Connection failed");

    std::thread::sleep(Duration::from_secs(10));

    socket.disconnect().expect("Disconnect failed")
}

fn main() {
    ws_main();
}
