use crate::features::projects::domain::Project;
use crate::features::projects::application::ProjectService;
use crate::domain::value_objects::ProjectId;
use crate::domain::result::AppResult;
use crate::infrastructure::sqlite::SqliteDatabase;
use tauri::State;

#[tauri::command]
pub async fn create_project(
    state: State<'_, SqliteDatabase>,
    name: String,
    description: String,
) -> AppResult<Project> {
    let service = ProjectService::new(state.inner());
    service.create_project(name, description)
}

#[tauri::command]
pub async fn list_projects(state: State<'_, SqliteDatabase>) -> AppResult<Vec<Project>> {
    let service = ProjectService::new(state.inner());
    service.list_projects()
}

#[tauri::command]
pub async fn delete_project(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    let service = ProjectService::new(state.inner());
    service.delete_project(ProjectId(id))
}
