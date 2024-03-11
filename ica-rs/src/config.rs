use std::env;
use std::fs;

use serde::Deserialize;
use toml::from_str;

/// Icalingua bot 的配置
#[derive(Debug, Clone, Deserialize)]
pub struct IcaConfig {
    /// icalingua 私钥
    pub private_key: String,
    /// icalingua 服务器地址
    pub host: String,
    /// bot 的 qq
    pub self_id: u64,
    /// 提醒的房间
    pub notice_room: Vec<i64>,
    /// 是否提醒
    pub notice_start: bool,
    /// 管理员列表
    pub admin_list: Vec<i64>,
    /// 过滤列表
    pub filter_list: Vec<i64>,
}

/// 主配置
#[derive(Debug, Clone, Deserialize)]
pub struct BotConfig {
    /// 是否启用 icalingua
    pub enable_ica: bool,
    /// Ica 配置
    pub ica: Option<IcaConfig>,
    /// Matrix 配置
    // TODO: MatrixConfig
    /// Python 插件路径
    pub py_plugin_path: Option<String>,
    /// Python 配置文件路径
    pub py_config_path: Option<String>,
}

impl BotConfig {
    pub fn new_from_path(config_file_path: String) -> Self {
        // try read config from file
        let config = fs::read_to_string(&config_file_path).expect("Failed to read config file");
        let ret: Self = from_str(&config)
            .expect(format!("Failed to parse config file {}", &config_file_path).as_str());
        ret
    }
    pub fn new_from_cli() -> Self {
        let config_file_path = env::args().nth(1).expect("No config path given");
        Self::new_from_path(config_file_path)
    }

    pub fn ica(&self) -> IcaConfig { self.ica.clone().expect("No ica config found") }
}
