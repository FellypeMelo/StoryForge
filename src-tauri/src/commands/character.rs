use crate::domain::character::{Character, CharacterId, ProjectId};
use crate::domain::error::AppResult;
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
    state.create_character(&character)?;
    Ok(character)
}

#[tauri::command]
pub async fn get_character(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<Character> {
    state.get_character_by_id(&CharacterId(id))
}

#[tauri::command]
pub async fn list_characters(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Character>> {
    state.list_characters_by_project(&ProjectId(project_id))
}

#[tauri::command]
pub async fn update_character(
    state: State<'_, SqliteDatabase>,
    character: Character,
) -> AppResult<()> {
    state.update_character(&character)
}

#[tauri::command]
pub async fn delete_character(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    state.delete_character(&CharacterId(id))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_domain_logic_in_command_context() {
        let project_id = "proj-123".to_string();
        let name = "Protagonist".to_string();
        
        let character = Character::new(ProjectId(project_id.clone()), name.clone()).unwrap();
        assert_eq!(character.name, name);
        assert_eq!(character.project_id.0, project_id);
    }
}
