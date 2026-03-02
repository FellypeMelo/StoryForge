use crate::domain::error::AppError;
use crate::domain::result::AppResult;
pub use crate::domain::value_objects::{BlacklistEntryId, BookId, ProjectId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlacklistEntry {
    pub id: BlacklistEntryId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub term: String,
    pub category: String,
    pub reason: String,
}

impl BlacklistEntry {
    pub fn new(project_id: ProjectId, book_id: Option<BookId>, term: String) -> AppResult<Self> {
        if term.trim().is_empty() {
            return Err(AppError::Validation("Term cannot be empty".to_string()));
        }

        Ok(Self {
            id: BlacklistEntryId::new(),
            project_id,
            book_id,
            term,
            category: String::new(),
            reason: String::new(),
        })
    }
}
