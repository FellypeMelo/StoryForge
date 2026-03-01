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

pub trait ProjectRepository {
    fn create(&self, project: &Project) -> AppResult<()>;
    fn get_by_id(&self, id: &ProjectId) -> AppResult<Project>;
    fn list_all(&self) -> AppResult<Vec<Project>>;
    fn update(&self, project: &Project) -> AppResult<()>;
    fn delete(&self, id: &ProjectId) -> AppResult<()>;
}

pub trait CharacterRepository {
    fn create(&self, character: &Character) -> AppResult<()>;
    fn get_by_id(&self, id: &CharacterId) -> AppResult<Character>;
    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Character>>;
    fn update(&self, character: &Character) -> AppResult<()>;
    fn delete(&self, id: &CharacterId) -> AppResult<()>;
}

pub trait LocationRepository {
    fn create(&self, location: &Location) -> AppResult<()>;
    fn get_by_id(&self, id: &LocationId) -> AppResult<Location>;
    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Location>>;
    fn update(&self, location: &Location) -> AppResult<()>;
    fn delete(&self, id: &LocationId) -> AppResult<()>;
}

pub trait WorldRuleRepository {
    fn create(&self, rule: &WorldRule) -> AppResult<()>;
    fn get_by_id(&self, id: &WorldRuleId) -> AppResult<WorldRule>;
    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<WorldRule>>;
    fn update(&self, rule: &WorldRule) -> AppResult<()>;
    fn delete(&self, id: &WorldRuleId) -> AppResult<()>;
}

pub trait TimelineRepository {
    fn create(&self, event: &TimelineEvent) -> AppResult<()>;
    fn get_by_id(&self, id: &TimelineEventId) -> AppResult<TimelineEvent>;
    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<TimelineEvent>>;
    fn update(&self, event: &TimelineEvent) -> AppResult<()>;
    fn delete(&self, id: &TimelineEventId) -> AppResult<()>;
}

pub trait RelationshipRepository {
    fn create(&self, relationship: &Relationship) -> AppResult<()>;
    fn get_by_id(&self, id: &RelationshipId) -> AppResult<Relationship>;
    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Relationship>>;
    fn update(&self, relationship: &Relationship) -> AppResult<()>;
    fn delete(&self, id: &RelationshipId) -> AppResult<()>;
}

pub trait BlacklistRepository {
    fn create(&self, entry: &BlacklistEntry) -> AppResult<()>;
    fn get_by_id(&self, id: &BlacklistEntryId) -> AppResult<BlacklistEntry>;
    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<BlacklistEntry>>;
    fn update(&self, entry: &BlacklistEntry) -> AppResult<()>;
    fn delete(&self, id: &BlacklistEntryId) -> AppResult<()>;
}
