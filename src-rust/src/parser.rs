#[cfg(feature = "pest")]
pub(crate) mod java_pest;
#[cfg(feature = "tree-sitter")]
pub(crate) mod java_sitter;

use crate::error::Error;
#[cfg(feature = "pest")]
use pest::Parser;

#[cfg(feature = "pest")]
fn parse_json_from_java(input: String) -> Result<serde_json::Value, Error> {
    let pairs = java_pest::RestfulParser::parse(java_pest::Rule::root, input.as_str())?;
    let first = pairs.into_iter().next();
    if first.is_none() {
        return Err("import restful_dsl failed. missing root!".into());
    }
    let root = first.unwrap().into_inner();
    Ok(serde_json::json!(&root))
}
#[cfg(feature = "pest")]
pub fn parse_json_str_from_java(input: String) -> Result<String, Error> {
    let value = parse_json_from_java(input)?;
    Ok(value.to_string())
}
