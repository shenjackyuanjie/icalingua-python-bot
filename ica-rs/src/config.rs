use std::env;
use std::fs;

use colored::Colorize;
use serde::Deserialize;
use toml::from_str;
use tracing::warn;

use crate::data_struct::{ica, tailchat};

/// Icalingua bot 的配置
#[derive(Debug, Clone, Deserialize)]
pub struct IcaConfig {
    /// icalingua 私钥
    pub private_key: String,
    /// icalingua 服务器地址
    pub host: String,
    /// bot 的 qq
    pub self_id: ica::UserId,
    /// 提醒的房间
    pub notice_room: Vec<ica::RoomId>,
    /// 是否提醒
    pub notice_start: bool,
    /// 管理员列表
    pub admin_list: Vec<ica::UserId>,
    /// 过滤列表
    pub filter_list: Vec<ica::UserId>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TailchatConfig {
    /// 服务器地址
    pub host: String,
    /// 机器人 App ID
    pub app_id: String,
    /// 机器人 App Secret
    pub app_secret: String,
    /// 提醒的房间
    pub notice_room: Vec<(tailchat::GroupId, tailchat::ConverseId)>,
    /// 是否提醒
    pub notice_start: bool,
    /// 管理员列表
    pub admin_list: Vec<tailchat::UserId>,
    /// 过滤列表
    pub filter_list: Vec<tailchat::UserId>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PyConfig {
    /// 插件路径
    pub plugin_path: String,
    /// 配置文件路径
    pub config_path: String,
}

/// 主配置
#[derive(Debug, Clone, Deserialize)]
pub struct BotConfig {
    /// 是否启用 icalingua
    pub enable_ica: Option<bool>,
    /// Ica 配置
    pub ica: Option<IcaConfig>,

    /// 是否启用 Tailchat
    pub enable_tailchat: Option<bool>,
    /// Tailchat 配置
    pub tailchat: Option<TailchatConfig>,

    /// 是否启用 Python 插件
    pub enable_py: Option<bool>,
    /// Python 插件配置
    pub py: Option<PyConfig>,
}

impl BotConfig {
    pub fn new_from_path(config_file_path: String) -> Self {
        // try read config from file
        let config = fs::read_to_string(&config_file_path).expect("Failed to read config file");
        let ret: Self = from_str(&config).unwrap_or_else(|e| {
            panic!("Failed to parse config file {}\ne:{:?}", &config_file_path, e)
        });
        ret
    }
    pub fn new_from_cli() -> Self {
        // let config_file_path = env::args().nth(1).expect("No config path given");
        // -c <config_file_path>
        let mut config_file_path = String::new();
        let mut args = env::args();
        while let Some(arg) = args.next() {
            if arg == "-c" {
                config_file_path = args.next().expect(&format!(
                    "{}",
                    "No config path given\nUsage: -c <config_file_path>".red()
                ));
                break;
            }
        }
        Self::new_from_path(config_file_path)
    }

    /// 检查是否启用 ica
    pub fn check_ica(&self) -> bool {
        match self.enable_ica {
            Some(enable) => {
                if enable && self.ica.is_none() {
                    warn!("enable_ica 为 true 但未填写 [ica] 配置\n将不启用 ica");
                    false
                } else {
                    enable
                }
            }
            None => {
                if self.ica.is_some() {
                    warn!("未填写 enable_ica 但填写了 [ica] 配置\n将不启用 ica");
                }
                false
            }
        }
    }

    /// 检查是否启用 Tailchat
    pub fn check_tailchat(&self) -> bool {
        match self.enable_tailchat {
            Some(enable) => {
                if enable && self.tailchat.is_none() {
                    warn!("enable_tailchat 为 true 但未填写 [tailchat] 配置\n将不启用 Tailchat");
                    false
                } else {
                    enable
                }
            }
            None => {
                if self.tailchat.is_some() {
                    warn!("未填写 enable_tailchat 但填写了 [tailchat] 配置\n将不启用 Tailchat");
                }
                false
            }
        }
    }

    /// 检查是否启用 Python 插件
    pub fn check_py(&self) -> bool {
        match self.enable_py {
            Some(enable) => {
                if enable && self.py.is_none() {
                    warn!("enable_py 为 true 但未填写 [py] 配置\n将不启用 Python 插件");
                    false
                } else {
                    true
                }
            }
            None => {
                if self.py.is_some() {
                    warn!("未填写 enable_py 但填写了 [py] 配置\n将不启用 Python 插件");
                }
                false
            }
        }
    }

    pub fn ica(&self) -> IcaConfig { self.ica.clone().expect("No ica config found") }
    pub fn tailchat(&self) -> TailchatConfig {
        self.tailchat.clone().expect("No tailchat config found")
    }
    pub fn py(&self) -> PyConfig { self.py.clone().expect("No py config found") }
}
