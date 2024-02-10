mod client;
mod config;
mod py;

use colored::Colorize;
use rust_socketio::{ClientBuilder, Event, Payload, RawClient};
use std::time::Duration;

#[allow(unused)]
fn any_event(event: Event, payload: Payload, _client: RawClient) {
    match payload {
        Payload::Binary(ref data) => {
            println!("event: {} |{:?}", event, data)
        }
        Payload::Text(ref data) => {
            print!("event: {}", event.as_str().purple());
            for value in data {
                println!("|{}", value.to_string());
            }
        }
        _ => (),
    }
    // println!("event: {} |{:?}|id{:?}", event, payload, id)
}

fn ws_main() {
    // define a callback which is called when a payload is received
    // this callback gets the payload as well as an instance of the
    // socket to communicate with the server
    let connect_call_back = |payload: Payload, _client: RawClient| match payload {
        Payload::Text(values) => {
            if let Some(value) = values.first() {
                // if let Some("authSucceed") = value.as_str() {
                //     println!("{}", "已经登录到 icalingua!".green());
                // }
                match value.as_str() {
                    Some("authSucceed") => println!("{}", "已经登录到 icalingua!".green()),
                    Some("authFailed") => {
                        println!("{}", "登录到 icalingua 失败!".red());
                        panic!("登录失败")
                    }
                    Some("authRequired") => println!("{}", "需要登录到 icalingua!".yellow()),
                    _ => (),
                }
            }
        }
        _ => (),
    };
    // 从命令行获取 host 和 key
    // 从命令行获取配置文件路径
    let ica_config = config::IcaConfig::new_from_cli();
    let ica_singer = client::IcalinguaSinger::new_from_config(ica_config);

    // get a socket that is connected to the admin namespace

    let socket = ClientBuilder::new(ica_singer.host.clone())
        .transport_type(rust_socketio::TransportType::Websocket)
        .on_any(any_event)
        .on("message", connect_call_back)
        .on("requireAuth", move |a, b| ica_singer.sign_callback(a, b))
        .connect()
        .expect("Connection failed");

    std::thread::sleep(Duration::from_secs(10));

    socket.disconnect().expect("Disconnect failed")
}

fn main() {
    
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();
    ws_main();
}
