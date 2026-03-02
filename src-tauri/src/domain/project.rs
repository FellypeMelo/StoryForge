use crate::domain::error::AppError;
use crate::domain::result::AppResult;
pub use crate::domain::value_objects::ProjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: ProjectId,
    pub name: String,
    pub description: String,
    pub created_at: String,
}

impl Project {
    pub fn new(name: String, description: String) -> AppResult<Self> {
        if name.trim().is_empty() {
            return Err(AppError::Validation(
                "Project name cannot be empty".to_string(),
            ));
        }

        Ok(Self {
            id: ProjectId::new(),
            name,
            description,
            created_at: String::new(),
        })
    }
}
