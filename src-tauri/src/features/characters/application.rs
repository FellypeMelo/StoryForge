use crate::domain::result::AppResult;
use super::domain::{Character, CharacterId, ProjectId, BookId, CharacterRepository};

pub struct CharacterService<'a> {
    repository: &'a dyn CharacterRepository,
}

impl<'a> CharacterService<'a> {
    pub fn new(repository: &'a dyn CharacterRepository) -> Self {
        Self { repository }
    }

    pub fn create_character(&self, project_id: ProjectId, book_id: Option<BookId>, name: String) -> AppResult<Character> {
        let character = Character::new(project_id, book_id, name)?;
        self.repository.create_character(&character)?;
        Ok(character)
    }

    pub fn save_character(&self, character: &Character) -> AppResult<()> {
        self.repository.create_character(character)
    }

    pub fn get_character(&self, id: CharacterId) -> AppResult<Character> {
        self.repository.get_character_by_id(&id)
    }

    pub fn list_characters_by_project(&self, project_id: ProjectId) -> AppResult<Vec<Character>> {
        self.repository.list_characters_by_project(&project_id)
    }

    pub fn list_characters_by_book(&self, book_id: BookId) -> AppResult<Vec<Character>> {
        self.repository.list_characters_by_book(&book_id)
    }

    pub fn list_global_characters(&self, project_id: ProjectId) -> AppResult<Vec<Character>> {
        self.repository.list_global_characters(&project_id)
    }

    pub fn move_character_to_book(&self, id: CharacterId, book_id: BookId) -> AppResult<()> {
        self.repository.move_character_to_book(&id, &book_id)
    }

    pub fn move_character_to_project(&self, id: CharacterId) -> AppResult<()> {
        self.repository.move_character_to_project(&id)
    }

    pub fn update_character(&self, character: Character) -> AppResult<()> {
        self.repository.update_character(&character)
    }

    pub fn delete_character(&self, id: CharacterId) -> AppResult<()> {
        self.repository.delete_character(&id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct MockRepo;
    impl CharacterRepository for MockRepo {
        fn create_character(&self, _c: &Character) -> AppResult<()> { Ok(()) }
        fn get_character_by_id(&self, _id: &CharacterId) -> AppResult<Character> {
            Ok(Character::new(ProjectId("p".to_string()), None, "N".to_string()).unwrap())
        }
        fn list_characters_by_project(&self, _p: &ProjectId) -> AppResult<Vec<Character>> { Ok(vec![]) }
        fn list_characters_by_book(&self, _b: &BookId) -> AppResult<Vec<Character>> { Ok(vec![]) }
        fn list_global_characters(&self, _p: &ProjectId) -> AppResult<Vec<Character>> { Ok(vec![]) }
        fn move_character_to_book(&self, _id: &CharacterId, _b: &BookId) -> AppResult<()> { Ok(()) }
        fn move_character_to_project(&self, _id: &CharacterId) -> AppResult<()> { Ok(()) }
        fn update_character(&self, _c: &Character) -> AppResult<()> { Ok(()) }
        fn delete_character(&self, _id: &CharacterId) -> AppResult<()> { Ok(()) }
    }

    #[test]
    fn test_character_service_ops() {
        let mock = MockRepo;
        let service = CharacterService::new(&mock);
        let pid = ProjectId("p".to_string());
        let bid = BookId::new();
        let cid = CharacterId::new();
        let character = Character::new(pid.clone(), None, "N".to_string()).unwrap();

        assert!(service.create_character(pid.clone(), None, "N".to_string()).is_ok());
        assert!(service.save_character(&character).is_ok());
        assert!(service.get_character(cid.clone()).is_ok());
        assert!(service.list_characters_by_project(pid.clone()).is_ok());
        assert!(service.list_characters_by_book(bid.clone()).is_ok());
        assert!(service.list_global_characters(pid).is_ok());
        assert!(service.move_character_to_book(cid.clone(), bid).is_ok());
        assert!(service.move_character_to_project(cid.clone()).is_ok());
        assert!(service.delete_character(cid).is_ok());
    }
}
