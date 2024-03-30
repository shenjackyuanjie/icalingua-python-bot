pub type ClientResult<T, E> = Result<T, E>;

#[derive(Debug)]
pub enum IcaError {
    /// Socket IO 链接错误
    SocketIoError(rust_socketio::error::Error),
    /// 登录失败
    LoginFailed(String),
}

#[derive(Debug)]
pub enum TailchatError {
    /// Socket IO 链接错误
    SocketIoError(rust_socketio::error::Error),
    /// 登录失败
    LoginFailed(String),
}

#[derive(Debug)]
pub enum PyPluginError {
    /// 插件内未找到指定函数
    /// 函数名, 模块名
    FuncNotFound(String, String),
    /// 插件内函数获取错误
    /// pyerr, func_name, module_name
    CouldNotGetFunc(pyo3::PyErr, String, String),
    /// 插件内函数不可调用
    FuncNotCallable(String, String),
    /// 插件内函数调用错误
    /// pyerr, func_name, module_name
    FuncCallError(pyo3::PyErr, String, String),
}

impl From<rust_socketio::Error> for IcaError {
    fn from(e: rust_socketio::Error) -> Self { IcaError::SocketIoError(e) }
}

impl std::fmt::Display for IcaError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            IcaError::SocketIoError(e) => write!(f, "Socket IO 链接错误: {}", e),
            IcaError::LoginFailed(e) => write!(f, "登录失败: {}", e),
        }
    }
}

impl std::fmt::Display for TailchatError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TailchatError::SocketIoError(e) => write!(f, "Socket IO 链接错误: {}", e),
            TailchatError::LoginFailed(e) => write!(f, "登录失败: {}", e),
        }
    }
}

impl std::fmt::Display for PyPluginError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PyPluginError::FuncNotFound(name, module) => {
                write!(f, "插件内未找到函数: {} in {}", name, module)
            }
            PyPluginError::CouldNotGetFunc(py_err, name, module) => {
                write!(f, "插件内函数获取错误: {:#?}|{} in {}", py_err, name, module)
            }
            PyPluginError::FuncNotCallable(name, module) => {
                write!(f, "插件内函数不可调用: {} in {}", name, module)
            }
            PyPluginError::FuncCallError(py_err, name, module) => {
                write!(f, "插件内函数调用错误: {:#?}|{} in {}", py_err, name, module)
            }
        }
    }
}

impl std::error::Error for IcaError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            IcaError::SocketIoError(e) => Some(e),
            IcaError::LoginFailed(_) => None,
        }
    }
}

impl std::error::Error for TailchatError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            TailchatError::SocketIoError(e) => Some(e),
            TailchatError::LoginFailed(_) => None,
        }
    }
}

impl std::error::Error for PyPluginError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            PyPluginError::FuncNotFound(_, _) => None,
            PyPluginError::CouldNotGetFunc(e, _, _) => Some(e),
            PyPluginError::FuncNotCallable(_, _) => None,
            PyPluginError::FuncCallError(e, _, _) => Some(e),
        }
    }
}
