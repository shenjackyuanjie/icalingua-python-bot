use serde::{Deserialize, Serialize};
use serde_json::{json, Value as JsonValue};

use crate::data_struct::tailchat::{ConverseId, GroupId, MessageId, UserId};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ReciveMessage {
    /// 消息ID
    #[serde(rename = "_id")]
    pub msg_id: MessageId,
    /// 消息内容
    pub content: String,
    /// 发送者ID
    #[serde(rename = "author")]
    pub sender_id: UserId,
    /// 服务器ID
    #[serde(rename = "groupId")]
    pub group_id: GroupId,
    /// 会话ID
    #[serde(rename = "converseId")]
    pub converse_id: ConverseId,
    /// 是否有回复?
    #[serde(rename = "hasRecall")]
    pub has_recall: bool,
    /// 暂时懒得解析这玩意
    /// 准确来说是不确定内容, 毕竟没细看 API
    pub meta: JsonValue,
    /// 也懒得解析这玩意
    pub reactions: Vec<JsonValue>,
    /// 创建时间
    #[serde(rename = "createdAt")]
    pub created_at: JsonValue,
    /// 更新时间
    #[serde(rename = "updatedAt")]
    pub updated_at: JsonValue,
    /// 未知
    #[serde(rename = "__v")]
    pub v: JsonValue,
}

impl ReciveMessage {
    pub fn is_reply(&self) -> bool { self.meta.get("reply").is_some() }

    /// 创建一个对这条消息的回复
    pub fn as_reply(&self) -> SendingMessage {
        SendingMessage::new(
            "".to_string(),
            self.converse_id.clone(),
            self.group_id.clone(),
            Some(ReplyMeta::from_recive_message(self)),
        )
    }

    /// 回复这条消息
    pub fn reply_with(&self, content: String) -> SendingMessage {
        SendingMessage::new(
            content,
            self.converse_id.clone(),
            self.group_id.clone(),
            Some(ReplyMeta::from_recive_message(self)),
        )
    }
}

#[derive(Debug, Clone, Serialize)]
/// 将要发送的消息
///
/// 发送时:
/// - `content`: 回复的消息内容
/// - `converseId`: 会话ID
/// - `groupId`: 服务器ID
/// - `meta`: 回复的消息的元数据 （ 可能为空 ）
///   - `mentions`: 被回复的人的ID (可以是多个)
///   - `reply`: 被回复的消息
///     - `_id`: 被回复的消息ID
///     - `author`: 被回复的消息的发送者ID
///     - `content`: 被回复的消息内容
pub struct SendingMessage {
    /// 消息内容
    ///
    /// 其实还有个 plain, 就是不知道干啥的
    pub content: String,
    /// 会话ID
    #[serde(rename = "converseId")]
    pub converse_id: ConverseId,
    /// 服务器ID
    #[serde(rename = "groupId")]
    pub group_id: GroupId,
    /// 消息的元数据
    pub meta: Option<ReplyMeta>,
}

impl SendingMessage {
    pub fn new(
        content: String,
        converse_id: ConverseId,
        group_id: GroupId,
        meta: Option<ReplyMeta>,
    ) -> Self {
        Self {
            content,
            converse_id,
            group_id,
            meta,
        }
    }
    pub fn new_without_meta(content: String, converse_id: ConverseId, group_id: GroupId) -> Self {
        Self {
            content,
            converse_id,
            group_id,
            meta: None,
        }
    }
    pub fn as_value(&self) -> JsonValue { serde_json::to_value(self).unwrap() }
}

#[derive(Debug, Clone)]
pub struct ReplyMeta {
    /// 被回复的人的ID (可以是多个)
    pub mentions: Vec<UserId>,
    /// 被回复的消息ID
    pub reply_id: MessageId,
    /// 被回复的消息的发送者ID
    pub reply_author: UserId,
    /// 被回复的消息内容
    pub reply_content: String,
}

impl ReplyMeta {
    pub fn from_recive_message(msg: &ReciveMessage) -> Self {
        Self {
            mentions: vec![msg.sender_id.clone()],
            reply_id: msg.msg_id.clone(),
            reply_author: msg.sender_id.clone(),
            reply_content: msg.content.clone(),
        }
    }
    pub fn add_mention(&mut self, user_id: UserId) { self.mentions.push(user_id); }
    pub fn replace_content(&mut self, content: String) { self.reply_content = content; }
}

impl Serialize for ReplyMeta {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let reply = json! {
            {
                "_id": self.reply_id,
                "author": self.reply_author,
                "content": self.reply_content,
            }
        };
        let mut map = serde_json::Map::new();
        map.insert("mentions".to_string(), serde_json::to_value(&self.mentions).unwrap());
        map.insert("reply".to_string(), reply);
        map.serialize(serializer)
    }
}
