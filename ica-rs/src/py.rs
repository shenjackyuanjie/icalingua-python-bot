// use inline_python::{python, Context};

use pyo3::{prelude::*, types::IntoPyDict};

#[pyclass]
#[pyo3(name = "BotStatus")]
pub struct BotStatusPy {}

pub fn run() {
    Python::with_gil(|py| {
        let bot_status = BotStatusPy {};
        let _bot_status = PyCell::new(py, bot_status).unwrap();
        let locals = [("state", _bot_status)].into_py_dict(py);
        py.run("print(state)", None, Some(locals)).unwrap();
    });
}

pub fn init_py() {
    pyo3::prepare_freethreaded_python();
}

// pub fn run() {
//     let con: Context = python! {
//         print("Hello, world!");
//     };

// }
