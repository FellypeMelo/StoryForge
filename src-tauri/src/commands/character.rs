use crate::domain::character::{Character, CharacterId, ProjectId};
use crate::domain::error::{AppError, AppResult};
use crate::domain::ports::CharacterRepository;
use crate::infrastructure::sqlite::SqliteDatabase;
use tauri::State;

#[tauri::command]
pub async fn create_character(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    name: String,
) -> AppResult<Character> {
    let character = Character::new(ProjectId(project_id), name)?;
    state.create(&character)?;
    Ok(character)
}

#[tauri::command]
pub async fn get_character(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<Character> {
    state.get_by_id(&CharacterId(id))
}

#[tauri::command]
pub async fn list_characters(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Character>> {
    state.list_by_project(&ProjectId(project_id))
}

#[tauri::command]
pub async fn update_character(
    state: State<'_, SqliteDatabase>,
    character: Character,
) -> AppResult<()> {
    state.update(&character)
}

#[tauri::command]
pub async fn delete_character(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    state.delete(&CharacterId(id))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::character::OceanScores;
    use std::sync::Mutex;

    // Mock repo for testing command logic
    struct MockRepo {
        created: Mutex<Vec<Character>>,
    }
    
    impl MockRepo {
        fn new() -> Self {
            Self { created: Mutex::new(vec![]) }
        }
    }

    impl CharacterRepository for MockRepo {
        fn create(&self, c: &Character) -> AppResult<()> {
            self.created.lock().unwrap().push(c.clone());
            Ok(())
        }
        fn get_by_id(&self, _id: &CharacterId) -> AppResult<Character> { 
            Err(AppError::NotFound("Mock".to_string())) 
        }
        fn list_by_project(&self, _p: &ProjectId) -> AppResult<Vec<Character>> { Ok(vec![]) }
        fn update(&self, _c: &Character) -> AppResult<()> { Ok(()) }
        fn delete(&self, _id: &CharacterId) -> AppResult<()> { Ok(()) }
    }

    #[test]
    fn test_create_character_logic() {
        let repo = Arc::new(MockRepo::new());
        let project_id = "proj-1".to_string();
        let name = "Hero".to_string();
        
        let character = Character::new(ProjectId(project_id.clone()), name.clone()).unwrap();
        repo.create(&character).unwrap();
        
        let created = repo.created.lock().unwrap();
        assert_eq!(created.len(), 1);
        assert_eq!(created[0].name, name);
        assert_eq!(created[0].project_id.0, project_id);
    }
}
