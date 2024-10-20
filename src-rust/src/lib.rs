mod error;

use wasm_bindgen::prelude::*;

#[cfg(feature = "debug")]
extern crate console_error_panic_hook;

#[wasm_bindgen]
pub fn test() -> String {
    "hello from rust".into()
}
