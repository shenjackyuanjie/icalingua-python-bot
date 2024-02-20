use std::time::Duration;

use rust_socketio::ClientBuilder;
use tracing::info;

mod client;
mod config;
mod data_struct;
mod events;
mod py;

#[allow(non_upper_case_globals)]
pub static mut ClientStatus: client::IcalinguaStatus = client::IcalinguaStatus {
    login: false,
    online_data: None,
    rooms: None,
};

fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();
    py::init_py();

    // 从命令行获取 host 和 key
    // 从命令行获取配置文件路径
    let ica_config = config::IcaConfig::new_from_cli();
    let ica_singer = client::IcalinguaSinger::new_from_config(ica_config);

    let socket = ClientBuilder::new(ica_singer.host.clone())
        .transport_type(rust_socketio::TransportType::Websocket)
        .on_any(events::any_event)
        .on("requireAuth", move |a, b| ica_singer.sign_callback(a, b))
        .on("authRequired", events::connect_callback)
        .on("authSucceed", events::connect_callback)
        .on("authFailed", events::connect_callback)
        .on("onlineData", events::get_online_data)
        .on("addMessage", events::add_message)
        .connect()
        .expect("Connection failed");

    info!("Connected");
    std::thread::sleep(Duration::from_secs(3));
    // 等待一个输入
    info!("Press any key to exit");
    let mut input = String::new();
    std::io::stdin().read_line(&mut input).unwrap();
    socket.disconnect().expect("Disconnect failed");
    info!("Disconnected");
}
