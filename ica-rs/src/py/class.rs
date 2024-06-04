pub mod ica;
pub mod tailchat;

use pyo3::prelude::*;
use toml::Value as TomlValue;

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "ConfigRequest")]
pub struct ConfigRequestPy {
    pub path: String,
}

#[pymethods]
impl ConfigRequestPy {
    #[new]
    pub fn py_new(path: String) -> Self { Self { path } }
}

#[derive(Clone)]
#[pyclass]
#[pyo3(name = "ConfigData")]
pub struct ConfigDataPy {
    pub data: TomlValue,
}

#[pymethods]
impl ConfigDataPy {
    pub fn __getitem__(self_: PyRef<'_, Self>, key: String) -> Option<Py<PyAny>> {
        match self_.data.get(&key) {
            Some(value) => match value {
                TomlValue::String(s) => Some(s.into_py(self_.py())),
                TomlValue::Integer(i) => Some(i.into_py(self_.py())),
                TomlValue::Float(f) => Some(f.into_py(self_.py())),
                TomlValue::Boolean(b) => Some(b.into_py(self_.py())),
                TomlValue::Array(a) => {
                    let new_self = Self::new(TomlValue::Array(a.clone()));
                    let py_value = new_self.into_py(self_.py());
                    Some(py_value)
                }
                TomlValue::Table(t) => {
                    let new_self = Self::new(TomlValue::Table(t.clone()));
                    let py_value = new_self.into_py(self_.py());
                    Some(py_value)
                }
                _ => None,
            },
            None => None,
        }
    }
    pub fn have_key(&self, key: String) -> bool { self.data.get(&key).is_some() }
}

impl ConfigDataPy {
    pub fn new(data: TomlValue) -> Self { Self { data } }
}
