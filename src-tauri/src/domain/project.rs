use serde::{Serialize, Deserialize};
use crate::domain::error::{AppError, AppResult};
pub use crate::domain::value_objects::ProjectId;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: ProjectId,
    pub name: String,
    pub created_at: String,
}

impl Project {
    pub fn new(name: String) -> AppResult<Self> {
        if name.trim().is_empty() {
            return Err(AppError::Validation("Project name cannot be empty".to_string()));
        }

        Ok(Self {
            id: ProjectId::new(),
            name,
            created_at: String::new(), // Populated by DB
        })
    }
}
