use crate::features::books::domain::{Book, BookId, ProjectId};
use crate::features::books::application::BookService;
use crate::domain::result::AppResult;
use crate::infrastructure::sqlite::SqliteDatabase;
use tauri::State;

#[tauri::command]
pub async fn create_book(
    state: State<'_, SqliteDatabase>,
    project_id: String,
    title: String,
) -> AppResult<Book> {
    let service = BookService::new(state.inner());
    service.create_book(ProjectId(project_id), title)
}

#[tauri::command]
pub async fn get_book(state: State<'_, SqliteDatabase>, id: String) -> AppResult<Book> {
    let service = BookService::new(state.inner());
    service.get_book(BookId(id))
}

#[tauri::command]
pub async fn list_books(
    state: State<'_, SqliteDatabase>,
    project_id: String,
) -> AppResult<Vec<Book>> {
    let service = BookService::new(state.inner());
    service.list_books(ProjectId(project_id))
}

#[tauri::command]
pub async fn update_book(state: State<'_, SqliteDatabase>, book: Book) -> AppResult<()> {
    let service = BookService::new(state.inner());
    service.update_book(book)
}

#[tauri::command]
pub async fn delete_book(state: State<'_, SqliteDatabase>, id: String) -> AppResult<()> {
    let service = BookService::new(state.inner());
    service.delete_book(BookId(id))
}
