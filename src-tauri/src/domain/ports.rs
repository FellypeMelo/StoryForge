use crate::domain::character::{Character, CharacterId, ProjectId};
use crate::domain::error::AppResult;

pub trait DatabasePort {
    fn is_healthy(&self) -> bool;
    fn get_version(&self) -> i32;
}

pub trait CharacterRepository {
    fn create(&self, character: &Character) -> AppResult<()>;
    fn get_by_id(&self, id: &CharacterId) -> AppResult<Character>;
    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Character>>;
    fn update(&self, character: &Character) -> AppResult<()>;
    fn delete(&self, id: &CharacterId) -> AppResult<()>;
}
