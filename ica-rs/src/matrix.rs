pub mod events;

use std::str::FromStr;

use matrix_sdk::{
    config::SyncSettings,
    ruma::{
        api::client::message::send_message_event,
        events::room::message::{
            AddMentions, ForwardThread, MessageType, OriginalSyncRoomMessageEvent,
            RoomMessageEventContent,
        },
        OwnedRoomId, TransactionId,
    },
    Client, Room, RoomState,
};
use tracing::{event, span, Level};
use url::Url;

use crate::config::MatrixConfig;
use crate::error::{ClientResult, MatrixError};
use crate::StopGetter;

pub async fn start_matrix(
    config: &MatrixConfig,
    stop_reciver: StopGetter,
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

    client.add_event_handler(on_room_message);

    match client.sync_once(SyncSettings::new()).await {
        Ok(_) => {
            event!(Level::INFO, "Synced");
        }
        Err(error) => {
            event!(Level::ERROR, "Failed to sync: {}", error);
            return Err(MatrixError::MatrixError(error));
        }
    }

    client.sync(SyncSettings::default()).await?;

    // while stop_reciver.await.is_err() {
    //     event!(Level::INFO, "Matrix client is running");
    //     tokio::time::sleep(std::time::Duration::from_secs(1)).await;
    // }

    event!(Level::INFO, "Matrix is not implemented yet");
    stop_reciver.await.ok();
    event!(Level::INFO, "Matrix client stopping");
    // some stop
    event!(Level::INFO, "Matrix client stopped");
    Ok(())
}

pub async fn on_room_message(event: OriginalSyncRoomMessageEvent, room: Room) {
    // We only want to listen to joined rooms.
    if room.state() != RoomState::Joined {
        return;
    }

    // We only want to log text messages.
    let MessageType::Text(msgtype) = &event.content.msgtype else {
        return;
    };

    // 匹配消息

    // /bot
    if msgtype.body == "/bot" {
        let pong = format!("shenbot v {}\nmatrix-rs v{}", crate::VERSION, crate::MATRIX_VERSION);

        let reply = RoomMessageEventContent::text_plain(pong);
        let reply = reply.make_reply_to(
            &event.into_full_event(room.room_id().to_owned()),
            ForwardThread::No,
            AddMentions::No,
        );

        room.send(reply).await.expect("Failed to send message");
        return;
    }

    // 发给 Python 处理剩下的
}
