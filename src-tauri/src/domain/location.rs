use crate::domain::error::AppError;
use crate::domain::result::AppResult;
pub use crate::domain::value_objects::{BookId, LocationId, ProjectId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub id: LocationId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub name: String,
    pub description: String,
    pub symbolic_meaning: String,
}

impl Location {
    pub fn new(project_id: ProjectId, book_id: Option<BookId>, name: String) -> AppResult<Self> {
        if name.trim().is_empty() {
            return Err(AppError::Validation(
                "Location name cannot be empty".to_string(),
            ));
        }

        Ok(Self {
            id: LocationId::new(),
            project_id,
            book_id,
            name,
            description: String::new(),
            symbolic_meaning: String::new(),
        })
    }
}
