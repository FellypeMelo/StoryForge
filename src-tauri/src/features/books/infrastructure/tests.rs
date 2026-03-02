use crate::features::books::domain::{BookRepository, BookId};
use crate::infrastructure::sqlite::SqliteDatabase;
use crate::features::books::application::BookService;
use crate::features::projects::domain::{Project, ProjectRepository};
use tempfile::tempdir;

#[test]
fn test_book_service_flow() {
    let dir = tempdir().expect("Failed to create temp dir");
    let db_path = dir.path().join("test_books.db");
    let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
    db.run_migrations().expect("Failed to run migrations");

    let project = Project::new("Book Project".to_string(), "Desc".to_string()).unwrap();
    let project_repo: &dyn ProjectRepository = &db;
    project_repo.create_project(&project).unwrap();

    let service = BookService::new(&db);
    let project_id = project.id;

    // 1. Create
    let title = "The Fellowship of the AI".to_string();
    let book = service.create_book(project_id.clone(), title.clone()).unwrap();
    assert_eq!(book.title, title);

    // 2. Get
    let fetched = service.get_book(book.id.clone()).unwrap();
    assert_eq!(fetched.title, title);

    // 3. List
    let books = service.list_books(project_id.clone()).unwrap();
    assert_eq!(books.len(), 1);
    assert_eq!(books[0].title, title);

    // 4. Update
    let mut updated_book = fetched;
    updated_book.title = "The Return of the Coder".to_string();
    service.update_book(updated_book.clone()).unwrap();
    
    let fetched_updated = service.get_book(book.id.clone()).unwrap();
    assert_eq!(fetched_updated.title, "The Return of the Coder");

    // 5. Delete
    service.delete_book(book.id.clone()).unwrap();
    let result = service.get_book(book.id);
    assert!(result.is_err());
}

#[test]
fn test_book_repository_not_found() {
    let dir = tempdir().expect("Failed to create temp dir");
    let db_path = dir.path().join("test_repo_errors.db");
    let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
    db.run_migrations().expect("Failed to run migrations");

    let repo: &dyn BookRepository = &db;
    let result = repo.get_book_by_id(&BookId("non-existent".to_string()));
    assert!(result.is_err());
}
