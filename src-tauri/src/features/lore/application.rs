use crate::domain::result::AppResult;
use crate::domain::value_objects::{BookId, ProjectId};
use crate::domain::ports::{SearchPort, SearchResult};
use super::domain::*;

pub struct LoreService<'a> {
    location_repo: &'a dyn LocationRepository,
    rule_repo: &'a dyn WorldRuleRepository,
    timeline_repo: &'a dyn TimelineRepository,
    relationship_repo: &'a dyn RelationshipRepository,
    blacklist_repo: &'a dyn BlacklistRepository,
    search_port: &'a dyn SearchPort,
}

impl<'a> LoreService<'a> {
    pub fn new(
        location_repo: &'a dyn LocationRepository,
        rule_repo: &'a dyn WorldRuleRepository,
        timeline_repo: &'a dyn TimelineRepository,
        relationship_repo: &'a dyn RelationshipRepository,
        blacklist_repo: &'a dyn BlacklistRepository,
        search_port: &'a dyn SearchPort,
    ) -> Self {
        Self {
            location_repo,
            rule_repo,
            timeline_repo,
            relationship_repo,
            blacklist_repo,
            search_port,
        }
    }

    // Location methods
    pub fn create_location(&self, project_id: ProjectId, book_id: Option<BookId>, name: String) -> AppResult<Location> {
        let location = Location::new(project_id, book_id, name)?;
        self.location_repo.create_location(&location)?;
        Ok(location)
    }

    pub fn list_locations_by_project(&self, project_id: ProjectId) -> AppResult<Vec<Location>> {
        self.location_repo.list_locations_by_project(&project_id)
    }

    pub fn list_locations_by_book(&self, book_id: BookId) -> AppResult<Vec<Location>> {
        self.location_repo.list_locations_by_book(&book_id)
    }

    pub fn list_global_locations(&self, project_id: ProjectId) -> AppResult<Vec<Location>> {
        self.location_repo.list_global_locations(&project_id)
    }

    pub fn move_location_to_book(&self, id: LocationId, book_id: BookId) -> AppResult<()> {
        self.location_repo.move_location_to_book(&id, &book_id)
    }

    pub fn move_location_to_project(&self, id: LocationId) -> AppResult<()> {
        self.location_repo.move_location_to_project(&id)
    }

    // World Rule methods
    pub fn create_world_rule(&self, project_id: ProjectId, book_id: Option<BookId>, category: String, content: String) -> AppResult<WorldRule> {
        let rule = WorldRule::new(project_id, book_id, category, content)?;
        self.rule_repo.create_world_rule(&rule)?;
        Ok(rule)
    }

    pub fn list_world_rules_by_project(&self, project_id: ProjectId) -> AppResult<Vec<WorldRule>> {
        self.rule_repo.list_world_rules_by_project(&project_id)
    }

    pub fn list_world_rules_by_book(&self, book_id: BookId) -> AppResult<Vec<WorldRule>> {
        self.rule_repo.list_world_rules_by_book(&book_id)
    }

    pub fn list_global_world_rules(&self, project_id: ProjectId) -> AppResult<Vec<WorldRule>> {
        self.rule_repo.list_global_world_rules(&project_id)
    }

    pub fn move_world_rule_to_book(&self, id: WorldRuleId, book_id: BookId) -> AppResult<()> {
        self.rule_repo.move_world_rule_to_book(&id, &book_id)
    }

    pub fn move_world_rule_to_project(&self, id: WorldRuleId) -> AppResult<()> {
        self.rule_repo.move_world_rule_to_project(&id)
    }

    // Timeline methods
    pub fn create_timeline_event(&self, project_id: ProjectId, book_id: Option<BookId>, description: String) -> AppResult<TimelineEvent> {
        let event = TimelineEvent::new(project_id, book_id, description)?;
        self.timeline_repo.create_timeline_event(&event)?;
        Ok(event)
    }

    pub fn list_timeline_events_by_book(&self, book_id: BookId) -> AppResult<Vec<TimelineEvent>> {
        self.timeline_repo.list_timeline_events_by_book(&book_id)
    }

    pub fn list_global_timeline_events(&self, project_id: ProjectId) -> AppResult<Vec<TimelineEvent>> {
        self.timeline_repo.list_global_timeline_events(&project_id)
    }

    pub fn update_timeline_event(&self, event: TimelineEvent) -> AppResult<()> {
        self.timeline_repo.update_timeline_event(&event)
    }

    pub fn move_timeline_event_to_book(&self, id: TimelineEventId, book_id: BookId) -> AppResult<()> {
        self.timeline_repo.move_timeline_event_to_book(&id, &book_id)
    }

    pub fn move_timeline_event_to_project(&self, id: TimelineEventId) -> AppResult<()> {
        self.timeline_repo.move_timeline_event_to_project(&id)
    }

    pub fn delete_timeline_event(&self, id: TimelineEventId) -> AppResult<()> {
        self.timeline_repo.delete_timeline_event(&id)
    }

    // Relationship methods
    pub fn create_relationship(&self, project_id: ProjectId, book_id: Option<BookId>, char_a: CharacterId, char_b: CharacterId, rel_type: String) -> AppResult<Relationship> {
        let rel = Relationship::new(project_id, book_id, char_a, char_b, rel_type)?;
        self.relationship_repo.create_relationship(&rel)?;
        Ok(rel)
    }

    pub fn list_relationships_by_book(&self, book_id: BookId) -> AppResult<Vec<Relationship>> {
        self.relationship_repo.list_relationships_by_book(&book_id)
    }

    pub fn list_global_relationships(&self, project_id: ProjectId) -> AppResult<Vec<Relationship>> {
        self.relationship_repo.list_global_relationships(&project_id)
    }

    pub fn update_relationship(&self, relationship: Relationship) -> AppResult<()> {
        self.relationship_repo.update_relationship(&relationship)
    }

    pub fn move_relationship_to_book(&self, id: RelationshipId, book_id: BookId) -> AppResult<()> {
        self.relationship_repo.move_relationship_to_book(&id, &book_id)
    }

    pub fn move_relationship_to_project(&self, id: RelationshipId) -> AppResult<()> {
        self.relationship_repo.move_relationship_to_project(&id)
    }

    pub fn delete_relationship(&self, id: RelationshipId) -> AppResult<()> {
        self.relationship_repo.delete_relationship(&id)
    }

    // Blacklist methods
    pub fn create_blacklist_entry(&self, project_id: ProjectId, book_id: Option<BookId>, term: String) -> AppResult<BlacklistEntry> {
        let entry = BlacklistEntry::new(project_id, book_id, term)?;
        self.blacklist_repo.create_blacklist_entry(&entry)?;
        Ok(entry)
    }

    pub fn list_blacklist_entries_by_book(&self, book_id: BookId) -> AppResult<Vec<BlacklistEntry>> {
        self.blacklist_repo.list_blacklist_entries_by_book(&book_id)
    }

    pub fn list_global_blacklist_entries(&self, project_id: ProjectId) -> AppResult<Vec<BlacklistEntry>> {
        self.blacklist_repo.list_global_blacklist_entries(&project_id)
    }

    pub fn update_blacklist_entry(&self, entry: BlacklistEntry) -> AppResult<()> {
        self.blacklist_repo.update_blacklist_entry(&entry)
    }

    pub fn move_blacklist_entry_to_book(&self, id: BlacklistEntryId, book_id: BookId) -> AppResult<()> {
        self.blacklist_repo.move_blacklist_entry_to_book(&id, &book_id)
    }

    pub fn move_blacklist_entry_to_project(&self, id: BlacklistEntryId) -> AppResult<()> {
        self.blacklist_repo.move_blacklist_entry_to_project(&id)
    }

    pub fn delete_blacklist_entry(&self, id: BlacklistEntryId) -> AppResult<()> {
        self.blacklist_repo.delete_blacklist_entry(&id)
    }

    // Search methods
    pub fn search_lore(&self, project_id: ProjectId, query: &str, book_id: Option<BookId>) -> AppResult<Vec<SearchResult>> {
        self.search_port.search(&project_id, query, book_id, None)
    }
}
