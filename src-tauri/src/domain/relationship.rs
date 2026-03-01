use serde::{Serialize, Deserialize};
use crate::domain::error::{AppError, AppResult};
pub use crate::domain::value_objects::{RelationshipId, ProjectId, CharacterId};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relationship {
    pub id: RelationshipId,
    pub project_id: ProjectId,
    pub character_a: CharacterId,
    pub character_b: CharacterId,
    pub r#type: String,
}

impl Relationship {
    pub fn new(project_id: ProjectId, character_a: CharacterId, character_b: CharacterId, r#type: String) -> AppResult<Self> {
        if r#type.trim().is_empty() {
            return Err(AppError::Validation("Relationship type cannot be empty".to_string()));
        }

        Ok(Self {
            id: RelationshipId::new(),
            project_id,
            character_a,
            character_b,
            r#type,
        })
    }
}
