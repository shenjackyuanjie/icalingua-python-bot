pub mod events;

use std::{str::FromStr, time::Duration};

use futures_util::StreamExt;
use matrix_sdk::{
    config::SyncSettings,
    ruma::{
        api::client::message::send_message_event, events::room::message::RoomMessageEventContent,
        OwnedRoomId, TransactionId,
    },
    Client,
};
use tracing::{event, span, Level};
use url::Url;

use crate::config::MatrixConfig;
use crate::error::{ClientResult, MatrixError};
use crate::StopGetter;

pub async fn start_matrix(
    config: &MatrixConfig,
    mut stop_reciver: StopGetter,
) -> ClientResult<(), MatrixError> {
    let span = span!(Level::INFO, "Matrix Client");
    let _enter = span.enter();

    let homeserver_url = match Url::parse(&config.home_server) {
        Ok(url) => url,
        Err(e) => {
            event!(Level::ERROR, "Homeserver Url 错误: {}", e);
            return Err(MatrixError::HomeserverUrlError(e));
        }
    };
    let password = &config.bot_password;
    let username = &config.bot_id;

    let client = match Client::new(homeserver_url).await {
        Ok(client) => {
            event!(Level::INFO, "Logged in as {}", username);
            client
        }
        Err(error) => {
            event!(Level::ERROR, "Failed to log in as {}: {}", username, error);
            return Err(MatrixError::HttpError(error));
        }
    };

    let display_name = format!("shenbot-matrix v{}", crate::MATRIX_VERSION);

    match client
        .matrix_auth()
        .login_username(&username, &password)
        .initial_device_display_name(&display_name)
        .await
    {
        Ok(_) => {
            event!(Level::INFO, "Logged in as {}", username);
        }
        Err(error) => {
            event!(Level::ERROR, "Failed to log in as {}: {}", username, error);
            return Err(MatrixError::MatrixError(error));
        }
    }

    // 发送启动消息
    if config.notice_start {
        for room in config.notice_room.iter() {
            let startup_msg = RoomMessageEventContent::text_plain(format!(
                "shenbot v {}\nmatrix-rs v{} started!",
                crate::VERSION,
                crate::MATRIX_VERSION
            ));
            let startup_req: send_message_event::v3::Request =
                send_message_event::v3::Request::new(
                    OwnedRoomId::from_str(&room).unwrap(),
                    TransactionId::new(),
                    &startup_msg,
                )
                .unwrap();

            event!(Level::INFO, "发送启动消息到房间: {}", room);

            if let Err(e) = client.send::<send_message_event::v3::Request>(startup_req, None).await
            {
                event!(Level::INFO, "启动信息发送失败 房间:{}|e:{}", room, e);
            }
        }
    } else {
        event!(Level::INFO, "未启用启动消息");
    }

    client.add_event_handler(events::on_room_message);

    let init_sync_setting = SyncSettings::new().timeout(Duration::from_mins(10));

    match client.sync_once(init_sync_setting).await {
        Ok(_) => {
            event!(Level::INFO, "Synced");
        }
        Err(error) => {
            event!(Level::ERROR, "Failed to sync: {}", error);
            return Err(MatrixError::MatrixError(error));
        }
    }

    let mut stream_sync =
        Box::pin(client.sync_stream(SyncSettings::new().timeout(Duration::from_mins(10))).await);

    while let Some(Ok(response)) = stream_sync.next().await {
        for room in response.rooms.join.values() {
            for e in &room.timeline.events {
                if let Ok(event) = e.event.deserialize() {
                    println!("Received event {:?}", event);
                }
            }
        }
        if stop_reciver.try_recv().is_ok() {
            event!(Level::INFO, "Matrix client stopping");
            break;
        }
    }
    // loop {
    //     match stop_reciver.try_recv() {
    //         Ok(_) => {
    //             event!(Level::INFO, "Matrix client stopping");
    //             break;
    //         }
    //         Err(tokio::sync::oneshot::error::TryRecvError::Empty) => {

    //         }
    //         Err(tokio::sync::oneshot::error::TryRecvError::Closed) => {
    //             event!(Level::INFO, "Matrix client stopping");
    //             break;
    //         }
    //     }
    // }

    Ok(())
}
