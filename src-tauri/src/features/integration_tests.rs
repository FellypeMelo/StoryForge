use crate::infrastructure::sqlite::SqliteDatabase;
use crate::features::projects::domain::{Project, ProjectRepository};
use crate::features::characters::domain::{Character, CharacterRepository};
use crate::features::lore::domain::{Relationship, RelationshipRepository};
use tempfile::tempdir;

#[test]
fn test_cross_feature_integration() {
    let dir = tempdir().expect("Failed to create temp dir");
    let db_path = dir.path().join("integration.db");
    let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
    db.run_migrations().expect("Failed to run migrations");

    let project_repo: &dyn ProjectRepository = &db;
    let character_repo: &dyn CharacterRepository = &db;
    let relationship_repo: &dyn RelationshipRepository = &db;

    // 1. Create Project
    let project = Project::new("Epic Fantasy".to_string(), "A world of magic".to_string()).unwrap();
    project_repo.create_project(&project).expect("Failed to create project");

    // 2. Create Characters
    let char_a = Character::new(project.id.clone(), None, "Hero".to_string()).unwrap();
    let char_b = Character::new(project.id.clone(), None, "Villain".to_string()).unwrap();
    character_repo.create_character(&char_a).expect("Failed to create char_a");
    character_repo.create_character(&char_b).expect("Failed to create char_b");

    // 3. Create Relationship
    let rel = Relationship::new(
        project.id.clone(),
        None,
        char_a.id.clone(),
        char_b.id.clone(),
        "Enemies".to_string()
    ).unwrap();
    relationship_repo.create_relationship(&rel).expect("Failed to create relationship");

    // 4. Verify
    let characters = character_repo.list_characters_by_project(&project.id).unwrap();
    assert_eq!(characters.len(), 2);

    let relationships = relationship_repo.list_global_relationships(&project.id).unwrap();
    assert_eq!(relationships.len(), 1);
    assert_eq!(relationships[0].r#type, "Enemies");
}
