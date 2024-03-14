use crate::config::BotConfig;
use crate::MAIN_STATUS;

#[derive(Debug, Clone)]
pub struct BotStatus {
    pub config: Option<BotConfig>,
    pub ica_status: Option<ica::MainStatus>,
    pub matrix_status: Option<matrix::MainStatus>,
}

impl BotStatus {
    pub fn update_static_config(config: BotConfig) {
        unsafe {
            MAIN_STATUS.config = Some(config);
        }
    }
    pub fn update_ica_status(status: ica::MainStatus) {
        unsafe {
            MAIN_STATUS.ica_status = Some(status);
        }
    }
    pub fn update_matrix_status(status: matrix::MainStatus) {
        unsafe {
            MAIN_STATUS.matrix_status = Some(status);
        }
    }

    pub fn static_init(config: BotConfig) {
        unsafe {
            MAIN_STATUS.ica_status = Some(ica::MainStatus {
                enable: config.check_ica(),
                qq_login: false,
                current_loaded_messages_count: 0,
                rooms: Vec::new(),
                online_status: ica::OnlineData::default(),
            });
            MAIN_STATUS.matrix_status = Some(matrix::MainStatus {
                enable: config.check_matrix(),
            });
            MAIN_STATUS.config = Some(config);
        }
    }

    pub fn global_config() -> &'static BotConfig { unsafe { MAIN_STATUS.config.as_ref().unwrap() } }
    pub fn global_ica_status() -> &'static ica::MainStatus {
        unsafe { MAIN_STATUS.ica_status.as_ref().unwrap() }
    }
    pub fn global_matrix_status() -> &'static matrix::MainStatus {
        unsafe { MAIN_STATUS.matrix_status.as_ref().unwrap() }
    }

    pub fn global_ica_status_mut() -> &'static mut ica::MainStatus {
        unsafe { MAIN_STATUS.ica_status.as_mut().unwrap() }
    }
    pub fn global_matrix_status_mut() -> &'static mut matrix::MainStatus {
        unsafe { MAIN_STATUS.matrix_status.as_mut().unwrap() }
    }
}

pub mod ica {
    use crate::data_struct::ica::all_rooms::Room;
    pub use crate::data_struct::ica::online_data::OnlineData;

    #[derive(Debug, Clone)]
    pub struct MainStatus {
        /// 是否启用 ica
        pub enable: bool,
        /// qq 是否登录
        pub qq_login: bool,
        /// 当前已加载的消息数量
        pub current_loaded_messages_count: u64,
        /// 房间数据
        pub rooms: Vec<Room>,
        /// 在线数据 (Icalingua 信息)
        pub online_status: OnlineData,
    }

    impl MainStatus {
        pub fn update_rooms(&mut self, room: Vec<Room>) { self.rooms = room; }
        pub fn update_online_status(&mut self, status: OnlineData) { self.online_status = status; }
    }
}

pub mod matrix {

    #[derive(Debug, Clone)]
    pub struct MainStatus {
        /// 是否启用 matrix
        pub enable: bool,
    }
}
