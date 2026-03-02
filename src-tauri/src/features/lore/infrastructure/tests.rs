use crate::features::lore::domain::*;
use crate::features::lore::application::LoreService;
use crate::features::projects::domain::{Project, ProjectRepository};
use crate::features::characters::domain::{Character, CharacterRepository};
use crate::infrastructure::sqlite::SqliteDatabase;
use crate::domain::value_objects::ProjectId;
use tempfile::tempdir;

fn setup_db() -> (SqliteDatabase, ProjectId) {
    let dir = tempdir().expect("Failed to create temp dir");
    let db_path = dir.path().join("test_lore.db");
    let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
    db.run_migrations().expect("Failed to run migrations");

    let project = Project::new("Lore Project".to_string(), "Lore desc".to_string()).unwrap();
    let project_repo: &dyn ProjectRepository = &db;
    project_repo.create_project(&project).unwrap();

    (db, project.id)
}

#[test]
fn test_location_repository() {
    let (db, project_id) = setup_db();
    let repo: &dyn LocationRepository = &db;

    // 1. Create
    let location = Location::new(project_id.clone(), None, "Kingdom of Test".to_string()).unwrap();
    repo.create_location(&location).unwrap();

    // 2. Get
    let fetched = repo.get_location_by_id(&location.id).unwrap();
    assert_eq!(fetched.name, "Kingdom of Test");

    // 3. List by project
    let list = repo.list_locations_by_project(&project_id).unwrap();
    assert_eq!(list.len(), 1);

    // 4. Update
    let mut updated = fetched;
    updated.name = "Empire of Test".to_string();
    repo.update_location(&updated).unwrap();
    let fetched_updated = repo.get_location_by_id(&location.id).unwrap();
    assert_eq!(fetched_updated.name, "Empire of Test");

    // 5. Delete
    repo.delete_location(&location.id).unwrap();
    assert!(repo.get_location_by_id(&location.id).is_err());
}

#[test]
fn test_world_rule_repository() {
    let (db, project_id) = setup_db();
    let repo: &dyn WorldRuleRepository = &db;

    let rule = WorldRule::new(project_id.clone(), None, "Magic".to_string(), "Magic costs mana".to_string()).unwrap();
    repo.create_world_rule(&rule).unwrap();

    let fetched = repo.get_world_rule_by_id(&rule.id).unwrap();
    assert_eq!(fetched.category, "Magic");

    let list = repo.list_world_rules_by_project(&project_id).unwrap();
    assert_eq!(list.len(), 1);

    repo.delete_world_rule(&rule.id).unwrap();
    assert!(repo.get_world_rule_by_id(&rule.id).is_err());
}

#[test]
fn test_timeline_repository() {
    let (db, project_id) = setup_db();
    let repo: &dyn TimelineRepository = &db;

    let event = TimelineEvent::new(project_id.clone(), None, "The Big Bang".to_string()).unwrap();
    repo.create_timeline_event(&event).unwrap();

    let fetched = repo.get_timeline_event_by_id(&event.id).unwrap();
    assert_eq!(fetched.description, "The Big Bang");

    repo.delete_timeline_event(&event.id).unwrap();
    assert!(repo.get_timeline_event_by_id(&event.id).is_err());
}

#[test]
fn test_relationship_repository() {
    let (db, project_id) = setup_db();
    let repo: &dyn RelationshipRepository = &db;
    let char_repo: &dyn CharacterRepository = &db;

    let char_a = Character::new(project_id.clone(), None, "A".to_string()).unwrap();
    let char_b = Character::new(project_id.clone(), None, "B".to_string()).unwrap();
    char_repo.create_character(&char_a).unwrap();
    char_repo.create_character(&char_b).unwrap();

    let rel = Relationship::new(project_id.clone(), None, char_a.id.clone(), char_b.id.clone(), "Friends".to_string()).unwrap();
    repo.create_relationship(&rel).unwrap();

    let fetched = repo.get_relationship_by_id(&rel.id).unwrap();
    assert_eq!(fetched.r#type, "Friends");

    repo.delete_relationship(&rel.id).unwrap();
    assert!(repo.get_relationship_by_id(&rel.id).is_err());
}

#[test]
fn test_blacklist_repository() {
    let (db, project_id) = setup_db();
    let repo: &dyn BlacklistRepository = &db;

    let entry = BlacklistEntry::new(project_id.clone(), None, "forbidden".to_string()).unwrap();
    repo.create_blacklist_entry(&entry).unwrap();

    let fetched = repo.get_blacklist_entry_by_id(&entry.id).unwrap();
    assert_eq!(fetched.term, "forbidden");

    repo.delete_blacklist_entry(&entry.id).unwrap();
    assert!(repo.get_blacklist_entry_by_id(&entry.id).is_err());
}

#[test]
fn test_lore_service_inject_context() {
    let (db, project_id) = setup_db();
    let service = LoreService::new(&db, &db, &db, &db, &db, &db);

    // Create a location to search for
    let location = Location::new(project_id.clone(), None, "Winterfell".to_string()).unwrap();
    let loc_repo: &dyn LocationRepository = &db;
    loc_repo.create_location(&location).unwrap();

    let context = service.inject_context(&project_id, None, "The road to Winterfell is long", 1000).unwrap();
    assert!(context.contains("--- LORE CONTEXT ---"));
    assert!(context.contains("Winterfell"));
}
