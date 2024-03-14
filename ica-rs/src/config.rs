use std::env;
use std::fs;

use serde::Deserialize;
use toml::from_str;
use tracing::warn;

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

/// Matrix 配置
#[derive(Debug, Clone, Deserialize)]
pub struct MatrixConfig {
    /// home server
    pub home_server: String,
    /// bot_id
    pub bot_id: String,
    /// bot password
    pub bot_password: String,
    /// 提醒的房间
    pub notice_room: Vec<String>,
    /// 是否提醒
    pub notice_start: bool,
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
    /// 是否启用 Matrix
    pub enable_matrix: Option<bool>,
    /// Matrix 配置
    pub matrix: Option<MatrixConfig>,
    /// 是否启用 Python 插件
    pub enable_py: Option<bool>,
    /// Python 插件配置
    pub py: Option<PyConfig>,
}

impl BotConfig {
    pub fn new_from_path(config_file_path: String) -> Self {
        // try read config from file
        let config = fs::read_to_string(&config_file_path).expect("Failed to read config file");
        let ret: Self = from_str(&config)
            .unwrap_or_else(|_| panic!("Failed to parse config file {}", &config_file_path));
        ret
    }
    pub fn new_from_cli() -> Self {
        let config_file_path = env::args().nth(1).expect("No config path given");
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
                    true
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

    /// 检查是否启用 Matrix
    pub fn check_matrix(&self) -> bool {
        match self.enable_matrix {
            Some(enable) => {
                if enable && self.matrix.is_none() {
                    warn!("enable_matrix 为 true 但未填写 [matrix] 配置\n将不启用 Matrix");
                    false
                } else {
                    true
                }
            }
            None => {
                if self.matrix.is_some() {
                    warn!("未填写 enable_matrix 但填写了 [matrix] 配置\n将不启用 Matrix");
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
    pub fn matrix(&self) -> MatrixConfig { self.matrix.clone().expect("No matrix config found") }
    pub fn py(&self) -> PyConfig { self.py.clone().expect("No py config found") }
}
