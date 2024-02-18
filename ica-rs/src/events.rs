use colored::Colorize;
use rust_socketio::{Event, Payload, RawClient};
use tracing::{info, warn};

use crate::data_struct::online_data::OnlineData;
use crate::py;

pub fn get_online_data(payload: Payload, _client: RawClient) {
    if let Payload::Text(values) = payload {
        if let Some(value) = values.first() {
            let online_data = OnlineData::new_from_json(value);
            info!("update_online_data {}", format!("{:#?}", online_data).cyan());
        }
    }
}

pub fn any_event(event: Event, payload: Payload, _client: RawClient) {
    let handled = vec![
        "authSucceed",
        "authFailed",
        "authRequired",
        "requireAuth",
        "onlineData",
    ];
    match &event {
        Event::Custom(event_name) => {
            if handled.contains(&event_name.as_str()) {
                return;
            }
        }
        _ => (),
    }
    match payload {
        Payload::Binary(ref data) => {
            println!("event: {} |{:?}", event, data)
        }
        Payload::Text(ref data) => {
            print!("event: {}", event.as_str().purple());
            for value in data {
                println!("|{}", value.to_string());
            }
        }
        _ => (),
    }
}

pub fn connect_callback(payload: Payload, _client: RawClient) {
    match payload {
        Payload::Text(values) => {
            if let Some(value) = values.first() {
                // if let Some("authSucceed") = value.as_str() {
                //     println!("{}", "已经登录到 icalingua!".green());
                // }
                match value.as_str() {
                    Some("authSucceed") => {
                        py::run();
                        info!("{}", "已经登录到 icalingua!".green())
                    }
                    Some("authFailed") => {
                        info!("{}", "登录到 icalingua 失败!".red());
                        panic!("登录失败")
                    }
                    Some("authRequired") => {
                        warn!("{}", "需要登录到 icalingua!".yellow())
                    }
                    _ => (),
                }
            }
        }
        _ => (),
    }
}
