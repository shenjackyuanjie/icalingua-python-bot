use serde::{Deserialize, Serialize};
use serde_json::{json, Value as JsonValue};

use crate::data_struct::tailchat::{ConverseId, GroupId, MessageId, UserId};

/*{'_id': '6606b3075163504389a6fc47',
'content': '光速！(',
'author': '6602e20d7b8d10675758e36b',
'groupId': '6602e331d31fd31b04aa0693',
'converseId': '6602f785928c4254f17726b2',
'hasRecall': False,
'meta': {'mentions': []},
'reactions': [],
'createdAt': ExtType(code=0, data=b'\x00\x00\x01\x8e\x8a+TJ'),
'updatedAt': ExtType(code=0, data=b'\x00\x00\x01\x8e\x8a+TJ'),
'__v': 0} */

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
    pub fn as_reply(&self) -> ReplyMessage {
        ReplyMessage {
            content: self.content.clone(),
            converse_id: self.converse_id.clone(),
            group_id: self.group_id.clone(),
            reply_id: self.msg_id.clone(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendingMessage {
    /// 消息内容
    pub content: String,
    /// 会话ID
    #[serde(rename = "converseId")]
    pub converse_id: ConverseId,
    /// 服务器ID
    #[serde(rename = "groupId")]
    pub group_id: GroupId,
}

#[derive(Debug, Clone)]
pub struct ReplyMeta {
    /// 被回复的人的ID (可以是多个?)
    pub mentions: Vec<UserId>,
    /// 被回复的消息ID
    pub reply_id: MessageId,
    /// 被回复的消息的发送者ID
    pub reply_author: UserId,
    /// 被回复的消息内容
    pub reply_content: String,
}

impl Serialize for ReplyMeta {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let reply = json! {
            {
                "replyId": self.reply_id,
                "replyAuthor": self.reply_author,
                "replyContent": self.reply_content,
            }
        };
        let mut map = serde_json::Map::new();
        map.insert("mentions".to_string(), serde_json::to_value(&self.mentions).unwrap());
        map.insert("reply".to_string(), reply);
        map.serialize(serializer)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplyMessage {
    /// 消息内容
    pub content: String,
    /// 会话ID
    #[serde(rename = "converseId")]
    pub converse_id: ConverseId,
    /// 服务器ID
    #[serde(rename = "groupId")]
    pub group_id: GroupId,
    /// 回复的消息ID
    #[serde(rename = "replyId")]
    pub reply_id: MessageId,
}
