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
