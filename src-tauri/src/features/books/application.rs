use crate::domain::result::AppResult;
use crate::features::books::domain::{Book, BookRepository, BookId, ProjectId};

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
