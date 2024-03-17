use matrix_sdk::{
    ruma::events::room::message::{
        AddMentions, ForwardThread, MessageType, OriginalSyncRoomMessageEvent,
        RoomMessageEventContent,
    },
    Room, RoomState,
};
use tracing::{event, span, Level};

use crate::py::call::matrix_new_message_py;

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
            ForwardThread::Yes,
            AddMentions::No,
        );

        room.send(reply).await.expect("Failed to send message");
        return;
    }

    // 发给 Python 处理剩下的
    matrix_new_message_py().await;
}
