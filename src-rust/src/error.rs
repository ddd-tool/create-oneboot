#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    IoError(#[from] std::io::Error),
    #[error("{:?}", .0.to_string())]
    ErrorInfo(String),
    #[cfg(feature = "pest")]
    #[error(transparent)]
    PestParseJavaError(#[from] pest::error::Error<crate::parser::java_pest::Rule>),
    #[cfg(feature = "tree-sitter")]
    #[error(transparent)]
    TreeSitterParseJavaError(#[from] tree_sitter::LanguageError),
}

impl From<&str> for Error {
    fn from(s: &str) -> Self {
        Error::ErrorInfo("".to_string());
        Error::IoError(std::io::Error::new(std::io::ErrorKind::Other, s))
    }
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
