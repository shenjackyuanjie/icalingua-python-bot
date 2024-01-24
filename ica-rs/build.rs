use std::env;

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
        env::set_var("PYO3_PYTHON", "python3.10")
    }
}

fn main() {
    pyo3_config();
}
