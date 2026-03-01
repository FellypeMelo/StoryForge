use serde::{Serialize, Deserialize};
use crate::domain::error::{AppError, AppResult};
pub use crate::domain::value_objects::{TimelineEventId, ProjectId};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: TimelineEventId,
    pub project_id: ProjectId,
    pub date: String,
    pub description: String,
    pub causal_dependencies: Vec<TimelineEventId>,
}

impl TimelineEvent {
    pub fn new(project_id: ProjectId, description: String) -> AppResult<Self> {
        if description.trim().is_empty() {
            return Err(AppError::Validation("Description cannot be empty".to_string()));
        }

        Ok(Self {
            id: TimelineEventId::new(),
            project_id,
            date: String::new(),
            description,
            causal_dependencies: Vec::new(),
        })
    }
}
