use ed25519_dalek::{Signature, Signer, SigningKey};
use rust_socketio::{ClientBuilder, Payload, RawClient, Event};
use std::time::Duration;

static KEY: &str = "";
static HOST: &str = "";

#[allow(unused)]
fn require_auth_callback(payload: Payload, client: RawClient) {
    let auth_key = match payload {
        Payload::String(str) => Some(str),
        Payload::Binary(_) => None,
    }
    .unwrap();
    // 去除前后的 "
    let auth_key = &auth_key[1..auth_key.len() - 1];

    println!("auth_key: {}", auth_key);

    let array_key: [u8; 32] = hex::decode(KEY).unwrap().try_into().unwrap();

    let signing_key: SigningKey = SigningKey::from_bytes(&array_key);

    let salt = hex::decode(auth_key).unwrap();
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

    // get a socket that is connected to the admin namespace

    let socket = ClientBuilder::new(HOST)
        // .namespace("/admin")
        .on_any(any_event)
        .on("connect", connect_call_back)
        .on("requireAuth", require_auth_callback)
        .connect()
        .expect("Connection failed");

    std::thread::sleep(Duration::from_secs(10));

    socket.disconnect().expect("Disconnect failed")
}

fn sign_main() {
    // 生成 SingningKey
    let array_key: [u8; 32] = hex::decode(KEY).unwrap().try_into().unwrap();
    let signing_key: SigningKey = SigningKey::from_bytes(&array_key);

    // 要签名的东西
    let data = "187d0b21becfa7a49e97afc00646e169";
    let data = hex::decode(data).unwrap();

    // 签名
    let signature: Signature = signing_key.sign(data.as_slice());

    // 生成签名
    let sign = hex::encode(signature.to_bytes());

    println!("sign: {} {:?} {}", sign, signature.to_bytes(), signature.to_bytes().len());
    // println!("hex: {}", hex::encode());
}

fn main() {
    sign_main();
    ws_main();
}
