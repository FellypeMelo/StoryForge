use crate::domain::error::{AppError, AppResult};
pub use crate::domain::value_objects::{BookId, ProjectId, WorldRuleId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldRule {
    pub id: WorldRuleId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub category: String,
    pub content: String,
    pub hierarchy: u32,
}

impl WorldRule {
    pub fn new(
        project_id: ProjectId,
        book_id: Option<BookId>,
        category: String,
        content: String,
    ) -> AppResult<Self> {
        if category.trim().is_empty() {
            return Err(AppError::Validation("Category cannot be empty".to_string()));
        }
        if content.trim().is_empty() {
            return Err(AppError::Validation("Content cannot be empty".to_string()));
        }

        Ok(Self {
            id: WorldRuleId::new(),
            project_id,
            book_id,
            category,
            content,
            hierarchy: 0,
        })
    }
}
