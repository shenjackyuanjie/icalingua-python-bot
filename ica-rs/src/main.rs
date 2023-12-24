mod client;

use ed25519_dalek::{Signature, Signer, SigningKey};
use rust_socketio::{ClientBuilder, Event, Payload, RawClient};
use serde_json::Value;
use std::time::Duration;

#[allow(unused)]
fn any_event(event: Event, payload: Payload, _client: RawClient, id: Option<i32>) {
    match payload {
        Payload::Binary(ref data) => {
            println!("event: {} |{:?}|id{:?}", event, data, id)
        }
        Payload::Text(ref data) => {
            print!("\x1b[35mevent: {event}\x1b[0m");
            for value in data {
                print!("|{}", value.to_string());
            }
            println!("|id:{:?}|", id);
        }
        _ => (),
    }
    // println!("event: {} |{:?}|id{:?}", event, payload, id)
}

fn ws_main() {
    // define a callback which is called when a payload is received
    // this callback gets the payload as well as an instance of the
    // socket to communicate with the server
    let connect_call_back = |payload: Payload, _client: RawClient, _id| match payload {
        Payload::Text(values) => {
            if let Some(value) = values.first() {
                if let Some("authSucceed") = value.as_str() {
                    println!("\x1b[32m已经登录到 icalingua!\x1b[0m");
                }
            }
        }
        _ => (),
    };
    // 从命令行获取 host 和 key
    // 从命令行获取配置文件路径
    let config_path = std::env::args().nth(1).expect("No config path given");
    let ica_singer = client::IcalinguaSinger::new_from_config(config_path);

    // get a socket that is connected to the admin namespace

    let socket = ClientBuilder::new(ica_singer.host.clone())
        // .namespace("/admin")
        .on_any(any_event)
        .on("message", connect_call_back)
        .on("requireAuth", move |a, b, c| ica_singer.sign_callback(a, b, c))
        .connect()
        .expect("Connection failed");

    std::thread::sleep(Duration::from_secs(10));

    socket.disconnect().expect("Disconnect failed")
}

fn main() {
    ws_main();
}
