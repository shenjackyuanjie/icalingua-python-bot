use std::time::Duration;

mod config;
mod data_struct;
#[cfg(feature = "ica")]
mod ica;
#[cfg(feature = "matrix")]
mod matrix;
mod py;
mod status;

use config::BotConfig;
use tracing::{event, info, Level};

pub static mut MAIN_STATUS: status::BotStatus = status::BotStatus {
    config: None,
    ica_status: None,
    matrix_status: None,
};

pub type MainStatus = status::BotStatus;

pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const ICA_VERSION: &str = "0.5.2";
pub const MATRIX_VERSION: &str = "0.1.0";

#[macro_export]
macro_rules! wrap_callback {
    ($f:expr) => {
        |payload: Payload, client: Client| $f(payload, client).boxed()
    };
}

#[macro_export]
macro_rules! wrap_any_callback {
    ($f:expr) => {
        |event: Event, payload: Payload, client: Client| $f(event, payload, client).boxed()
    };
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_max_level(tracing::Level::DEBUG).init();
    event!(Level::INFO, "shenbot-async-rs v{} main", VERSION);

    let bot_config = BotConfig::new_from_cli();
    MainStatus::static_init(bot_config);
    let bot_config = MainStatus::global_config();

    py::init_py();

    // 准备一个用于停止 socket 的变量
    let (send, recv) = tokio::sync::oneshot::channel::<()>();

    if bot_config.check_ica() {
        info!("启动 ica");
        let config = bot_config.ica();
        tokio::spawn(async move {
            ica::start_ica(&config, recv).await;
        });
    } else {
        info!("未启用 ica");
    }

    tokio::time::sleep(Duration::from_secs(2)).await;
    // 等待一个输入
    info!("Press any key to exit");
    let mut input = String::new();
    std::io::stdin().read_line(&mut input).unwrap();

    send.send(()).ok();

    info!("Disconnected");
}
