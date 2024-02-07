use std::env;

#[allow(unused)]
// 指定 pyo3 的绑定对象
fn pyo3_config() {
    // PYO3_PYTHON=xxxx
    #[cfg(windows)]
    {
        env::set_var("PYO3_PYTHON", "python3.10")
    }
    // wsl
    #[cfg(target_os = "linux")]
    {
        env::set_var("PYO3_PRINT_CONFIG", "1");
        env::set_var("PYO3_PYTHON", "/usr/bin/python3.11");
    }
}

fn main() {
    // pyo3_config();
}
