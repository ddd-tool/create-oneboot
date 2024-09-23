use crate::error::Error;
use tree_sitter::{Node, Parser};

trait TreeExt {
    fn each_node_all<F>(&self, handler: F)
    where
        F: FnMut(&Node);
    fn each_node<F>(&self, node: &Node, handler: F)
    where
        F: FnMut(&Node);
}

impl TreeExt for tree_sitter::Tree {
    fn each_node_all<F>(&self, handler: F)
    where
        F: FnMut(&Node),
    {
        self.each_node(&self.root_node(), handler);
    }

    fn each_node<F>(&self, node: &Node, mut handler: F)
    where
        F: FnMut(&Node),
    {
        for child in node.children(&mut node.walk()) {
            handler(&child);
        }
    }
}

pub fn parse_java_types(input: String) -> Result<Vec<String>, Error> {
    let mut result = vec![];
    let mut parser = Parser::new();
    // parser.set_language(&tree_sitter_language::LanguageFn::from_raw(
    //     tree_sitter_java,
    // ))?;
    let tree = parser.parse(input, None).ok_or("解析语法树失败")?;
    tree.each_node_all(|node| result.push(node.kind().into()));
    Ok(result)
}
