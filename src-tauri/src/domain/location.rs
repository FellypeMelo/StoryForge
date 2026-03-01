use serde::{Serialize, Deserialize};
use crate::domain::error::{AppError, AppResult};
pub use crate::domain::value_objects::{LocationId, ProjectId};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub id: LocationId,
    pub project_id: ProjectId,
    pub name: String,
    pub description: String,
    pub symbolic_meaning: String,
}

impl Location {
    pub fn new(project_id: ProjectId, name: String) -> AppResult<Self> {
        if name.trim().is_empty() {
            return Err(AppError::Validation("Location name cannot be empty".to_string()));
        }

        Ok(Self {
            id: LocationId::new(),
            project_id,
            name,
            description: String::new(),
            symbolic_meaning: String::new(),
        })
    }
}
