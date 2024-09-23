use pest_derive::Parser;

#[derive(Parser)]
#[grammar = "_pest_home/java.pest"]
pub(crate) struct RestfulParser;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::java_code_demo;
    use pest::Parser;

    #[test]
    fn test_package_declaration() {
        let input = "package com.github.alphafoxz.oneboot.domain.preset_sys.user.vo;";
        RestfulParser::parse(Rule::package_declaration, input).unwrap();
    }

    #[test]
    fn test_import_declaration() {
        let input = r#"import java.time.OffsetDateTime;"#;
        RestfulParser::parse(Rule::import_declaration, input).unwrap();
        let input = r#"import java.time.*;"#;
        RestfulParser::parse(Rule::import_declaration, input).unwrap();
    }

    #[test]
    fn test_string_value() {
        let input = r#""""#;
        RestfulParser::parse(Rule::string_expression, input).unwrap();
        let input = r#""\"hello\": \"world\"""#;
        RestfulParser::parse(Rule::string_expression, input).unwrap();
    }

    #[test]
    fn test_function_declaration() {
        let input = r#"public static <T extends Object> Map<String, Object> test() {
}"#;
        RestfulParser::parse(Rule::function_declaration, input).unwrap();
    }

    #[test]
    fn test_annotation_expression() {
        let input = r#"@Deprecated"#;
        RestfulParser::parse(Rule::annotation_expression, input).unwrap();
        let input = r#"@Builder ( toBuilder = true )"#;
        RestfulParser::parse(Rule::annotation_expression, input).unwrap();
        let input = r#"@Builder ( String.class )"#;
        RestfulParser::parse(Rule::annotation_expression, input).unwrap();
        let input = r#"@Builder ( {String.class} )"#;
        RestfulParser::parse(Rule::annotation_expression, input).unwrap();
        let input = r#"@Builder(access = AccessLevel.PUBLIC, toBuilder = true)"#;
        RestfulParser::parse(Rule::annotation_expression, input).unwrap();
    }

    #[test]
    fn test_class_demo() {
        let input = java_code_demo::class_demo1();
        RestfulParser::parse(Rule::root, input.as_str()).unwrap();
        let input = java_code_demo::class_demo2();
        RestfulParser::parse(Rule::root, input.as_str()).unwrap();
        let input = java_code_demo::class_demo3();
        RestfulParser::parse(Rule::root, input.as_str()).unwrap();
        let input = java_code_demo::class_demo4();
        RestfulParser::parse(Rule::root, input.as_str()).unwrap();
    }

    #[test]
    fn test_record_demo() {
        let input = java_code_demo::record_demo1();
        RestfulParser::parse(Rule::root, input.as_str()).unwrap();
    }

    #[test]
    fn test_interface_demo() {
        let input = java_code_demo::interface_demo1();
        RestfulParser::parse(Rule::root, input.as_str()).unwrap();
        let input = java_code_demo::interface_demo2();
        RestfulParser::parse(Rule::root, input.as_str()).unwrap();
        let input = java_code_demo::interface_demo3();
        RestfulParser::parse(Rule::root, input.as_str()).unwrap();
    }

    #[test]
    fn test_enum_demo() {
        let input = java_code_demo::enum_demo1();
        RestfulParser::parse(Rule::root, input.as_str()).unwrap();
    }
}
