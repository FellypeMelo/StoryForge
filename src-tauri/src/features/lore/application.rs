use crate::domain::result::AppResult;
use crate::domain::value_objects::{BookId, ProjectId};
use crate::domain::ports::{SearchPort, SearchResult, EntityType};
use crate::domain::token_budget::TokenBudgetCalculator;
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

    /// Detecta entidades no texto e constrói o bloco de contexto.
    pub fn inject_context(
        &self,
        project_id: &ProjectId,
        book_id: Option<BookId>,
        text: &str,
        max_tokens: usize,
    ) -> AppResult<String> {
        let budget_calculator = TokenBudgetCalculator::new(max_tokens);
        let words: Vec<&str> = text.split_whitespace().collect();
        let mut seen_entities = std::collections::HashSet::new();
        let mut context_block = String::from("--- LORE CONTEXT ---\n");

        for word in words {
            if word.len() < 4 {
                continue;
            }

            let results = self
                .search_port
                .search(project_id, word, book_id.clone(), None)?;
            for res in results {
                if seen_entities.contains(&res.entity_id) {
                    continue;
                }

                let type_str = match res.entity_type {
                    EntityType::Character => "Character",
                    EntityType::Location => "Location",
                    EntityType::WorldRule => "World Rule",
                    EntityType::TimelineEvent => "Event",
                };

                let snippet = format!("[{}]: {}\n", type_str, res.snippet);

                if budget_calculator
                    .validate_budget(&context_block, &snippet)
                    .is_ok()
                {
                    context_block.push_str(&snippet);
                    seen_entities.insert(res.entity_id);
                }
            }
        }

        if seen_entities.is_empty() {
            return Ok(String::new());
        }

        context_block.push_str("--------------------\n");
        Ok(context_block)
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::value_objects::{LocationId, WorldRuleId, TimelineEventId, RelationshipId, BlacklistEntryId, CharacterId};

    struct MockRepo;

    impl LocationRepository for MockRepo {
        fn create_location(&self, _location: &Location) -> AppResult<()> { Ok(()) }
        fn get_location_by_id(&self, _id: &LocationId) -> AppResult<Location> { 
            Ok(Location::new(ProjectId("p".to_string()), None, "L".to_string()).unwrap())
        }
        fn list_locations_by_project(&self, _project_id: &ProjectId) -> AppResult<Vec<Location>> { Ok(vec![]) }
        fn list_locations_by_book(&self, _book_id: &BookId) -> AppResult<Vec<Location>> { Ok(vec![]) }
        fn list_global_locations(&self, _project_id: &ProjectId) -> AppResult<Vec<Location>> { Ok(vec![]) }
        fn move_location_to_book(&self, _id: &LocationId, _book_id: &BookId) -> AppResult<()> { Ok(()) }
        fn move_location_to_project(&self, _id: &LocationId) -> AppResult<()> { Ok(()) }
        fn update_location(&self, _location: &Location) -> AppResult<()> { Ok(()) }
        fn delete_location(&self, _id: &LocationId) -> AppResult<()> { Ok(()) }
    }

    impl WorldRuleRepository for MockRepo {
        fn create_world_rule(&self, _rule: &WorldRule) -> AppResult<()> { Ok(()) }
        fn get_world_rule_by_id(&self, _id: &WorldRuleId) -> AppResult<WorldRule> {
            Ok(WorldRule::new(ProjectId("p".to_string()), None, "C".to_string(), "Co".to_string()).unwrap())
        }
        fn list_world_rules_by_project(&self, _project_id: &ProjectId) -> AppResult<Vec<WorldRule>> { Ok(vec![]) }
        fn list_world_rules_by_book(&self, _book_id: &BookId) -> AppResult<Vec<WorldRule>> { Ok(vec![]) }
        fn list_global_world_rules(&self, _project_id: &ProjectId) -> AppResult<Vec<WorldRule>> { Ok(vec![]) }
        fn move_world_rule_to_book(&self, _id: &WorldRuleId, _book_id: &BookId) -> AppResult<()> { Ok(()) }
        fn move_world_rule_to_project(&self, _id: &WorldRuleId) -> AppResult<()> { Ok(()) }
        fn update_world_rule(&self, _rule: &WorldRule) -> AppResult<()> { Ok(()) }
        fn delete_world_rule(&self, _id: &WorldRuleId) -> AppResult<()> { Ok(()) }
    }

    impl TimelineRepository for MockRepo {
        fn create_timeline_event(&self, _event: &TimelineEvent) -> AppResult<()> { Ok(()) }
        fn get_timeline_event_by_id(&self, _id: &TimelineEventId) -> AppResult<TimelineEvent> {
            Ok(TimelineEvent::new(ProjectId("p".to_string()), None, "D".to_string()).unwrap())
        }
        fn list_timeline_events_by_project(&self, _project_id: &ProjectId) -> AppResult<Vec<TimelineEvent>> { Ok(vec![]) }
        fn list_timeline_events_by_book(&self, _book_id: &BookId) -> AppResult<Vec<TimelineEvent>> { Ok(vec![]) }
        fn list_global_timeline_events(&self, _project_id: &ProjectId) -> AppResult<Vec<TimelineEvent>> { Ok(vec![]) }
        fn move_timeline_event_to_book(&self, _id: &TimelineEventId, _book_id: &BookId) -> AppResult<()> { Ok(()) }
        fn move_timeline_event_to_project(&self, _id: &TimelineEventId) -> AppResult<()> { Ok(()) }
        fn update_timeline_event(&self, _event: &TimelineEvent) -> AppResult<()> { Ok(()) }
        fn delete_timeline_event(&self, _id: &TimelineEventId) -> AppResult<()> { Ok(()) }
    }

    impl RelationshipRepository for MockRepo {
        fn create_relationship(&self, _rel: &Relationship) -> AppResult<()> { Ok(()) }
        fn get_relationship_by_id(&self, _id: &RelationshipId) -> AppResult<Relationship> {
            Ok(Relationship::new(ProjectId("p".to_string()), None, CharacterId::new(), CharacterId::new(), "T".to_string()).unwrap())
        }
        fn list_relationships_by_project(&self, _project_id: &ProjectId) -> AppResult<Vec<Relationship>> { Ok(vec![]) }
        fn list_relationships_by_book(&self, _book_id: &BookId) -> AppResult<Vec<Relationship>> { Ok(vec![]) }
        fn list_global_relationships(&self, _project_id: &ProjectId) -> AppResult<Vec<Relationship>> { Ok(vec![]) }
        fn move_relationship_to_book(&self, _id: &RelationshipId, _book_id: &BookId) -> AppResult<()> { Ok(()) }
        fn move_relationship_to_project(&self, _id: &RelationshipId) -> AppResult<()> { Ok(()) }
        fn update_relationship(&self, _relationship: &Relationship) -> AppResult<()> { Ok(()) }
        fn delete_relationship(&self, _id: &RelationshipId) -> AppResult<()> { Ok(()) }
    }

    impl BlacklistRepository for MockRepo {
        fn create_blacklist_entry(&self, _entry: &BlacklistEntry) -> AppResult<()> { Ok(()) }
        fn get_blacklist_entry_by_id(&self, _id: &BlacklistEntryId) -> AppResult<BlacklistEntry> {
            Ok(BlacklistEntry::new(ProjectId("p".to_string()), None, "T".to_string()).unwrap())
        }
        fn list_blacklist_entries_by_project(&self, _project_id: &ProjectId) -> AppResult<Vec<BlacklistEntry>> { Ok(vec![]) }
        fn list_blacklist_entries_by_book(&self, _book_id: &BookId) -> AppResult<Vec<BlacklistEntry>> { Ok(vec![]) }
        fn list_global_blacklist_entries(&self, _project_id: &ProjectId) -> AppResult<Vec<BlacklistEntry>> { Ok(vec![]) }
        fn move_blacklist_entry_to_book(&self, _id: &BlacklistEntryId, _book_id: &BookId) -> AppResult<()> { Ok(()) }
        fn move_blacklist_entry_to_project(&self, _id: &BlacklistEntryId) -> AppResult<()> { Ok(()) }
        fn update_blacklist_entry(&self, _entry: &BlacklistEntry) -> AppResult<()> { Ok(()) }
        fn delete_blacklist_entry(&self, _id: &BlacklistEntryId) -> AppResult<()> { Ok(()) }
    }

    impl SearchPort for MockRepo {
        fn search(&self, _p: &ProjectId, _q: &str, _b: Option<BookId>, _t: Option<Vec<EntityType>>) -> AppResult<Vec<SearchResult>> {
            Ok(vec![])
        }
    }

    #[test]
    fn test_lore_service_location_ops() {
        let mock = MockRepo;
        let service = LoreService::new(&mock, &mock, &mock, &mock, &mock, &mock);
        let pid = ProjectId("p".to_string());

        assert!(service.create_location(pid.clone(), None, "L".to_string()).is_ok());
        assert!(service.list_locations_by_project(pid.clone()).is_ok());
        assert!(service.list_locations_by_book(BookId::new()).is_ok());
        assert!(service.list_global_locations(pid).is_ok());
        assert!(service.move_location_to_book(LocationId::new(), BookId::new()).is_ok());
        assert!(service.move_location_to_project(LocationId::new()).is_ok());
    }

    #[test]
    fn test_lore_service_world_rule_ops() {
        let mock = MockRepo;
        let service = LoreService::new(&mock, &mock, &mock, &mock, &mock, &mock);
        let pid = ProjectId("p".to_string());

        assert!(service.create_world_rule(pid.clone(), None, "C".to_string(), "Co".to_string()).is_ok());
        assert!(service.list_world_rules_by_project(pid.clone()).is_ok());
        assert!(service.list_world_rules_by_book(BookId::new()).is_ok());
        assert!(service.list_global_world_rules(pid).is_ok());
        assert!(service.move_world_rule_to_book(WorldRuleId::new(), BookId::new()).is_ok());
        assert!(service.move_world_rule_to_project(WorldRuleId::new()).is_ok());
    }

    #[test]
    fn test_lore_service_timeline_ops() {
        let mock = MockRepo;
        let service = LoreService::new(&mock, &mock, &mock, &mock, &mock, &mock);
        let pid = ProjectId("p".to_string());

        assert!(service.create_timeline_event(pid.clone(), None, "D".to_string()).is_ok());
        assert!(service.list_timeline_events_by_book(BookId::new()).is_ok());
        assert!(service.list_global_timeline_events(pid).is_ok());
        assert!(service.delete_timeline_event(TimelineEventId::new()).is_ok());
    }

    #[test]
    fn test_lore_service_relationship_ops() {
        let mock = MockRepo;
        let service = LoreService::new(&mock, &mock, &mock, &mock, &mock, &mock);
        let pid = ProjectId("p".to_string());

        assert!(service.create_relationship(pid.clone(), None, CharacterId::new(), CharacterId::new(), "T".to_string()).is_ok());
        assert!(service.list_relationships_by_book(BookId::new()).is_ok());
        assert!(service.list_global_relationships(pid).is_ok());
        assert!(service.delete_relationship(RelationshipId::new()).is_ok());
    }

    #[test]
    fn test_lore_service_blacklist_ops() {
        let mock = MockRepo;
        let service = LoreService::new(&mock, &mock, &mock, &mock, &mock, &mock);
        let pid = ProjectId("p".to_string());

        assert!(service.create_blacklist_entry(pid.clone(), None, "T".to_string()).is_ok());
        assert!(service.list_blacklist_entries_by_book(BookId::new()).is_ok());
        assert!(service.list_global_blacklist_entries(pid).is_ok());
        assert!(service.delete_blacklist_entry(BlacklistEntryId::new()).is_ok());
    }
}
