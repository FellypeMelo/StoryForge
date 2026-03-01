use serde::{Serialize, Deserialize};
use crate::domain::error::{AppError, AppResult};
pub use crate::domain::value_objects::{BlacklistEntryId, ProjectId};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlacklistEntry {
    pub id: BlacklistEntryId,
    pub project_id: ProjectId,
    pub term: String,
    pub category: String,
    pub reason: String,
}

impl BlacklistEntry {
    pub fn new(project_id: ProjectId, term: String) -> AppResult<Self> {
        if term.trim().is_empty() {
            return Err(AppError::Validation("Term cannot be empty".to_string()));
        }

        Ok(Self {
            id: BlacklistEntryId::new(),
            project_id,
            term,
            category: String::new(),
            reason: String::new(),
        })
    }
}
