mod client;

use ed25519_dalek::{Signature, Signer, SigningKey};
use rust_socketio::{ClientBuilder, Event, Payload, RawClient};
use std::time::Duration;

#[allow(unused)]
fn require_auth_callback(payload: Payload, client: RawClient) {
    let key = std::env::args().nth(2).expect("No key given");
    let auth_key = match payload {
        Payload::String(str) => Some(str),
        Payload::Binary(_) => None,
    }
    .expect("Payload should be String");
    let auth_key = &auth_key[1..auth_key.len() - 1];

    println!("auth_key: {}", auth_key);

    let array_key: [u8; 32] = hex::decode(key)
        .expect("Key should be hex")
        .try_into()
        .expect("Key should be 32 bytes");

    let signing_key: SigningKey = SigningKey::from_bytes(&array_key);

    let salt = hex::decode(auth_key).expect("Got an invalid salt from the server");
    let signature: Signature = signing_key.sign(salt.as_slice());
    // let sign = hex::encode(signature.to_bytes());
    let sign = signature.to_bytes().to_vec();
    client.emit("auth", sign).unwrap();
}

#[allow(unused)]
fn any_event(event: Event, payload: Payload, _client: RawClient) {
    // println!("event: {} | {:#?}", event, payload);
    match payload {
        Payload::Binary(bin) => println!("event: {} |bin: {:?}", event, bin),
        Payload::String(str) => println!("event: {} |str: {:?}", event, str),
    }
}

fn ws_main() {
    // define a callback which is called when a payload is received
    // this callback gets the payload as well as an instance of the
    // socket to communicate with the server
    let connect_call_back = |payload: Payload, _client: RawClient| {
        println!("Connect callback: {:#?}", payload);
    };
    // 从命令行获取 host 和 key
    let host = std::env::args().nth(1).expect("No host given");

    // get a socket that is connected to the admin namespace

    let socket = ClientBuilder::new(host)
        // .namespace("/admin")
        .on_any(any_event)
        .on("connect", connect_call_back)
        .on("requireAuth", require_auth_callback)
        .connect()
        .expect("Connection failed");

    std::thread::sleep(Duration::from_secs(10));

    socket.disconnect().expect("Disconnect failed")
}

fn main() {
    ws_main();
}
