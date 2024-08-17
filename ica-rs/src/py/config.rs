use std::{
    path::{Path, PathBuf},
    str::FromStr,
};

use toml_edit::{value, DocumentMut, Key, Table, TomlError, Value};
use tracing::{event, Level};

use crate::py::PyStatus;

/// ```toml
/// # 这个文件是由 shenbot 自动生成的, 请 **谨慎** 修改
/// # 请不要修改这个文件, 除非你知道你在做什么
///
/// [plugins]
/// "xxxxxxx" = false # 被禁用的插件
/// "xxxxxxx" = true # 被启用的插件
/// ```
#[derive(Debug, Clone)]
pub struct PluginConfigFile {
    pub data: DocumentMut,
}

const CONFIG_KEY: &str = "plugins";
pub const CONFIG_FILE_NAME: &str = "plugins.toml";
pub const DEFAULT_CONFIG: &str = r#"
# 这个文件是由 shenbot 自动生成的, 请 **谨慎** 修改
# 请不要修改这个文件, 除非你知道你在做什么
[plugins]
"#;

impl PluginConfigFile {
    pub fn from_str(data: &str) -> Result<Self, TomlError> {
        let data = DocumentMut::from_str(data)?;
        Ok(Self { data })
    }

    pub fn from_config_path(path: &Path) -> anyhow::Result<Self> {
        let config_path = path.join(CONFIG_FILE_NAME);
        if !config_path.exists() {
            event!(Level::INFO, "插件配置文件不存在, 正在创建");
            std::fs::write(&config_path, DEFAULT_CONFIG)?;
            Ok(Self::from_str(DEFAULT_CONFIG)?)
        } else {
            let data = std::fs::read_to_string(&config_path)?;
            Ok(Self::from_str(&data)?)
        }
    }

    pub fn verify_and_init(&mut self) {
        if self.data.get(CONFIG_KEY).is_none() {
            event!(Level::INFO, "插件配置文件缺少 plugins 字段, 正在初始化");
            self.data.insert_formatted(
                &Key::from_str(CONFIG_KEY).unwrap(),
                toml_edit::Item::Table(Table::new()),
            );
        }
    }

    /// 获取插件状态
    /// 默认为 true
    pub fn get_status(&self, path: &Path) -> bool {
        let path_str = path.to_str().unwrap();
        if let Some(item) = self.data.get(CONFIG_KEY) {
            if let Some(table) = item.as_table() {
                if let Some(item) = table.get(path_str) {
                    if let Some(bool) = item.as_bool() {
                        return bool;
                    }
                }
            }
        }
        true
    }

    /// 设置插件状态
    pub fn set_status(&mut self, path: &Path, status: bool) {
        self.verify_and_init();
        let path_str = path.to_str().unwrap();
        let table = self.data.get_mut(CONFIG_KEY).unwrap().as_table_mut().unwrap();
        if table.contains_key(path_str) {
            match table.get_mut(path_str).unwrap().as_value_mut() {
                Some(value) => *value = Value::from(status),
                None => {
                    table.insert(path_str, value(status));
                }
            }
        } else {
            table.insert(path_str, value(status));
        }
    }

    pub fn sync_status_from_config(&mut self) {
        let plugins = PyStatus::get_map_mut();
        self.verify_and_init();
        plugins.iter_mut().for_each(|(path, status)| {
            let config_status = self.get_status(path);
            event!(Level::INFO, "插件状态: {:?} {} -> {}", path, status.enabled, config_status);
            status.enabled = config_status;
        });
    }

    pub fn sync_status_to_config(&mut self) {
        let plugins = PyStatus::get_map();
        self.verify_and_init();
        let table = self.data.get_mut(CONFIG_KEY).unwrap().as_table_mut().unwrap();
        table.clear();
        plugins.iter().for_each(|(path, status)| {
            table.insert(path.to_str().unwrap(), value(status.enabled));
        });
    }

    pub fn write_to_file(&self, path: &PathBuf) -> Result<(), std::io::Error> {
        let config_path = path.join(CONFIG_FILE_NAME);
        std::fs::write(config_path, self.data.to_string())?;
        Ok(())
    }
}
