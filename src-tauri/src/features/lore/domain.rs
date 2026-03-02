use crate::domain::error::AppError;
use crate::domain::result::AppResult;
pub use crate::domain::value_objects::{
    BlacklistEntryId, BookId, CharacterId, LocationId, ProjectId, RelationshipId, TimelineEventId,
    WorldRuleId,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub id: LocationId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub name: String,
    pub description: String,
    pub symbolic_meaning: String,
}

impl Location {
    pub fn new(project_id: ProjectId, book_id: Option<BookId>, name: String) -> AppResult<Self> {
        if name.trim().is_empty() {
            return Err(AppError::Validation("Location name cannot be empty".to_string()));
        }
        Ok(Self {
            id: LocationId::new(),
            project_id,
            book_id,
            name,
            description: String::new(),
            symbolic_meaning: String::new(),
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldRule {
    pub id: WorldRuleId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub category: String,
    pub content: String,
    pub hierarchy: u32,
}

impl WorldRule {
    pub fn new(project_id: ProjectId, book_id: Option<BookId>, category: String, content: String) -> AppResult<Self> {
        if category.trim().is_empty() {
            return Err(AppError::Validation("Category cannot be empty".to_string()));
        }
        if content.trim().is_empty() {
            return Err(AppError::Validation("Content cannot be empty".to_string()));
        }
        Ok(Self {
            id: WorldRuleId::new(),
            project_id,
            book_id,
            category,
            content,
            hierarchy: 0,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: TimelineEventId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub date: String,
    pub description: String,
    pub causal_dependencies: Vec<TimelineEventId>,
}

impl TimelineEvent {
    pub fn new(project_id: ProjectId, book_id: Option<BookId>, description: String) -> AppResult<Self> {
        if description.trim().is_empty() {
            return Err(AppError::Validation("Description cannot be empty".to_string()));
        }
        Ok(Self {
            id: TimelineEventId::new(),
            project_id,
            book_id,
            date: String::new(),
            description,
            causal_dependencies: Vec::new(),
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relationship {
    pub id: RelationshipId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub character_a: CharacterId,
    pub character_b: CharacterId,
    pub r#type: String,
}

impl Relationship {
    pub fn new(project_id: ProjectId, book_id: Option<BookId>, character_a: CharacterId, character_b: CharacterId, r#type: String) -> AppResult<Self> {
        if r#type.trim().is_empty() {
            return Err(AppError::Validation("Relationship type cannot be empty".to_string()));
        }
        Ok(Self {
            id: RelationshipId::new(),
            project_id,
            book_id,
            character_a,
            character_b,
            r#type,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlacklistEntry {
    pub id: BlacklistEntryId,
    pub project_id: ProjectId,
    pub book_id: Option<BookId>,
    pub term: String,
    pub category: String,
    pub reason: String,
}

impl BlacklistEntry {
    pub fn new(project_id: ProjectId, book_id: Option<BookId>, term: String) -> AppResult<Self> {
        if term.trim().is_empty() {
            return Err(AppError::Validation("Term cannot be empty".to_string()));
        }
        Ok(Self {
            id: BlacklistEntryId::new(),
            project_id,
            book_id,
            term,
            category: String::new(),
            reason: String::new(),
        })
    }
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
    fn list_timeline_events_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<TimelineEvent>>;
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
    fn list_relationships_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Relationship>>;
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
    fn list_blacklist_entries_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<BlacklistEntry>>;
    fn list_blacklist_entries_by_book(&self, book_id: &BookId) -> AppResult<Vec<BlacklistEntry>>;
    fn list_global_blacklist_entries(&self, project_id: &ProjectId) -> AppResult<Vec<BlacklistEntry>>;
    fn move_blacklist_entry_to_book(&self, id: &BlacklistEntryId, book_id: &BookId) -> AppResult<()>;
    fn move_blacklist_entry_to_project(&self, id: &BlacklistEntryId) -> AppResult<()>;
    fn update_blacklist_entry(&self, entry: &BlacklistEntry) -> AppResult<()>;
    fn delete_blacklist_entry(&self, id: &BlacklistEntryId) -> AppResult<()>;
}
