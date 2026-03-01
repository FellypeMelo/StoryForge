use serde::{Serialize, Deserialize};
use uuid::Uuid;
use crate::domain::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct CharacterId(String);

impl CharacterId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ProjectId(pub String);

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
    pub fn new(
        project_id: ProjectId,
        name: String,
    ) -> AppResult<Self> {
        if name.trim().is_empty() {
            return Err(AppError::Validation("Name cannot be empty".to_string()));
        }

        Ok(Self {
            id: CharacterId::new(),
            project_id,
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
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_character_creation_fails_with_empty_name() {
        let project_id = ProjectId("test-project".to_string());
        let result = Character::new(project_id, "".to_string());
        
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
        let result = Character::new(project_id, "Protagonist".to_string());
        
        assert!(result.is_ok());
        let character = result.unwrap();
        assert_eq!(character.name, "Protagonist");
        assert!(!character.id.0.is_empty());
    }
}
