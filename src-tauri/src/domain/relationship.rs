use crate::domain::error::AppError;
use crate::domain::result::AppResult;
pub use crate::domain::value_objects::{BookId, CharacterId, ProjectId, RelationshipId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relationship {
    pub id: RelationshipId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub character_a: CharacterId,
    pub character_b: CharacterId,
    pub r#type: String,
}

impl Relationship {
    pub fn new(
        project_id: ProjectId,
        book_id: Option<BookId>,
        character_a: CharacterId,
        character_b: CharacterId,
        r#type: String,
    ) -> AppResult<Self> {
        if r#type.trim().is_empty() {
            return Err(AppError::Validation(
                "Relationship type cannot be empty".to_string(),
            ));
        }

        Ok(Self {
            id: RelationshipId::new(),
            project_id,
            book_id,
            character_a,
            character_b,
            r#type,
        })
    }
}
