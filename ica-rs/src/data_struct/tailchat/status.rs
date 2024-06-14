use std::sync::Arc;

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

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

#[allow(unused)]
pub type Writeable<T> = Arc<RwLock<T>>;

#[derive(Debug, Clone)]
pub struct BotStatus {
    user_id: UserId,
}

impl BotStatus {
    pub fn new(user_id: UserId) -> Self { Self { user_id } }

    pub fn get_user_id(&self) -> UserId { self.user_id.clone() }
}

#[derive(Debug, Clone)]
pub struct BotStatusSnapshot {
    user_id: UserId,
}
