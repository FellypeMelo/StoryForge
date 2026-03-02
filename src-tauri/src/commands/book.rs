use crate::domain::book::{Book, BookId, ProjectId};
use crate::domain::result::AppResult;
use crate::domain::ports::BookRepository;
use crate::infrastructure::sqlite::SqliteDatabase;
use tauri::State;

#[tauri::command]
pub async fn create_book(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    title: String,
) -> AppResult<Book> {
    let book = Book::new(ProjectId(project_id), title)?;
    state.create_book(&book)?;
    Ok(book)
}

#[tauri::command]
pub async fn get_book(state: State<'_, SqliteDatabase>, id: String) -> AppResult<Book> {
    state.get_book_by_id(&BookId(id))
}

#[tauri::command]
pub async fn list_books(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Book>> {
    state.list_books_by_project(&ProjectId(project_id))
}

#[tauri::command]
pub async fn update_book(state: State<'_, SqliteDatabase>, book: Book) -> AppResult<()> {
    state.update_book(&book)
}

#[tauri::command]
pub async fn delete_book(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    state.delete_book(&BookId(id))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_book_domain_logic_in_command_context() {
        let project_id = "proj-123".to_string();
        let title = "The First Chronicle".to_string();

        let book = Book::new(ProjectId(project_id.clone()), title.clone()).unwrap();
        assert_eq!(book.title, title);
        assert_eq!(book.project_id.0, project_id);
        assert_eq!(book.status, "draft");
    }
}
