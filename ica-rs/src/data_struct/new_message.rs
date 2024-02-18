use chrono::NaiveDateTime;
use serde_json::Value as JsonValue;

/// {"message": {"_id":"idddddd","anonymousId":null,"anonymousflag":null,"bubble_id":0,"content":"test","date":"2024/02/18","files":[],"role":"admin","senderId":123456,"subid":1,"time":1708267062000_i64,"timestamp":"22:37:42","title":"索引管理员","username":"shenjack"},"roomId":-123456}
#[derive(Debug, Clone)]
pub struct NewMessage {
    /// 消息 id
    pub msg_id: String,
    /// 发送者 id
    pub sender_id: i64,
    /// 子? id
    pub subid: i64,
    /// 房间 id
    pub room_id: i64,
    /// 发送者名字
    pub sender_name: String,
    /// 消息时间
    pub time: NaiveDateTime,
    /// 身份
    pub role: String,
    /// "群主授予的头衔"
    pub title: String,
    /// 消息内容
    pub content: String,
    /// 气泡 id 
    pub bubble_id: i64,
    /// 原始消息
    pub raw: JsonValue,
}

impl NewMessage {
    pub fn new_from_json(json: &JsonValue) -> Option<Self> {
        let message = json["message"].as_object()?;
        let room_id = json["roomId"].as_i64()?;
        let sender_id = message.get("senderId")?.as_i64()?;
        let subid = message.get("subid")?.as_i64()?;
        let sender_name = message.get("username")?.as_str()?.to_string();
        let msg_id = message.get("_id")?.as_str()?.to_string();
        let time = message.get("time")?.as_i64()?;
        let time = NaiveDateTime::from_timestamp_micros(time)?;
        let role = message.get("role")?.as_str()?.to_string();
        let content = message.get("content")?.as_str()?.to_string();
        let title = message.get("title")?.as_str()?.to_string();
        let bubble_id = message.get("bubble_id")?.as_i64()?;
        Some(Self {
            msg_id,
            sender_id,
            subid,
            room_id,
            sender_name,
            time,
            role,
            title,
            content,
            bubble_id,
            raw: json.clone(),
        })
    }
}

#[cfg(test)]
mod test {
    use serde_json::json;

    use super::*;

    #[test]
    fn test_new_from_json() {
        let value = json!({"message": {"_id":"idddddd","anonymousId":null,"anonymousflag":null,"bubble_id":0,"content":"test","date":"2024/02/18","files":[],"role":"admin","senderId":123456,"subid":1,"time":1708267062000_i64,"timestamp":"22:37:42","title":"索引管理员","username":"shenjack"},"roomId":-123456});
        let new_message = NewMessage::new_from_json(&value).unwrap();
        assert_eq!(new_message.sender_id, 123456);
        assert_eq!(new_message.room_id, -123456);
        assert_eq!(new_message.sender_name, "shenjack");
        assert_eq!(new_message.msg_id, "idddddd");
        assert_eq!(new_message.role, "admin");
        assert_eq!(new_message.content, "test");
        assert_eq!(new_message.title, "索引管理员");
        assert_eq!(new_message.raw, value);
        assert_eq!(
            new_message.time,
            NaiveDateTime::from_timestamp_micros(1708267062000_i64).unwrap()
        );
        assert_eq!(new_message.raw, value);
    }
}
