use crate::data_struct::files::MessageFile;
use crate::data_struct::{MessageId, RoomId, UserId};

use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value as JsonValue};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum At {
    All,
    Bool(bool),
    None,
}

impl At {
    /// new_from_json(&message["at"])
    pub fn new_from_json(json: &JsonValue) -> Self {
        match json {
            JsonValue::Bool(b) => Self::Bool(*b),
            #[allow(non_snake_case)]
            JsonValue::String(_I_dont_Care) => Self::All,
            _ => Self::None,
        }
    }
}

/*export default interface LastMessage {
    content?: string
    timestamp?: string
    username?: string
    userId?: number
}
 */
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LastMessage {
    pub content: Option<String>,
    pub timestamp: Option<String>,
    pub username: Option<String>,
    #[serde(rename = "userId")]
    pub user_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ReplyMessage {
    #[serde(rename = "_id")]
    pub msg_id: String,
    pub content: String,
    pub files: JsonValue,
    #[serde(rename = "username")]
    pub sender_name: String,
}

/// {"message": {"_id":"idddddd","anonymousId":null,"anonymousflag":null,"bubble_id":0,"content":"test","date":"2024/02/18","files":[],"role":"admin","senderId":123456,"subid":1,"time":1708267062000_i64,"timestamp":"22:37:42","title":"索引管理员","username":"shenjack"},"roomId":-123456}
#[derive(Debug, Clone)]
pub struct NewMessage {
    /// 房间 id
    pub room_id: RoomId,
    /// 消息 id
    pub msg_id: MessageId,
    /// 发送者 id
    pub sender_id: UserId,
    /// 发送者名字
    pub sender_name: String,
    /// 消息内容
    pub content: String,
    /// xml / json 内容
    pub code: JsonValue,
    /// 消息时间
    pub time: NaiveDateTime,
    /// 身份
    pub role: String,
    /// 文件
    pub files: Vec<MessageFile>,
    /// 回复的消息
    pub reply: Option<ReplyMessage>,
    /// At
    pub at: At,
    /// 是否已撤回
    pub deleted: bool,
    /// 是否是系统消息
    pub system: bool,
    /// mirai?
    pub mirai: JsonValue,
    /// reveal ?
    pub reveal: bool,
    /// flash
    pub flash: bool,
    /// "群主授予的头衔"
    pub title: String,
    /// anonymous id
    pub anonymous_id: Option<i64>,
    /// 是否已被隐藏
    pub hide: bool,
    /// 气泡 id
    pub bubble_id: i64,
    /// 子? id
    pub subid: i64,
    /// 头像 img?
    pub head_img: JsonValue,
    /// 原始消息 (准确来说是 json["message"])
    pub raw_msg: JsonValue,
}

impl NewMessage {
    pub fn new_from_json(json: &JsonValue) -> Self {
        // room id 还是必定有的
        let room_id = json["roomId"].as_i64().unwrap();
        // message 本体也是
        let message = json.get("message").unwrap();
        // 消息 id
        let msg_id = message["_id"].as_str().unwrap();
        // 发送者 id (Optional)
        let sender_id = message["senderId"].as_i64().unwrap_or(-1);
        // 发送者名字 必有
        let sender_name = message["username"].as_str().unwrap();
        // 消息内容
        let content = message["content"].as_str().unwrap();
        // xml / json 内容
        let code = message["code"].clone();
        // 消息时间 (怎么这个也是可选啊(恼))
        // 没有就取当前时间
        let current = chrono::Utc::now().naive_utc();
        let time = message["time"]
            .as_i64()
            .map(|t| NaiveDateTime::from_timestamp_micros(t).unwrap_or(current))
            .unwrap_or(current);
        // 身份
        let role = message["role"].as_str().unwrap_or("unknown");
        // 文件
        let value_files = message["files"].as_array().unwrap_or(&Vec::new()).to_vec();
        let mut files = Vec::with_capacity(value_files.len());
        for file in &value_files {
            let file = serde_json::from_value::<MessageFile>(file.clone());
            if let Ok(file) = file {
                files.push(file);
            }
        }
        // 回复的消息
        let reply: Option<ReplyMessage> = match message.get("replyMessage") {
            Some(value) => serde_json::from_value::<ReplyMessage>(value.clone()).ok(),
            None => None,
        };
        // At
        let at = At::new_from_json(&message["at"]);
        // 是否已撤回
        let deleted = message["deleted"].as_bool().unwrap_or(false);
        // 是否是系统消息
        let system = message["system"].as_bool().unwrap_or(false);
        // mirai
        let mirai = message["mirai"].clone();
        // reveal
        let reveal = message["reveal"].as_bool().unwrap_or(false);
        // flash
        let flash = message["flash"].as_bool().unwrap_or(false);
        // "群主授予的头衔"
        let title = message["title"].as_str().unwrap_or("");
        // anonymous id
        let anonymous_id = message["anonymousId"].as_i64();
        // 是否已被隐藏
        let hide = message["hide"].as_bool().unwrap_or(false);
        // 气泡 id
        let bubble_id = message["bubble_id"].as_i64().unwrap_or(1);
        // 子? id
        let subid = message["subid"].as_i64().unwrap_or(1);
        // 头像 img?
        let head_img = message["head_img"].clone();
        // 原始消息
        let raw_msg = json["message"].clone();
        Self {
            room_id,
            msg_id: msg_id.to_string(),
            sender_id,
            sender_name: sender_name.to_string(),
            content: content.to_string(),
            code,
            time,
            role: role.to_string(),
            files,
            reply,
            at,
            deleted,
            system,
            mirai,
            reveal,
            flash,
            title: title.to_string(),
            anonymous_id,
            hide,
            bubble_id,
            subid,
            head_img,
            raw_msg,
        }
    }

    /// 作为回复消息使用
    pub fn as_reply(&self) -> ReplyMessage {
        ReplyMessage {
            // 虽然其实只要这一条就行
            msg_id: self.msg_id.clone(),
            // 但是懒得动上面的了, 就这样吧
            content: self.content.clone(),
            files: json!([]),
            sender_name: self.sender_name.clone(),
        }
    }

    /// 创建一条对这条消息的回复
    pub fn reply_with(&self, content: &String) -> SendMessage {
        SendMessage::new(content.clone(), self.room_id, Some(self.as_reply()))
    }

    /// 是否是回复
    pub fn is_reply(&self) -> bool {
        self.reply.is_some()
    }

    /// 获取回复
    pub fn get_reply(&self) -> Option<&ReplyMessage> {
        self.reply.as_ref()
    }

    pub fn get_reply_mut(&mut self) -> Option<&mut ReplyMessage> {
        self.reply.as_mut()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendMessage {
    pub content: String,
    #[serde(rename = "roomId")]
    pub room_id: RoomId,
    #[serde(rename = "replyMessage")]
    pub reply_to: Option<ReplyMessage>,
    #[serde(rename = "at")]
    pub at: JsonValue,
}

impl SendMessage {
    pub fn new(content: String, room_id: RoomId, reply_to: Option<ReplyMessage>) -> Self {
        Self {
            content,
            room_id,
            reply_to,
            at: json!([]),
        }
    }
}

#[cfg(test)]
mod test {
    use serde_json::json;

    use super::*;

    #[test]
    fn test_new_from_json() {
        let value = json!({"message": {"_id":"idddddd","anonymousId":null,"anonymousflag":null,"bubble_id":0,"content":"test","date":"2024/02/18","files":[],"role":"admin","senderId":123456,"subid":1,"time":1708267062000_i64,"timestamp":"22:37:42","title":"索引管理员","username":"shenjack"},"roomId":-123456});
        let new_message = NewMessage::new_from_json(&value);
        assert_eq!(new_message.msg_id, "idddddd");
        assert_eq!(new_message.sender_id, 123456);
        assert_eq!(new_message.sender_name, "shenjack");
        assert_eq!(new_message.content, "test");
        assert_eq!(new_message.role, "admin");
        assert_eq!(
            new_message.time,
            NaiveDateTime::from_timestamp_micros(1708267062000_i64).unwrap()
        );
        assert!(new_message.files.is_empty());
        assert!(new_message.get_reply().is_none());
        assert!(!new_message.is_reply());
        assert!(!new_message.deleted);
        assert!(!new_message.system);
        assert!(!new_message.reveal);
        assert!(!new_message.flash);
        assert_eq!(new_message.title, "索引管理员");
        assert!(new_message.anonymous_id.is_none());
        assert!(!new_message.hide);
        assert_eq!(new_message.bubble_id, 0);
        assert_eq!(new_message.subid, 1);
        assert!(new_message.head_img.is_null());
    }

    #[test]
    fn test_parse_reply() {
        let value = json!({"message": {"_id":"idddddd","anonymousId":null,"anonymousflag":null,"bubble_id":0,"content":"test","date":"2024/02/18","files":[],"role":"admin","senderId":123456,"subid":1,"time":1708267062000_i64,"timestamp":"22:37:42","title":"索引管理员","username":"shenjack", "replyMessage": {"content": "test", "username": "jackyuanjie", "files": [], "_id": "adwadaw"}},"roomId":-123456});
        let new_message = NewMessage::new_from_json(&value);
        assert_eq!(new_message.get_reply().unwrap().sender_name, "jackyuanjie");
        assert_eq!(new_message.get_reply().unwrap().content, "test");
        assert_eq!(new_message.get_reply().unwrap().msg_id, "adwadaw");
        assert!(new_message
            .get_reply()
            .unwrap()
            .files
            .as_array()
            .unwrap()
            .is_empty());
    }
}
