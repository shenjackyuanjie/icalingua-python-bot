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
        // env::set_var("PYO3_PRINT_CONFIG", "1");
        // env::set_var("PYO3_PYTHON", "/usr/bin/python3.10");

        // cargo:rustc-link-lib=static=
        // println!("cargo:rustc-link-lib=python3.10");
        // println!("cargo:rustc-link-arg-bins=-Wl,-Bstatic");
        // println!("cargo:rustc-link-arg-bins=-Wl,--whole-archive");
        // println!("cargo:rustc-link-arg-bins=-lpython3.10");
        // println!("cargo:rustc-link-arg-bins=-Wl,-Bdynamic");
        // println!("cargo:rustc-link-arg-bins=-Wl,--no-whole-archive");
        // println!("cargo:rustc-link-arg-bins=-lz");
        // println!("cargo:rustc-link-arg-bins=-lexpat");
        // println!("cargo:rustc-link-arg-bins=-lutil");
        // println!("cargo:rustc-link-arg-bins=-lm");
        // println!("cargo:rustc-link-arg-bins=-Wl,--export-dynamic");

        // pkg_config::Config::new()
        //     .atleast_version("3.8")
        //     .probe("python3-embed")
        //     .unwrap();
    }
}

fn main() {
    pyo3_config();
}
