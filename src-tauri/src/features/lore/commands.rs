use crate::domain::ports::{SearchResult, VectorSearchPort};
use crate::domain::result::AppResult;
use crate::domain::value_objects::{BookId, ProjectId};
use crate::features::lore::application::LoreService;
use crate::features::lore::domain::{
    BlacklistEntry, BlacklistEntryId, Location, LocationId, Relationship, RelationshipId,
    TimelineEvent, TimelineEventId, WorldRule, WorldRuleId,
};
use crate::infrastructure::sqlite::SqliteDatabase;
use serde::{Deserialize, Serialize};
use tauri::State;

/// A `lore_search` row shaped for the frontend to embed itself:
/// `entity_id` plus the concatenated `title + ' ' + content` text.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoreIndexRow {
    pub entity_id: String,
    pub text: String,
}

/// A frontend-computed embedding ready to be persisted into `lore_vectors`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoreVectorRow {
    pub entity_id: String,
    pub embedding: Vec<f32>,
}

#[tauri::command]
pub async fn create_location(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    name: String,
) -> AppResult<Location> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.create_location(ProjectId(project_id), book_id.map(BookId), name)
}

#[tauri::command]
pub async fn list_locations(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Location>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_locations_by_project(ProjectId(project_id))
}

#[tauri::command]
pub async fn list_locations_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<Location>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_locations_by_book(BookId(book_id))
}

#[tauri::command]
pub async fn list_global_locations(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Location>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_global_locations(ProjectId(project_id))
}

#[tauri::command]
pub async fn move_location_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.move_location_to_book(LocationId(id), BookId(book_id))
}

#[tauri::command]
pub async fn move_location_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.move_location_to_project(LocationId(id))
}

#[tauri::command]
pub async fn get_location(state: State<'_, SqliteDatabase>, id: String) -> AppResult<Location> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.get_location(LocationId(id))
}

#[tauri::command]
pub async fn update_location(
    state: State<'_, SqliteDatabase>,
    location: Location,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.update_location(location)
}

#[tauri::command]
pub async fn delete_location(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.delete_location(LocationId(id))
}

#[tauri::command]
pub async fn create_world_rule(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    category: String,
    content: String,
) -> AppResult<WorldRule> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.create_world_rule(
        ProjectId(project_id),
        book_id.map(BookId),
        category,
        content,
    )
}

#[tauri::command]
pub async fn list_world_rules(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<WorldRule>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_world_rules_by_project(ProjectId(project_id))
}

#[tauri::command]
pub async fn list_world_rules_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<WorldRule>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_world_rules_by_book(BookId(book_id))
}

#[tauri::command]
pub async fn list_global_world_rules(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<WorldRule>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_global_world_rules(ProjectId(project_id))
}

#[tauri::command]
pub async fn move_world_rule_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.move_world_rule_to_book(WorldRuleId(id), BookId(book_id))
}

#[tauri::command]
pub async fn move_world_rule_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.move_world_rule_to_project(WorldRuleId(id))
}

#[tauri::command]
pub async fn get_world_rule(state: State<'_, SqliteDatabase>, id: String) -> AppResult<WorldRule> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.get_world_rule(WorldRuleId(id))
}

#[tauri::command]
pub async fn update_world_rule(state: State<'_, SqliteDatabase>, rule: WorldRule) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.update_world_rule(rule)
}

#[tauri::command]
pub async fn delete_world_rule(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.delete_world_rule(WorldRuleId(id))
}

#[tauri::command]
pub async fn search_lore(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    query: String,
) -> AppResult<Vec<SearchResult>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.search_lore(ProjectId(project_id), &query, book_id.map(BookId))
}

#[tauri::command]
pub async fn reindex_lore_vectors(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
) -> AppResult<usize> {
    let book_id = book_id.map(BookId);
    state
        .inner()
        .reindex_lore_vectors(&ProjectId(project_id), book_id.as_ref())
}

#[tauri::command]
pub async fn semantic_search_lore(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    query: String,
    top_k: usize,
) -> AppResult<Vec<SearchResult>> {
    state
        .inner()
        .semantic_search_lore(&ProjectId(project_id), book_id.map(BookId), &query, top_k)
}

/// Lists rows the frontend should embed (via its own `fetch`-based embedding
/// call) and pass to `store_lore_vectors`. Scope mirrors `search_lore` /
/// `semantic_search_lore`: `book_id = Some` scopes to that book, `None`
/// scopes to project-global (book_id IS NULL) rows only.
#[tauri::command]
pub async fn list_lore_index_rows(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
) -> AppResult<Vec<LoreIndexRow>> {
    let book_id = book_id.map(BookId);
    let rows = state
        .inner()
        .list_lore_index_rows(&ProjectId(project_id), book_id.as_ref())?;
    Ok(rows
        .into_iter()
        .map(|(entity_id, text)| LoreIndexRow { entity_id, text })
        .collect())
}

/// Persists frontend-computed embeddings into `lore_vectors`, recreating the
/// table automatically if the embedding dimension differs from what's
/// currently stored.
#[tauri::command]
pub async fn store_lore_vectors(
    state: State<'_, SqliteDatabase>,
    rows: Vec<StoreVectorRow>,
) -> AppResult<usize> {
    let rows = rows
        .into_iter()
        .map(|row| (row.entity_id, row.embedding))
        .collect();
    state.inner().store_lore_vectors(rows)
}

/// Runs ANN search against `lore_vectors` using a frontend-computed query
/// embedding, bypassing the offline `MockEmbeddingPort` entirely.
#[tauri::command]
pub async fn semantic_search_by_vector(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    embedding: Vec<f32>,
    top_k: usize,
) -> AppResult<Vec<SearchResult>> {
    state.inner().find_similar(
        &ProjectId(project_id),
        embedding,
        top_k,
        book_id.map(BookId),
        None,
    )
}

#[tauri::command]
pub async fn get_lore_context(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    text: String,
    max_tokens: usize,
) -> AppResult<String> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.inject_context(
        &ProjectId(project_id),
        book_id.map(BookId),
        &text,
        max_tokens,
    )
}

// Timeline Commands
#[tauri::command]
pub async fn create_timeline_event(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    description: String,
) -> AppResult<TimelineEvent> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.create_timeline_event(ProjectId(project_id), book_id.map(BookId), description)
}

#[tauri::command]
pub async fn list_timeline_events_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<TimelineEvent>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_timeline_events_by_book(BookId(book_id))
}

#[tauri::command]
pub async fn list_global_timeline_events(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<TimelineEvent>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_global_timeline_events(ProjectId(project_id))
}

#[tauri::command]
pub async fn update_timeline_event(
    state: State<'_, SqliteDatabase>,
    event: TimelineEvent,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.update_timeline_event(event)
}

#[tauri::command]
pub async fn move_timeline_event_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.move_timeline_event_to_book(TimelineEventId(id), BookId(book_id))
}

#[tauri::command]
pub async fn move_timeline_event_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.move_timeline_event_to_project(TimelineEventId(id))
}

#[tauri::command]
pub async fn delete_timeline_event(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.delete_timeline_event(TimelineEventId(id))
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
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.create_relationship(
        ProjectId(project_id),
        book_id.map(BookId),
        crate::features::characters::domain::CharacterId(character_a),
        crate::features::characters::domain::CharacterId(character_b),
        r#type,
    )
}

#[tauri::command]
pub async fn list_relationships_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<Relationship>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_relationships_by_book(BookId(book_id))
}

#[tauri::command]
pub async fn list_global_relationships(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Relationship>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_global_relationships(ProjectId(project_id))
}

#[tauri::command]
pub async fn update_relationship(
    state: State<'_, SqliteDatabase>,
    relationship: Relationship,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.update_relationship(relationship)
}

#[tauri::command]
pub async fn move_relationship_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.move_relationship_to_book(RelationshipId(id), BookId(book_id))
}

#[tauri::command]
pub async fn move_relationship_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.move_relationship_to_project(RelationshipId(id))
}

#[tauri::command]
pub async fn delete_relationship(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.delete_relationship(RelationshipId(id))
}

// Blacklist Commands
#[tauri::command]
pub async fn create_blacklist_entry(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    book_id: Option<String>,
    term: String,
) -> AppResult<BlacklistEntry> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.create_blacklist_entry(ProjectId(project_id), book_id.map(BookId), term)
}

#[tauri::command]
pub async fn get_blacklist_entry(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<BlacklistEntry> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.get_blacklist_entry(BlacklistEntryId(id))
}

#[tauri::command]
pub async fn list_blacklist_entries_by_book(
    state: State<'_, SqliteDatabase>,
    book_id: String,
) -> AppResult<Vec<BlacklistEntry>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_blacklist_entries_by_book(BookId(book_id))
}

#[tauri::command]
pub async fn list_global_blacklist_entries(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<BlacklistEntry>> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.list_global_blacklist_entries(ProjectId(project_id))
}

#[tauri::command]
pub async fn update_blacklist_entry(
    state: State<'_, SqliteDatabase>,
    entry: BlacklistEntry,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.update_blacklist_entry(entry)
}

#[tauri::command]
pub async fn move_blacklist_entry_to_book(
    state: State<'_, SqliteDatabase>,
    id: String,
    book_id: String,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.move_blacklist_entry_to_book(BlacklistEntryId(id), BookId(book_id))
}

#[tauri::command]
pub async fn move_blacklist_entry_to_project(
    state: State<'_, SqliteDatabase>,
    id: String,
) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.move_blacklist_entry_to_project(BlacklistEntryId(id))
}

#[tauri::command]
pub async fn delete_blacklist_entry(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    let service = LoreService::new(
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
        state.inner(),
    );
    service.delete_blacklist_entry(BlacklistEntryId(id))
}
