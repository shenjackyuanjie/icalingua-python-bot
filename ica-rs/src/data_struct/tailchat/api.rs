use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileUpload {
    pub etag: String,
    pub path: String,
    pub url: String,
}
