use crate::features::characters::domain::{BookId, Character, CharacterId, ProjectId};
use crate::features::characters::application::CharacterService;
use crate::domain::result::AppResult;
use crate::infrastructure::sqlite::SqliteDatabase;
use tauri::State;

#[tauri::command]
pub async fn create_character(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    name: String,
) -> AppResult<Character> {
    let service = CharacterService::new(state.inner());
    service.create_character(ProjectId(project_id), book_id.map(BookId), name)
}

#[tauri::command]
pub async fn get_character(state: State<'_, SqliteDatabase>, id: String) -> AppResult<Character> {
    let service = CharacterService::new(state.inner());
    service.get_character(CharacterId(id))
}

#[tauri::command]
pub async fn list_characters(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Character>> {
    let service = CharacterService::new(state.inner());
    service.list_characters_by_project(ProjectId(project_id))
}

#[tauri::command]
pub async fn list_characters_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<Character>> {
    let service = CharacterService::new(state.inner());
    service.list_characters_by_book(BookId(book_id))
}

#[tauri::command]
pub async fn list_global_characters(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Character>> {
    let service = CharacterService::new(state.inner());
    service.list_global_characters(ProjectId(project_id))
}

#[tauri::command]
pub async fn move_character_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    let service = CharacterService::new(state.inner());
    service.move_character_to_book(CharacterId(id), BookId(book_id))
}

#[tauri::command]
pub async fn move_character_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    let service = CharacterService::new(state.inner());
    service.move_character_to_project(CharacterId(id))
}

#[tauri::command]
pub async fn update_character(
    state: State<'_, SqliteDatabase>,
    character: Character,
) -> AppResult<()> {
    let service = CharacterService::new(state.inner());
    service.update_character(character)
}

#[tauri::command]
pub async fn delete_character(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    let service = CharacterService::new(state.inner());
    service.delete_character(CharacterId(id))
}
