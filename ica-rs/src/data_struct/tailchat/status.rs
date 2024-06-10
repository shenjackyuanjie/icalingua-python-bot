use serde::{Deserialize, Serialize};

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
