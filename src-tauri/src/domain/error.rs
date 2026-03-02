use serde::{Serialize, Deserialize};
use thiserror::Error;

#[derive(Debug, Error, Serialize, Deserialize)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("IO error: {0}")]
    Io(String),

    #[error("UUID error: {0}")]
    Uuid(String),
}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        AppError::Database(err.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err.to_string())
    }
}

impl From<uuid::Error> for AppError {
    fn from(err: uuid::Error) -> Self {
        AppError::Uuid(err.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io;

    #[test]
    fn test_error_conversion_io() {
        let io_error = io::Error::new(io::ErrorKind::Other, "test io error");
        let app_error: AppError = io_error.into();
        match app_error {
            AppError::Io(msg) => assert_eq!(msg, "test io error"),
            _ => panic!("Expected Io error"),
        }
    }

    #[test]
    fn test_error_conversion_uuid() {
        let uuid_error = "invalid-uuid".parse::<uuid::Uuid>().unwrap_err();
        let app_error: AppError = uuid_error.into();
        match app_error {
            AppError::Uuid(_) => (),
            _ => panic!("Expected Uuid error"),
        }
    }

    #[test]
    fn test_error_conversion_rusqlite() {
        let sql_error = rusqlite::Error::QueryReturnedNoRows;
        let app_error: AppError = sql_error.into();
        match app_error {
            AppError::Database(_) => (),
            _ => panic!("Expected Database error"),
        }
    }
}
