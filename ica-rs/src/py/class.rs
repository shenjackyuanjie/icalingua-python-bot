pub mod ica;
pub mod tailchat;

use pyo3::{
    pyclass, pymethods,
    types::{PyBool, PyString},
    Bound, IntoPyObject, PyAny, PyRef,
};
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
    pub fn __getitem__(self_: PyRef<'_, Self>, key: String) -> Option<Bound<PyAny>> {
        match self_.data.get(&key) {
            Some(value) => match value {
                TomlValue::String(s) => Some(PyString::new(self_.py(), s).into_any()),
                TomlValue::Integer(i) => Some(i.into_pyobject(self_.py()).unwrap().into_any()),
                TomlValue::Float(f) => Some(f.into_pyobject(self_.py()).unwrap().into_any()),
                TomlValue::Boolean(b) => {
                    let py_value = PyBool::new(self_.py(), *b);
                    Some(py_value.as_any().clone())
                }
                TomlValue::Array(a) => {
                    let new_self = Self::new(TomlValue::Array(a.clone()));
                    let py_value = new_self.into_pyobject(self_.py()).unwrap().into_any();
                    Some(py_value)
                }
                TomlValue::Table(t) => {
                    let new_self = Self::new(TomlValue::Table(t.clone()));
                    let py_value = new_self.into_pyobject(self_.py()).unwrap().into_any();
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
