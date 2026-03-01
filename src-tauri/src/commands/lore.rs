use tauri::State;
use crate::infrastructure::sqlite::SqliteDatabase;
use crate::domain::ports::{
    CharacterRepository, ProjectRepository, LocationRepository, WorldRuleRepository,
    TimelineRepository, RelationshipRepository, BlacklistRepository, SearchPort, SearchResult, EntityType
};
use crate::domain::character::Character;
use crate::domain::project::Project;
use crate::domain::location::Location;
use crate::domain::world_rule::WorldRule;
use crate::domain::timeline_event::TimelineEvent;
use crate::domain::relationship::Relationship;
use crate::domain::blacklist_entry::BlacklistEntry;
use crate::domain::value_objects::{ProjectId, CharacterId, LocationId, WorldRuleId, TimelineEventId, RelationshipId, BlacklistEntryId};
use crate::domain::error::AppResult;

#[tauri::command]
pub async fn create_project(state: State<'_, SqliteDatabase>, name: String) -> AppResult<Project> {
    let project = Project::new(name)?;
    state.create(&project)?;
    Ok(project)
}

#[tauri::command]
pub async fn list_projects(state: State<'_, SqliteDatabase>) -> AppResult<Vec<Project>> {
    state.list_all()
}

#[tauri::command]
pub async fn list_characters(state: State<'_, SqliteDatabase>, project_id: String) -> AppResult<Vec<Character>> {
    state.list_by_project(&ProjectId(project_id))
}

#[tauri::command]
pub async fn create_location(state: State<'_, SqliteDatabase>, project_id: String, name: String) -> AppResult<Location> {
    let location = Location::new(ProjectId(project_id), name)?;
    state.create(&location)?;
    Ok(location)
}

#[tauri::command]
pub async fn list_locations(state: State<'_, SqliteDatabase>, project_id: String) -> AppResult<Vec<Location>> {
    state.list_by_project(&ProjectId(project_id))
}

#[tauri::command]
pub async fn create_world_rule(state: State<'_, SqliteDatabase>, project_id: String, category: String, content: String) -> AppResult<WorldRule> {
    let rule = WorldRule::new(ProjectId(project_id), category, content)?;
    state.create(&rule)?;
    Ok(rule)
}

#[tauri::command]
pub async fn list_world_rules(state: State<'_, SqliteDatabase>, project_id: String) -> AppResult<Vec<WorldRule>> {
    state.list_by_project(&ProjectId(project_id))
}

#[tauri::command]
pub async fn search_lore(state: State<'_, SqliteDatabase>, project_id: String, query: String) -> AppResult<Vec<SearchResult>> {
    state.search(&ProjectId(project_id), &query, None)
}
