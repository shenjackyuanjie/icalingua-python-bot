use std::time::Duration;

use rust_socketio::ClientBuilder;

mod client;
mod config;
mod data_struct;
mod events;
mod py;

fn ws_main() {
    py::init_py();

    // 从命令行获取 host 和 key
    // 从命令行获取配置文件路径
    let ica_config = config::IcaConfig::new_from_cli();
    let ica_singer = client::IcalinguaSinger::new_from_config(ica_config);

    let socket = ClientBuilder::new(ica_singer.host.clone())
        .transport_type(rust_socketio::TransportType::Websocket)
        .on_any(events::any_event)
        .on("onlineData", events::get_online_data)
        .on("message", events::connect_callback)
        .on("requireAuth", move |a, b| ica_singer.sign_callback(a, b))
        .on("authRequired", events::connect_callback)
        .on("authSucceed", events::connect_callback)
        .on("authFailed", events::connect_callback)
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
