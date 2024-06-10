use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use crate::data_struct::tailchat::UserId;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LoginData {
    pub jwt: String,
    #[serde(rename = "userId")]
    pub user_id: UserId,
    pub email: String,
    pub nickname: String,
    pub avatar: String,
}

/*
{"__v":0,"_id":"66045ddb5163504389a6f5b1","createdAt":"2024-03-27T17:56:43.528Z","members":["6602e20d7b8d10675758e36b","6604482b5163504389a6f481"],"type":"DM","updatedAt":"2024-03-27T17:56:43.528Z"}
*/
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct UpdateDMConverse {
    /// 会话ID
    #[serde(rename = "_id")]
    pub id: String,
    /// 创建时间
    #[serde(rename = "createdAt")]
    pub created_at: String,
    /// 成员
    pub members: Vec<UserId>,
    /// 类型
    #[serde(rename = "type")]
    pub converse_type: String,
    /// 更新时间
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}
