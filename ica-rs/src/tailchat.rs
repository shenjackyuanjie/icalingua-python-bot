pub mod events;

use futures_util::FutureExt;
use reqwest::ClientBuilder as reqwest_ClientBuilder;
use rust_socketio::asynchronous::{Client, ClientBuilder};
use rust_socketio::{Event, Payload, TransportType};
use tracing::{event, span, Level};

// use crate::config::IcaConfig;
use crate::error::{ClientResult, TailchatError};

pub async fn start_tailchat() -> ClientResult<(), TailchatError> {
    let span = span!(Level::INFO, "Tailchat Client");
    let _enter = span.enter();

    event!(Level::INFO, "tailchat-async-rs v{} initing", crate::TAILCHAT_VERSION);

    let tailchat_req = reqwest_ClientBuilder::new().build()?;

    // tailchat_req.get("http://localhost:8080").send().await?;

    // let socket = match ClientBuilder::new() {

    // };

    Ok(())
}
