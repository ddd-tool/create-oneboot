// fn main() {
//     let dir = ["bindings", "c"].join(std::path::MAIN_SEPARATOR_STR);
//     let src_dir = std::path::Path::new(dir.as_str());

//     let mut c_config = cc::Build::new();
//     c_config.std("c11").include(src_dir);

//     #[cfg(target_env = "msvc")]
//     c_config.flag("-utf-8");

//     let parser_path = src_dir.join("parser.c");
//     c_config.file(&parser_path);
//     println!("cargo:rerun-if-changed={}", parser_path.to_str().unwrap());

//     c_config.compile("tree-sitter-java");
// }

fn main() {
    //     cc::Build::new()
    //         .file("F:/vscode_projects/@ddd-tool/create-trans/src-rust/bindings/c/parser.c")
    //         .compile("parser");

    // use std::{env, path::PathBuf};
    // // 生成绑定
    // let bindings = bindgen::Builder::default()
    //     .header("bindings/c/parser.h") // C 头文件路径
    //     .generate()
    //     .expect("Unable to generate bindings");

    // // 将生成的绑定写入 $OUT_DIR/bindings.rs
    // let out_path = PathBuf::from(env::var("OUT_DIR").unwrap());
    // bindings
    //     .write_to_file(out_path.join("bindings.rs"))
    //     .expect("Couldn't write bindings!");
}
