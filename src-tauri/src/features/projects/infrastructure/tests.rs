use crate::features::projects::domain::ProjectRepository;
use crate::features::projects::application::ProjectService;
use crate::infrastructure::sqlite::SqliteDatabase;
use crate::domain::value_objects::ProjectId;
use tempfile::tempdir;

#[test]
fn test_project_service_flow() {
    let dir = tempdir().expect("Failed to create temp dir");
    let db_path = dir.path().join("test_projects.db");
    let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
    db.run_migrations().expect("Failed to run migrations");

    let service = ProjectService::new(&db);

    // 1. Create
    let name = "Epic Saga".to_string();
    let description = "A massive world".to_string();
    let project = service.create_project(name.clone(), description.clone()).unwrap();
    assert_eq!(project.name, name);
    assert_eq!(project.description, description);

    // 2. List
    let projects = service.list_projects().unwrap();
    assert_eq!(projects.len(), 1);
    assert_eq!(projects[0].name, name);

    // 3. Update
    let mut updated_project = project.clone();
    updated_project.name = "Legendary Saga".to_string();
    service.update_project(updated_project.clone()).unwrap();
    
    let fetched = db.get_project_by_id(&project.id).unwrap();
    assert_eq!(fetched.name, "Legendary Saga");

    // 4. Delete
    service.delete_project(project.id.clone()).unwrap();
    let result = db.get_project_by_id(&project.id);
    assert!(result.is_err());
}

#[test]
fn test_project_repository_not_found() {
    let dir = tempdir().expect("Failed to create temp dir");
    let db_path = dir.path().join("test_proj_repo_errors.db");
    let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
    db.run_migrations().expect("Failed to run migrations");

    let repo: &dyn ProjectRepository = &db;
    let result = repo.get_project_by_id(&ProjectId("non-existent".to_string()));
    assert!(result.is_err());
}
