use crate::config::BotConfig;

pub struct BotStatus {
    pub config: Option<BotConfig>,
    pub ica_status: Option<ica::MainStatus>,
    pub matrix_status: Option<matrix::MainStatus>,
}

pub mod ica {
    pub struct MainStatus {}
}

pub mod matrix {
    pub struct MainStatus {}
}
