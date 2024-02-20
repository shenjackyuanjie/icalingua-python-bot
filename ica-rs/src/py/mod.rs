pub mod class;

use pyo3::{prelude::*, types::{IntoPyDict, PyDict}};
use tracing::{debug, info};


pub fn run() {
    Python::with_gil(|py| {
        let bot_status = class::IcaStatusPy::new();
        let _bot_status: &PyCell<_> = PyCell::new(py, bot_status).unwrap();
        
        let locals = [("state", _bot_status)].into_py_dict(py);
        py.run("print(state)", None, Some(locals)).unwrap();
    });
}

pub fn init_py() {
    debug!("initing python threads");
    pyo3::prepare_freethreaded_python();
    info!("python inited")
}
