pub mod class;

use std::{collections::HashMap, path::PathBuf};

use pyo3::{prelude::*, types::IntoPyDict};
use tracing::{debug, info, warn};
use blake3::Hasher;

use crate::config::IcaConfig;

#[derive(Debug, Clone)]
pub struct PyStatus {
    pub files: Option<HashMap<PathBuf, (Vec<u8>, String)>>,
}

impl PyStatus {
    pub fn get_files() -> &'static HashMap<PathBuf, (Vec<u8>, String)> {
        unsafe {
            match PYSTATUS.files.as_ref() {
                Some(files) => files,
                None => {
                    debug!("No files in py status");
                    PYSTATUS.files = Some(HashMap::new());
                    PYSTATUS.files.as_ref().unwrap()
                },
            }
        }
    }

    pub fn add_file(path: PathBuf, content: Vec<u8>, hash: String) {
        unsafe {
            match PYSTATUS.files.as_mut() {
                Some(files) => {
                    files.insert(path, (content, hash));
                },
                None => {
                    let mut files = HashMap::new();
                    files.insert(path, (content, hash));
                    PYSTATUS.files = Some(files);
                },
            }
        }
    }

    pub fn verify_file(path: &PathBuf, hash: &String) -> bool {
        unsafe {
            match PYSTATUS.files.as_ref() {
                Some(files) => {
                    match files.get(path) {
                        Some((_, file_hash)) => file_hash == hash,
                        None => false,
                    }
                },
                None => false,
            }
        }
    }
}

pub static mut PYSTATUS: PyStatus = PyStatus { files: None };

pub fn run() {
    Python::with_gil(|py| {
        let bot_status = class::IcaStatusPy::new();
        let _bot_status: &PyCell<_> = PyCell::new(py, bot_status).unwrap();

        let locals = [("state", _bot_status)].into_py_dict(py);
        py.run("from pathlib import Path\nprint(Path.cwd())\nprint(state)", None, Some(locals)).unwrap();
    });
}

pub fn load_py_file(path: &PathBuf) -> (Vec<u8>, String) {
    let mut hasher = Hasher::new();
    let content = std::fs::read(path).unwrap();
    hasher.update(&content);
    let hash = hasher.finalize().as_bytes().to_vec();
    (content, hex::encode(hash))
}

pub fn init_py(config: &IcaConfig) {
    debug!("initing python threads");
    pyo3::prepare_freethreaded_python();
    if let Some(plugin_path) = &config.py_plugin_path {
        let path = PathBuf::from(plugin_path);
        if path.exists() {
            info!("finding plugins in: {:?}", path);
            // 搜索所有的 py 文件 和 文件夹单层下面的 py 文件
            match path.read_dir() {
                Err(e) => {
                    warn!("failed to read plugin path: {:?}", e);
                }
                Ok(dir) => {
                    for entry in dir {
                        if let Ok(entry) = entry {
                            let path = entry.path();
                            if let Some(ext) = path.extension() {
                                if ext == "py" {

                                }
                            }
                        }
                    }
                }
            }
        } else {
            warn!("plugin path not exists: {:?}", path);
        }
    }

    info!("python inited")
}
