use crate::features::books::domain::{Book, BookRepository, BookId, ProjectId};
use crate::infrastructure::sqlite::SqliteDatabase;
use crate::domain::result::AppResult;
use crate::domain::error::AppError;
use rusqlite::{params, Row};

impl BookRepository for SqliteDatabase {
    fn create_book(&self, book: &Book) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO books (id, project_id, title, genre, synopsis, description, status, order_in_series) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            params![book.id.0, book.project_id.0, book.title, book.genre, book.synopsis, book.description, book.status, book.order_in_series],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_book_by_id(&self, id: &BookId) -> AppResult<Book> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let book = conn.query_row(
            "SELECT id, project_id, title, genre, synopsis, description, status, order_in_series, created_at FROM books WHERE id = ?",
            [id.0.clone()],
            |row: &Row| {
                Ok(Book {
                    id: BookId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    title: row.get(2)?,
                    genre: row.get(3)?,
                    synopsis: row.get(4)?,
                    description: row.get(5)?,
                    status: row.get(6)?,
                    order_in_series: row.get(7)?,
                    created_at: row.get(8)?,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Book with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(book)
    }

    fn list_books_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Book>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare(
            "SELECT id, project_id, title, genre, synopsis, description, status, order_in_series, created_at FROM books WHERE project_id = ? ORDER BY order_in_series ASC"
        ).map_err(AppError::from)?;

        let book_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Book {
                    id: BookId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    title: row.get(2)?,
                    genre: row.get(3)?,
                    synopsis: row.get(4)?,
                    description: row.get(5)?,
                    status: row.get(6)?,
                    order_in_series: row.get(7)?,
                    created_at: row.get(8)?,
                })
            })
            .map_err(AppError::from)?;

        let mut books = Vec::new();
        for book in book_iter {
            books.push(book?);
        }
        Ok(books)
    }

    fn update_book(&self, book: &Book) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn.execute(
            "UPDATE books SET title = ?, genre = ?, synopsis = ?, description = ?, status = ?, order_in_series = ? WHERE id = ?",
            params![book.title, book.genre, book.synopsis, book.description, book.status, book.order_in_series, book.id.0],
        ).map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Book with id {} not found",
                book.id.0
            )));
        }
        Ok(())
    }

    fn delete_book(&self, id: &BookId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM books WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Book with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests;
