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
    pub notice_start: Option<bool>,
    /// Python 插件路径
    pub py_plugin_path: Option<String>,
}

impl IcaConfig {
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
}
