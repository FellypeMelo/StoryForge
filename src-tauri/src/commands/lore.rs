use crate::domain::blacklist_entry::BlacklistEntry;
use crate::domain::result::AppResult;
use crate::domain::location::Location;
use crate::domain::ports::{
    BlacklistRepository, LocationRepository, ProjectRepository, RelationshipRepository, SearchPort,
    SearchResult, TimelineRepository, WorldRuleRepository,
};
use crate::domain::project::Project;
use crate::domain::relationship::Relationship;
use crate::domain::timeline_event::TimelineEvent;
use crate::domain::value_objects::{BookId, ProjectId};
use crate::domain::world_rule::WorldRule;
use crate::infrastructure::sqlite::SqliteDatabase;
use tauri::State;

#[tauri::command]
pub async fn create_project(
    state: State<'_, SqliteDatabase>,
    name: String,
    description: String,
) -> AppResult<Project> {
    let project = Project::new(name, description)?;
    state.create_project(&project)?;
    Ok(project)
}

#[tauri::command]
pub async fn list_projects(state: State<'_, SqliteDatabase>) -> AppResult<Vec<Project>> {
    state.list_all_projects()
}

#[tauri::command]
pub async fn create_location(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    name: String,
) -> AppResult<Location> {
    let location = Location::new(ProjectId(project_id), book_id.map(BookId), name)?;
    state.create_location(&location)?;
    Ok(location)
}

#[tauri::command]
pub async fn list_locations(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Location>> {
    state.list_locations_by_project(&ProjectId(project_id))
}

#[tauri::command]
pub async fn list_locations_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<Location>> {
    state.list_locations_by_book(&BookId(book_id))
}

#[tauri::command]
pub async fn list_global_locations(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Location>> {
    state.list_global_locations(&ProjectId(project_id))
}

#[tauri::command]
pub async fn move_location_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    state.move_location_to_book(&crate::domain::location::LocationId(id), &BookId(book_id))
}

#[tauri::command]
pub async fn move_location_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    state.move_location_to_project(&crate::domain::location::LocationId(id))
}

#[tauri::command]
pub async fn create_world_rule(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    category: String,
    content: String,
) -> AppResult<WorldRule> {
    let rule = WorldRule::new(
        ProjectId(project_id),
        book_id.map(BookId),
        category,
        content,
    )?;
    state.create_world_rule(&rule)?;
    Ok(rule)
}

#[tauri::command]
pub async fn list_world_rules(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<WorldRule>> {
    state.list_world_rules_by_project(&ProjectId(project_id))
}

#[tauri::command]
pub async fn list_world_rules_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<WorldRule>> {
    state.list_world_rules_by_book(&BookId(book_id))
}

#[tauri::command]
pub async fn list_global_world_rules(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<WorldRule>> {
    state.list_global_world_rules(&ProjectId(project_id))
}

#[tauri::command]
pub async fn move_world_rule_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    state.move_world_rule_to_book(
        &crate::domain::world_rule::WorldRuleId(id),
        &BookId(book_id),
    )
}

#[tauri::command]
pub async fn move_world_rule_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    state.move_world_rule_to_project(&crate::domain::world_rule::WorldRuleId(id))
}

#[tauri::command]
pub async fn search_lore(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    query: String,
) -> AppResult<Vec<SearchResult>> {
    state.search(&ProjectId(project_id), &query, book_id.map(BookId), None)
}

// Timeline Commands
#[tauri::command]
pub async fn create_timeline_event(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    description: String,
) -> AppResult<TimelineEvent> {
    let event = TimelineEvent::new(ProjectId(project_id), book_id.map(BookId), description)?;
    state.create_timeline_event(&event)?;
    Ok(event)
}

#[tauri::command]
pub async fn list_timeline_events_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<TimelineEvent>> {
    state.list_timeline_events_by_book(&BookId(book_id))
}

#[tauri::command]
pub async fn list_global_timeline_events(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<TimelineEvent>> {
    state.list_global_timeline_events(&ProjectId(project_id))
}

#[tauri::command]
pub async fn update_timeline_event(
    state: State<'_, SqliteDatabase>,
    event: TimelineEvent,
) -> AppResult<()> {
    state.update_timeline_event(&event)
}

#[tauri::command]
pub async fn move_timeline_event_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    state.move_timeline_event_to_book(
        &crate::domain::value_objects::TimelineEventId(id),
        &BookId(book_id),
    )
}

#[tauri::command]
pub async fn move_timeline_event_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    state.move_timeline_event_to_project(&crate::domain::value_objects::TimelineEventId(id))
}

#[tauri::command]
pub async fn delete_timeline_event(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    state.delete_timeline_event(&crate::domain::value_objects::TimelineEventId(id))
}

// Relationship Commands
#[tauri::command]
pub async fn create_relationship(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    character_a: String,
    character_b: String,
    r#type: String,
) -> AppResult<Relationship> {
    let rel = Relationship::new(
        ProjectId(project_id),
        book_id.map(BookId),
        crate::domain::value_objects::CharacterId(character_a),
        crate::domain::value_objects::CharacterId(character_b),
        r#type,
    )?;
    state.create_relationship(&rel)?;
    Ok(rel)
}

#[tauri::command]
pub async fn list_relationships_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<Relationship>> {
    state.list_relationships_by_book(&BookId(book_id))
}

#[tauri::command]
pub async fn list_global_relationships(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Relationship>> {
    state.list_global_relationships(&ProjectId(project_id))
}

#[tauri::command]
pub async fn update_relationship(
    state: State<'_, SqliteDatabase>,
    relationship: Relationship,
) -> AppResult<()> {
    state.update_relationship(&relationship)
}

#[tauri::command]
pub async fn move_relationship_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    state.move_relationship_to_book(
        &crate::domain::value_objects::RelationshipId(id),
        &BookId(book_id),
    )
}

#[tauri::command]
pub async fn move_relationship_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    state.move_relationship_to_project(&crate::domain::value_objects::RelationshipId(id))
}

#[tauri::command]
pub async fn delete_relationship(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    state.delete_relationship(&crate::domain::value_objects::RelationshipId(id))
}

// Blacklist Commands
#[tauri::command]
pub async fn create_blacklist_entry(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    term: String,
) -> AppResult<BlacklistEntry> {
    let entry = BlacklistEntry::new(ProjectId(project_id), book_id.map(BookId), term)?;
    state.create_blacklist_entry(&entry)?;
    Ok(entry)
}

#[tauri::command]
pub async fn list_blacklist_entries_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<BlacklistEntry>> {
    state.list_blacklist_entries_by_book(&BookId(book_id))
}

#[tauri::command]
pub async fn list_global_blacklist_entries(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<BlacklistEntry>> {
    state.list_global_blacklist_entries(&ProjectId(project_id))
}

#[tauri::command]
pub async fn update_blacklist_entry(
    state: State<'_, SqliteDatabase>,
    entry: BlacklistEntry,
) -> AppResult<()> {
    state.update_blacklist_entry(&entry)
}

#[tauri::command]
pub async fn move_blacklist_entry_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    state.move_blacklist_entry_to_book(
        &crate::domain::value_objects::BlacklistEntryId(id),
        &BookId(book_id),
    )
}

#[tauri::command]
pub async fn move_blacklist_entry_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    state.move_blacklist_entry_to_project(&crate::domain::value_objects::BlacklistEntryId(id))
}

#[tauri::command]
pub async fn delete_blacklist_entry(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    state.delete_blacklist_entry(&crate::domain::value_objects::BlacklistEntryId(id))
}
