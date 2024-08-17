use std::time::Duration;

mod config;
mod data_struct;
mod error;
mod py;
mod status;

#[cfg(feature = "ica")]
mod ica;
#[cfg(feature = "tailchat")]
mod tailchat;

use config::BotConfig;
use tracing::{event, span, Level};

pub static mut MAIN_STATUS: status::BotStatus = status::BotStatus {
    config: None,
    ica_status: None,
    tailchat_status: None,
    startup_time: None,
};

pub type MainStatus = status::BotStatus;

pub type StopGetter = tokio::sync::oneshot::Receiver<()>;

pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const ICA_VERSION: &str = "1.6.1";
pub const TAILCHAT_VERSION: &str = "1.2.1";

pub fn version_str() -> String {
    format!(
        "shenbot-rs v{}-{} ica v{} tailchat v{}",
        VERSION,
        if STABLE { "" } else { "开发版" },
        ICA_VERSION,
        TAILCHAT_VERSION
    )
}

/// 是否为稳定版本
/// 会在 release 的时候设置为 true
pub const STABLE: bool = false;

#[macro_export]
macro_rules! async_callback_with_state {
    ($f:expr, $state:expr) => {{
        use futures_util::FutureExt;
        let state = $state.clone();
        move |payload: Payload, client: Client| $f(payload, client, state.clone()).boxed()
    }};
}

#[macro_export]
macro_rules! async_any_callback_with_state {
    ($f:expr, $state:expr) => {{
        use futures_util::FutureExt;
        let state = $state.clone();
        move |event: Event, payload: Payload, client: Client| {
            $f(event, payload, client, state.clone()).boxed()
        }
    }};
}

#[tokio::main]
async fn main() -> anyhow::Result<()> { inner_main().await }

async fn inner_main() -> anyhow::Result<()> {
    // -d -> debug
    // none -> info
    let level = {
        let args = std::env::args();
        let args = args.collect::<Vec<String>>();
        if args.contains(&"-d".to_string()) {
            Level::DEBUG
        } else if args.contains(&"-t".to_string()) {
            Level::TRACE
        } else {
            Level::INFO
        }
    };

    tracing_subscriber::fmt().with_max_level(level).init();
    let span = span!(Level::INFO, "Shenbot Main");
    let _enter = span.enter();

    event!(Level::INFO, "shenbot-rs v{} starting", VERSION);
    if !STABLE {
        event!(Level::WARN, "这是一个开发版本, 有问题记得找 shenjack");
    }

    let bot_config = BotConfig::new_from_cli();
    MainStatus::static_init(bot_config);
    let bot_config = MainStatus::global_config();

    if bot_config.check_py() {
        py::init_py();
    }

    // 准备一个用于停止 socket 的变量
    event!(Level::INFO, "启动 ICA");
    let (ica_send, ica_recv) = tokio::sync::oneshot::channel::<()>();

    if bot_config.check_ica() {
        event!(Level::INFO, "启动 ica");
        let config = bot_config.ica();
        tokio::spawn(async move {
            ica::start_ica(&config, ica_recv).await.unwrap();
        });
    } else {
        event!(Level::INFO, "未启用 ica");
    }

    let (tailchat_send, tailchat_recv) = tokio::sync::oneshot::channel::<()>();

    if bot_config.check_tailchat() {
        event!(Level::INFO, "启动 Tailchat");
        let config = bot_config.tailchat();
        tokio::spawn(async move {
            tailchat::start_tailchat(config, tailchat_recv).await.unwrap();
        });
    } else {
        event!(Level::INFO, "未启用 Tailchat");
    }

    tokio::time::sleep(Duration::from_secs(2)).await;
    // 等待一个输入
    event!(Level::INFO, "Press any key to exit");
    let mut input = String::new();
    std::io::stdin().read_line(&mut input).unwrap();

    ica_send.send(()).ok();
    tailchat_send.send(()).ok();

    event!(Level::INFO, "Disconnected");

    py::post_py()?;

    Ok(())
}

#[allow(dead_code, unused_variables)]
#[cfg(test)]
#[tokio::test]
async fn test_macro() {
    use std::sync::Arc;
    use tokio::sync::RwLock;

    use rust_socketio::asynchronous::{Client, ClientBuilder};
    use rust_socketio::Payload;

    /// 一个简单的例子
    #[derive(Clone)]
    struct BotState(String);

    /// 一个复杂一些的例子
    #[derive(Clone)]
    struct BotState2 {
        pub name: Arc<RwLock<String>>,
    }

    async fn some_event_with_state(payload: Payload, client: Client, state: Arc<BotState>) {
        // do something with your state
    }

    async fn some_state_change_event(payload: Payload, client: Client, state: Arc<BotState2>) {
        if let Payload::Text(text) = payload {
            if let Some(first_one) = text.first() {
                let new_name = first_one.as_str().unwrap_or_default();
                let old_name = state.name.read().await;
                if new_name != *old_name {
                    // update your name here
                    *state.name.write().await = new_name.to_string();
                }
            }
        }
    }

    let state = Arc::new(BotState("hello".to_string()));
    let state2 = Arc::new(BotState2 {
        name: Arc::new(RwLock::new("hello".to_string())),
    });
    let socket = ClientBuilder::new("http://example.com")
        .on("message", async_callback_with_state!(some_event_with_state, state))
        .on("update_status", async_callback_with_state!(some_state_change_event, state2))
        .connect()
        .await;
}
