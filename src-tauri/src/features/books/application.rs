use crate::domain::result::AppResult;
use crate::features::books::domain::{Book, BookId, BookRepository, ProjectId};

pub struct BookService<'a> {
    repo: &'a dyn BookRepository,
}

impl<'a> BookService<'a> {
    pub fn new(repo: &'a dyn BookRepository) -> Self {
        Self { repo }
    }

    pub fn create_book(&self, project_id: ProjectId, title: String) -> AppResult<Book> {
        let book = Book::new(project_id, title)?;
        self.repo.create_book(&book)?;
        Ok(book)
    }

    pub fn get_book(&self, id: BookId) -> AppResult<Book> {
        self.repo.get_book_by_id(&id)
    }

    pub fn list_books(&self, project_id: ProjectId) -> AppResult<Vec<Book>> {
        self.repo.list_books_by_project(&project_id)
    }

    pub fn update_book(&self, book: Book) -> AppResult<()> {
        self.repo.update_book(&book)
    }

    pub fn delete_book(&self, id: BookId) -> AppResult<()> {
        self.repo.delete_book(&id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::error::AppError;

    struct MockRepo;
    impl BookRepository for MockRepo {
        fn create_book(&self, _b: &Book) -> AppResult<()> {
            Ok(())
        }
        fn get_book_by_id(&self, _id: &BookId) -> AppResult<Book> {
            Ok(Book::new(ProjectId("p".to_string()), "T".to_string()).unwrap())
        }
        fn list_books_by_project(&self, _p: &ProjectId) -> AppResult<Vec<Book>> {
            Ok(vec![])
        }
        fn update_book(&self, _b: &Book) -> AppResult<()> {
            Ok(())
        }
        fn delete_book(&self, _id: &BookId) -> AppResult<()> {
            Ok(())
        }
    }

    struct FailingRepo;
    impl BookRepository for FailingRepo {
        fn create_book(&self, _b: &Book) -> AppResult<()> {
            Err(AppError::Database("boom".to_string()))
        }
        fn get_book_by_id(&self, id: &BookId) -> AppResult<Book> {
            Err(AppError::NotFound(format!(
                "Book with id {} not found",
                id.0
            )))
        }
        fn list_books_by_project(&self, _p: &ProjectId) -> AppResult<Vec<Book>> {
            Err(AppError::Database("boom".to_string()))
        }
        fn update_book(&self, b: &Book) -> AppResult<()> {
            Err(AppError::NotFound(format!(
                "Book with id {} not found",
                b.id.0
            )))
        }
        fn delete_book(&self, id: &BookId) -> AppResult<()> {
            Err(AppError::NotFound(format!(
                "Book with id {} not found",
                id.0
            )))
        }
    }

    #[test]
    fn test_book_service_create_returns_created_book() {
        let mock = MockRepo;
        let service = BookService::new(&mock);
        let book = service
            .create_book(ProjectId("p".to_string()), "Title".to_string())
            .unwrap();
        assert_eq!(book.title, "Title");
        assert!(!book.id.0.is_empty());
    }

    #[test]
    fn test_book_service_create_rejects_empty_title() {
        let mock = MockRepo;
        let service = BookService::new(&mock);
        let result = service.create_book(ProjectId("p".to_string()), "  ".to_string());
        assert!(matches!(result, Err(AppError::Validation(_))));
    }

    #[test]
    fn test_book_service_get_list_update_delete() {
        let mock = MockRepo;
        let service = BookService::new(&mock);
        let book = Book::new(ProjectId("p".to_string()), "T".to_string()).unwrap();

        assert!(service.get_book(BookId::new()).is_ok());
        assert!(service.list_books(ProjectId("p".to_string())).is_ok());
        assert!(service.update_book(book).is_ok());
        assert!(service.delete_book(BookId::new()).is_ok());
    }

    #[test]
    fn test_book_service_propagates_repository_errors() {
        let failing = FailingRepo;
        let service = BookService::new(&failing);
        let book = Book::new(ProjectId("p".to_string()), "T".to_string()).unwrap();

        assert!(matches!(
            service.create_book(ProjectId("p".to_string()), "T".to_string()),
            Err(AppError::Database(_))
        ));
        assert!(matches!(
            service.get_book(BookId::new()),
            Err(AppError::NotFound(_))
        ));
        assert!(matches!(
            service.list_books(ProjectId("p".to_string())),
            Err(AppError::Database(_))
        ));
        assert!(matches!(
            service.update_book(book),
            Err(AppError::NotFound(_))
        ));
        assert!(matches!(
            service.delete_book(BookId::new()),
            Err(AppError::NotFound(_))
        ));
    }
}
