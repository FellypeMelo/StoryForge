pub mod domain;
pub mod application;
pub mod commands;
pub mod infrastructure;

pub use application::CharacterService;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::result::AppResult;
    use crate::features::characters::domain::{Character, CharacterId, ProjectId, BookId, CharacterRepository};

    struct MockCharacterRepo;
    impl CharacterRepository for MockCharacterRepo {
        fn create_character(&self, _character: &Character) -> AppResult<()> { Ok(()) }
        fn get_character_by_id(&self, _id: &CharacterId) -> AppResult<Character> {
            Character::new(ProjectId("test".to_string()), None, "Test".to_string())
        }
        fn list_characters_by_project(&self, _project_id: &ProjectId) -> AppResult<Vec<Character>> { Ok(vec![]) }
        fn list_characters_by_book(&self, _book_id: &BookId) -> AppResult<Vec<Character>> { Ok(vec![]) }
        fn list_global_characters(&self, _project_id: &ProjectId) -> AppResult<Vec<Character>> { Ok(vec![]) }
        fn move_character_to_book(&self, _id: &CharacterId, _book_id: &BookId) -> AppResult<()> { Ok(()) }
        fn move_character_to_project(&self, _id: &CharacterId) -> AppResult<()> { Ok(()) }
        fn update_character(&self, _character: &Character) -> AppResult<()> { Ok(()) }
        fn delete_character(&self, _id: &CharacterId) -> AppResult<()> { Ok(()) }
    }

    #[test]
    fn test_character_service_creation() {
        let repo = MockCharacterRepo;
        let service = CharacterService::new(&repo);
        let result = service.create_character(ProjectId("test".to_string()), None, "Conan".to_string());
        assert!(result.is_ok());
        assert_eq!(result.unwrap().name, "Conan");
    }
}
