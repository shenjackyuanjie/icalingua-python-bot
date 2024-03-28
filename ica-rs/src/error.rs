pub type ClientResult<T, E> = Result<T, E>;

#[derive(Debug)]
pub enum IcaError {
    /// Socket IO 链接错误
    SocketIoError(rust_socketio::error::Error),
}

impl From<rust_socketio::Error> for IcaError {
    fn from(e: rust_socketio::Error) -> Self { IcaError::SocketIoError(e) }
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
