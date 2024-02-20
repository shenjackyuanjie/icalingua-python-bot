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
    config: None,
};

pub const VERSION: &str = env!("CARGO_PKG_VERSION");

fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    // 从命令行获取 host 和 key
    // 从命令行获取配置文件路径
    let ica_config = config::IcaConfig::new_from_cli();
    unsafe {
        ClientStatus.update_config(ica_config.clone());
    }
    py::init_py(&ica_config);
    let ica_singer = client::IcalinguaSinger::new_from_config(&ica_config);

    let socket = ClientBuilder::new(ica_singer.host.clone())
        .transport_type(rust_socketio::TransportType::Websocket)
        .on_any(events::any_event)
        .on("requireAuth", move |a, b| ica_singer.sign_callback(a, b))
        .on("message", events::connect_callback)
        .on("authSucceed", events::connect_callback)
        .on("authFailed", events::connect_callback)
        .on("onlineData", events::get_online_data)
        .on("setAllRooms", events::update_all_room)
        .on("addMessage", events::add_message)
        .on("deleteMessage", events::delete_message)
        .connect()
        .expect("Connection failed");

    info!("Connected");

    if ica_config.notice_start {
        for room in ica_config.notice_room.iter() {
            let startup_msg = crate::data_struct::messages::SendMessage::new(
                format!("ica-rs bot v{}", VERSION),
                room.clone(),
                None,
            );
            std::thread::sleep(Duration::from_secs(1));
            info!("发送启动消息到房间: {}", room);
            if let Err(e) = socket.emit("sendMessage", serde_json::to_value(startup_msg).unwrap()) {
                info!("启动信息发送失败 房间:{}|e:{}", room, e);
            }
        }
    }

    std::thread::sleep(Duration::from_secs(3));
    // 等待一个输入
    info!("Press any key to exit");
    let mut input = String::new();
    std::io::stdin().read_line(&mut input).unwrap();
    socket.disconnect().expect("Disconnect failed");
    info!("Disconnected");
}
