use crate::domain::blacklist_entry::BlacklistEntry;
use crate::domain::book::Book;
use crate::domain::character::Character;
use crate::domain::error::AppResult;
use crate::domain::location::Location;
use crate::domain::project::Project;
use crate::domain::relationship::Relationship;
use crate::domain::timeline_event::TimelineEvent;
use crate::domain::value_objects::{
    BlacklistEntryId, BookId, CharacterId, LocationId, ProjectId, RelationshipId, TimelineEventId,
    WorldRuleId,
};
use crate::domain::world_rule::WorldRule;

pub trait DatabasePort {
    fn is_healthy(&self) -> bool;
    fn get_version(&self) -> i32;
}

pub trait SearchPort {
    fn search(
        &self,
        project_id: &ProjectId,
        query: &str,
        book_id: Option<BookId>,
        types: Option<Vec<EntityType>>,
    ) -> AppResult<Vec<SearchResult>>;
}

pub trait VectorSearchPort {
    fn find_similar(
        &self,
        project_id: &ProjectId,
        embedding: Vec<f32>,
        top_k: usize,
        book_id: Option<BookId>,
        types: Option<Vec<EntityType>>,
    ) -> AppResult<Vec<SearchResult>>;
}

pub trait EmbeddingPort {
    fn generate_embedding(&self, text: &str) -> AppResult<Vec<f32>>;
}

pub trait ProjectRepository {
    fn create_project(&self, project: &Project) -> AppResult<()>;
    fn get_project_by_id(&self, id: &ProjectId) -> AppResult<Project>;
    fn list_all_projects(&self) -> AppResult<Vec<Project>>;
    fn update_project(&self, project: &Project) -> AppResult<()>;
    fn delete_project(&self, id: &ProjectId) -> AppResult<()>;
}

pub trait BookRepository {
    fn create_book(&self, book: &Book) -> AppResult<()>;
    fn get_book_by_id(&self, id: &BookId) -> AppResult<Book>;
    fn list_books_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Book>>;
    fn update_book(&self, book: &Book) -> AppResult<()>;
    fn delete_book(&self, id: &BookId) -> AppResult<()>;
}

pub trait CharacterRepository {
    fn create_character(&self, character: &Character) -> AppResult<()>;
    fn get_character_by_id(&self, id: &CharacterId) -> AppResult<Character>;
    fn list_characters_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Character>>;
    fn list_characters_by_book(&self, book_id: &BookId) -> AppResult<Vec<Character>>;
    fn list_global_characters(&self, project_id: &ProjectId) -> AppResult<Vec<Character>>;
    fn move_character_to_book(&self, id: &CharacterId, book_id: &BookId) -> AppResult<()>;
    fn move_character_to_project(&self, id: &CharacterId) -> AppResult<()>;
    fn update_character(&self, character: &Character) -> AppResult<()>;
    fn delete_character(&self, id: &CharacterId) -> AppResult<()>;
}

pub trait LocationRepository {
    fn create_location(&self, location: &Location) -> AppResult<()>;
    fn get_location_by_id(&self, id: &LocationId) -> AppResult<Location>;
    fn list_locations_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Location>>;
    fn list_locations_by_book(&self, book_id: &BookId) -> AppResult<Vec<Location>>;
    fn list_global_locations(&self, project_id: &ProjectId) -> AppResult<Vec<Location>>;
    fn move_location_to_book(&self, id: &LocationId, book_id: &BookId) -> AppResult<()>;
    fn move_location_to_project(&self, id: &LocationId) -> AppResult<()>;
    fn update_location(&self, location: &Location) -> AppResult<()>;
    fn delete_location(&self, id: &LocationId) -> AppResult<()>;
}

pub trait WorldRuleRepository {
    fn create_world_rule(&self, rule: &WorldRule) -> AppResult<()>;
    fn get_world_rule_by_id(&self, id: &WorldRuleId) -> AppResult<WorldRule>;
    fn list_world_rules_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<WorldRule>>;
    fn list_world_rules_by_book(&self, book_id: &BookId) -> AppResult<Vec<WorldRule>>;
    fn list_global_world_rules(&self, project_id: &ProjectId) -> AppResult<Vec<WorldRule>>;
    fn move_world_rule_to_book(&self, id: &WorldRuleId, book_id: &BookId) -> AppResult<()>;
    fn move_world_rule_to_project(&self, id: &WorldRuleId) -> AppResult<()>;
    fn update_world_rule(&self, rule: &WorldRule) -> AppResult<()>;
    fn delete_world_rule(&self, id: &WorldRuleId) -> AppResult<()>;
}

pub trait TimelineRepository {
    fn create_timeline_event(&self, event: &TimelineEvent) -> AppResult<()>;
    fn get_timeline_event_by_id(&self, id: &TimelineEventId) -> AppResult<TimelineEvent>;
    fn list_timeline_events_by_project(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<TimelineEvent>>;
    fn list_timeline_events_by_book(&self, book_id: &BookId) -> AppResult<Vec<TimelineEvent>>;
    fn list_global_timeline_events(&self, project_id: &ProjectId) -> AppResult<Vec<TimelineEvent>>;
    fn move_timeline_event_to_book(&self, id: &TimelineEventId, book_id: &BookId) -> AppResult<()>;
    fn move_timeline_event_to_project(&self, id: &TimelineEventId) -> AppResult<()>;
    fn update_timeline_event(&self, event: &TimelineEvent) -> AppResult<()>;
    fn delete_timeline_event(&self, id: &TimelineEventId) -> AppResult<()>;
}

pub trait RelationshipRepository {
    fn create_relationship(&self, relationship: &Relationship) -> AppResult<()>;
    fn get_relationship_by_id(&self, id: &RelationshipId) -> AppResult<Relationship>;
    fn list_relationships_by_project(&self, project_id: &ProjectId)
        -> AppResult<Vec<Relationship>>;
    fn list_relationships_by_book(&self, book_id: &BookId) -> AppResult<Vec<Relationship>>;
    fn list_global_relationships(&self, project_id: &ProjectId) -> AppResult<Vec<Relationship>>;
    fn move_relationship_to_book(&self, id: &RelationshipId, book_id: &BookId) -> AppResult<()>;
    fn move_relationship_to_project(&self, id: &RelationshipId) -> AppResult<()>;
    fn update_relationship(&self, relationship: &Relationship) -> AppResult<()>;
    fn delete_relationship(&self, id: &RelationshipId) -> AppResult<()>;
}

pub trait BlacklistRepository {
    fn create_blacklist_entry(&self, entry: &BlacklistEntry) -> AppResult<()>;
    fn get_blacklist_entry_by_id(&self, id: &BlacklistEntryId) -> AppResult<BlacklistEntry>;
    fn list_blacklist_entries_by_project(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<BlacklistEntry>>;
    fn list_blacklist_entries_by_book(&self, book_id: &BookId) -> AppResult<Vec<BlacklistEntry>>;
    fn list_global_blacklist_entries(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<BlacklistEntry>>;
    fn move_blacklist_entry_to_book(
        &self,
        id: &BlacklistEntryId,
        book_id: &BookId,
    ) -> AppResult<()>;
    fn move_blacklist_entry_to_project(&self, id: &BlacklistEntryId) -> AppResult<()>;
    fn update_blacklist_entry(&self, entry: &BlacklistEntry) -> AppResult<()>;
    fn delete_blacklist_entry(&self, id: &BlacklistEntryId) -> AppResult<()>;
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EntityType {
    Character,
    Location,
    WorldRule,
    TimelineEvent,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SearchResult {
    pub entity_id: String,
    pub entity_type: EntityType,
    pub snippet: String,
    pub score: f64,
}
