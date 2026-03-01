use crate::domain::character::Character;
use crate::domain::project::Project;
use crate::domain::location::Location;
use crate::domain::world_rule::WorldRule;
use crate::domain::timeline_event::TimelineEvent;
use crate::domain::relationship::Relationship;
use crate::domain::blacklist_entry::BlacklistEntry;
use crate::domain::value_objects::{ProjectId, CharacterId, LocationId, WorldRuleId, TimelineEventId, RelationshipId, BlacklistEntryId};
use crate::domain::error::AppResult;

pub trait DatabasePort {
    fn is_healthy(&self) -> bool;
    fn get_version(&self) -> i32;
}

pub trait SearchPort {
    fn search(&self, project_id: &ProjectId, query: &str, types: Option<Vec<EntityType>>) -> AppResult<Vec<SearchResult>>;
}

pub trait VectorSearchPort {
    fn find_similar(&self, project_id: &ProjectId, embedding: Vec<f32>, top_k: usize, types: Option<Vec<EntityType>>) -> AppResult<Vec<SearchResult>>;
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

pub trait CharacterRepository {
    fn create_character(&self, character: &Character) -> AppResult<()>;
    fn get_character_by_id(&self, id: &CharacterId) -> AppResult<Character>;
    fn list_characters_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Character>>;
    fn update_character(&self, character: &Character) -> AppResult<()>;
    fn delete_character(&self, id: &CharacterId) -> AppResult<()>;
}

pub trait LocationRepository {
    fn create_location(&self, location: &Location) -> AppResult<()>;
    fn get_location_by_id(&self, id: &LocationId) -> AppResult<Location>;
    fn list_locations_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Location>>;
    fn update_location(&self, location: &Location) -> AppResult<()>;
    fn delete_location(&self, id: &LocationId) -> AppResult<()>;
}

pub trait WorldRuleRepository {
    fn create_world_rule(&self, rule: &WorldRule) -> AppResult<()>;
    fn get_world_rule_by_id(&self, id: &WorldRuleId) -> AppResult<WorldRule>;
    fn list_world_rules_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<WorldRule>>;
    fn update_world_rule(&self, rule: &WorldRule) -> AppResult<()>;
    fn delete_world_rule(&self, id: &WorldRuleId) -> AppResult<()>;
}

pub trait TimelineRepository {
    fn create_timeline_event(&self, event: &TimelineEvent) -> AppResult<()>;
    fn get_timeline_event_by_id(&self, id: &TimelineEventId) -> AppResult<TimelineEvent>;
    fn list_timeline_events_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<TimelineEvent>>;
    fn update_timeline_event(&self, event: &TimelineEvent) -> AppResult<()>;
    fn delete_timeline_event(&self, id: &TimelineEventId) -> AppResult<()>;
}

pub trait RelationshipRepository {
    fn create_relationship(&self, relationship: &Relationship) -> AppResult<()>;
    fn get_relationship_by_id(&self, id: &RelationshipId) -> AppResult<Relationship>;
    fn list_relationships_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Relationship>>;
    fn update_relationship(&self, relationship: &Relationship) -> AppResult<()>;
    fn delete_relationship(&self, id: &RelationshipId) -> AppResult<()>;
}

pub trait BlacklistRepository {
    fn create_blacklist_entry(&self, entry: &BlacklistEntry) -> AppResult<()>;
    fn get_blacklist_entry_by_id(&self, id: &BlacklistEntryId) -> AppResult<BlacklistEntry>;
    fn list_blacklist_entries_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<BlacklistEntry>>;
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
