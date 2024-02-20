use crate::data_struct::messages::{At, LastMessage};
use crate::data_struct::RoomId;

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
    pub users: JsonValue,
    pub at: At,
    pub last_message: LastMessage,
    pub auto_donwload: String,
    pub download_path: String,
}
