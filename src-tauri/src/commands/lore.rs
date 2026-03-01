use tauri::State;
use crate::infrastructure::sqlite::SqliteDatabase;
use crate::domain::ports::{
    ProjectRepository, LocationRepository, WorldRuleRepository,
    SearchPort, SearchResult
};
use crate::domain::project::Project;
use crate::domain::location::Location;
use crate::domain::world_rule::WorldRule;
use crate::domain::value_objects::ProjectId;
use crate::domain::error::AppResult;

#[tauri::command]
pub async fn create_project(state: State<'_, SqliteDatabase>, name: String) -> AppResult<Project> {
    let project = Project::new(name)?;
    state.create_project(&project)?;
    Ok(project)
}

#[tauri::command]
pub async fn list_projects(state: State<'_, SqliteDatabase>) -> AppResult<Vec<Project>> {
    state.list_all_projects()
}

#[tauri::command]
pub async fn create_location(state: State<'_, SqliteDatabase>, project_id: String, name: String) -> AppResult<Location> {
    let location = Location::new(ProjectId(project_id), name)?;
    state.create_location(&location)?;
    Ok(location)
}

#[tauri::command]
pub async fn list_locations(state: State<'_, SqliteDatabase>, project_id: String) -> AppResult<Vec<Location>> {
    state.list_locations_by_project(&ProjectId(project_id))
}

#[tauri::command]
pub async fn create_world_rule(state: State<'_, SqliteDatabase>, project_id: String, category: String, content: String) -> AppResult<WorldRule> {
    let rule = WorldRule::new(ProjectId(project_id), category, content)?;
    state.create_world_rule(&rule)?;
    Ok(rule)
}

#[tauri::command]
pub async fn list_world_rules(state: State<'_, SqliteDatabase>, project_id: String) -> AppResult<Vec<WorldRule>> {
    state.list_world_rules_by_project(&ProjectId(project_id))
}

#[tauri::command]
pub async fn search_lore(state: State<'_, SqliteDatabase>, project_id: String, query: String) -> AppResult<Vec<SearchResult>> {
    state.search(&ProjectId(project_id), &query, None)
}
