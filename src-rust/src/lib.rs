mod error;
#[cfg(test)]
mod java_code_demo;
mod parser;

use wasm_bindgen::prelude::*;

#[cfg(feature = "debug")]
extern crate console_error_panic_hook;

#[cfg(feature = "pest")]
#[wasm_bindgen]
pub fn parse_java(content: String) -> String {
    let result = parser::parse_json_str_from_java(content);
    match result {
        Ok(v) => v.to_string(),
        Err(e) => e.to_string(),
    }
}

#[cfg(feature = "tree-sitter")]
#[wasm_bindgen]
pub fn parse_java_types(content: String) -> String {
    let result = parser::java_sitter::parse_java_types(content);
    match result {
        Ok(v) => serde_json::to_string(&v).unwrap(),
        Err(e) => e.to_string(),
    }
}

#[wasm_bindgen]
pub fn test() -> String {
    "hello from rust".into()
}
