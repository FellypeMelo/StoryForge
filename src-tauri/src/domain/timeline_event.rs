use crate::domain::error::AppError;
use crate::domain::result::AppResult;
pub use crate::domain::value_objects::{BookId, ProjectId, TimelineEventId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: TimelineEventId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub date: String,
    pub description: String,
    pub causal_dependencies: Vec<TimelineEventId>,
}

impl TimelineEvent {
    pub fn new(
        project_id: ProjectId,
        book_id: Option<BookId>,
        description: String,
    ) -> AppResult<Self> {
        if description.trim().is_empty() {
            return Err(AppError::Validation(
                "Description cannot be empty".to_string(),
            ));
        }

        Ok(Self {
            id: TimelineEventId::new(),
            project_id,
            book_id,
            date: String::new(),
            description,
            causal_dependencies: Vec::new(),
        })
    }
}
