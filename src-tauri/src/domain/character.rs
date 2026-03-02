use crate::domain::error::AppError;
use crate::domain::result::AppResult;
pub use crate::domain::value_objects::{BookId, CharacterId, ProjectId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OceanScores {
    pub openness: u8,
    pub conscientiousness: u8,
    pub extraversion: u8,
    pub agreeableness: u8,
    pub neuroticism: u8,
}

impl Default for OceanScores {
    fn default() -> Self {
        Self {
            openness: 50,
            conscientiousness: 50,
            extraversion: 50,
            agreeableness: 50,
            neuroticism: 50,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Character {
    pub id: CharacterId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub name: String,
    pub age: u32,
    pub occupation: String,
    pub physical_description: String,
    pub goal: String,
    pub motivation: String,
    pub internal_conflict: String,
    pub ocean_scores: OceanScores,
    pub voice: String,
    pub mannerisms: String,
}

impl Character {
    pub fn new(project_id: ProjectId, book_id: Option<BookId>, name: String) -> AppResult<Self> {
        if name.trim().is_empty() {
            return Err(AppError::Validation("Name cannot be empty".to_string()));
        }

        Ok(Self {
            id: CharacterId::new(),
            project_id,
            book_id,
            name,
            age: 0,
            occupation: String::new(),
            physical_description: String::new(),
            goal: String::new(),
            motivation: String::new(),
            internal_conflict: String::new(),
            ocean_scores: OceanScores::default(),
            voice: String::new(),
            mannerisms: String::new(),
        })
    }

    pub fn to_snapshot(&self) -> String {
        format!(
            "{}, {} anos. {}. Objetivos: {}. Conflito: {}.",
            self.name, self.age, self.occupation, self.goal, self.internal_conflict
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_character_creation_fails_with_empty_name() {
        let project_id = ProjectId("test-project".to_string());
        let result = Character::new(project_id, None, "".to_string());

        assert!(result.is_err());
        if let Err(AppError::Validation(msg)) = result {
            assert_eq!(msg, "Name cannot be empty");
        } else {
            panic!("Expected validation error for empty name");
        }
    }

    #[test]
    fn test_character_creation_succeeds_with_valid_data() {
        let project_id = ProjectId("test-project".to_string());
        let result = Character::new(project_id, None, "Protagonist".to_string());

        assert!(result.is_ok());
        let character = result.unwrap();
        assert_eq!(character.name, "Protagonist");
        assert!(character.book_id.is_none());
        assert!(!character.id.0.is_empty());
    }

    #[test]
    fn test_character_creation_with_book_id() {
        let project_id = ProjectId("test-project".to_string());
        let book_id = BookId("test-book".to_string());
        let result = Character::new(
            project_id,
            Some(book_id.clone()),
            "Book Character".to_string(),
        );

        assert!(result.is_ok());
        let character = result.unwrap();
        assert_eq!(character.book_id, Some(book_id));
    }
}
