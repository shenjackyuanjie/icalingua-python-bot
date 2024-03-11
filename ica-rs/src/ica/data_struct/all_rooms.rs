use crate::ica::data_struct::messages::{At, LastMessage};
use crate::ica::data_struct::RoomId;

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

/// export default interface Room {
///     roomId: number
///     roomName: string
///     index: number
///     unreadCount: number
///     priority: 1 | 2 | 3 | 4 | 5
///     utime: number
///     users:
///         | [{ _id: 1; username: '1' }, { _id: 2; username: '2' }]
///         | [{ _id: 1; username: '1' }, { _id: 2; username: '2' }, { _id: 3; username: '3' }]
///     at?: boolean | 'all'
///     lastMessage: LastMessage
///     autoDownload?: boolean
///     downloadPath?: string
/// }
#[derive(Debug, Clone)]
pub struct Room {
    pub room_id: RoomId,
    pub room_name: String,
    pub index: i64,
    pub unread_count: u64,
    pub priority: u8,
    pub utime: i64,
    /// 我严重怀疑是脱裤子放屁
    /// 历史遗留啊,那没事了()
    // pub users: JsonValue,
    pub at: At,
    pub last_message: LastMessage,
    pub auto_download: Option<String>,
    pub download_path: Option<String>,
}

impl Room {
    pub fn new_from_json(json: &JsonValue) -> Self {
        let inner = serde_json::from_value::<InnerRoom>(json.clone()).unwrap();
        let at = At::new_from_json(&json["at"]);
        Self {
            room_id: inner.room_id,
            room_name: inner.room_name,
            index: inner.index,
            unread_count: inner.unread_count,
            priority: inner.priority,
            utime: inner.utime,
            // users: inner.users,
            at,
            last_message: inner.last_message,
            auto_download: inner.auto_download,
            download_path: inner.download_path,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct InnerRoom {
    #[serde(rename = "roomId")]
    pub room_id: RoomId,
    #[serde(rename = "roomName")]
    pub room_name: String,
    #[serde(rename = "index")]
    pub index: i64,
    #[serde(rename = "unreadCount")]
    pub unread_count: u64,
    #[serde(rename = "priority")]
    pub priority: u8,
    #[serde(rename = "utime")]
    pub utime: i64,
    #[serde(rename = "users")]
    pub users: JsonValue,
    // 忽略 at
    #[serde(rename = "lastMessage")]
    pub last_message: LastMessage,
    #[serde(rename = "autoDownload")]
    pub auto_download: Option<String>,
    #[serde(rename = "downloadPath")]
    pub download_path: Option<String>,
}
