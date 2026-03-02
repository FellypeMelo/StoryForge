use crate::domain::error::AppError;

pub type AppResult<T> = Result<T, AppError>;
