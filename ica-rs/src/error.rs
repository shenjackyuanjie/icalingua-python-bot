pub type ClientResult<T, E> = Result<T, E>;

#[derive(Debug)]
pub enum IcaError {
    /// Socket IO 链接错误
    SocketIoError(rust_socketio::Error),
}

#[derive(Debug)]
pub enum MatrixError {
    /// Homeserver Url 错误
    HomeserverUrlError(url::ParseError),
    /// Http 请求错误
    HttpError(matrix_sdk::HttpError),
    /// Matrix Error
    MatrixError(matrix_sdk::Error),
}

impl From<rust_socketio::Error> for IcaError {
    fn from(e: rust_socketio::Error) -> Self { IcaError::SocketIoError(e) }
}

impl From<matrix_sdk::Error> for MatrixError {
    fn from(e: matrix_sdk::Error) -> Self { MatrixError::MatrixError(e) }
}

impl std::fmt::Display for IcaError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            IcaError::SocketIoError(e) => write!(f, "Socket IO 链接错误: {}", e),
        }
    }
}

impl std::error::Error for IcaError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            IcaError::SocketIoError(e) => Some(e),
        }
    }
}

impl std::fmt::Display for MatrixError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MatrixError::HomeserverUrlError(e) => write!(f, "Homeserver Url 错误: {}", e),
            MatrixError::HttpError(e) => write!(f, "Http 请求错误: {}", e),
            MatrixError::MatrixError(e) => write!(f, "Matrix Error: {}", e),
        }
    }
}

impl std::error::Error for MatrixError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            MatrixError::HomeserverUrlError(e) => Some(e),
            MatrixError::HttpError(e) => Some(e),
            MatrixError::MatrixError(e) => Some(e),
        }
    }
}
