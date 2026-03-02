use crate::domain::error::{AppError, AppResult};
pub use crate::domain::value_objects::{BookId, ProjectId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Book {
    pub id: BookId,
    pub project_id: ProjectId,
    pub title: String,
    pub genre: String,
    pub synopsis: String,
    pub description: String,
    pub status: String,
    pub order_in_series: i32,
    pub created_at: String,
}

impl Book {
    pub fn new(project_id: ProjectId, title: String) -> AppResult<Self> {
        if title.trim().is_empty() {
            return Err(AppError::Validation(
                "Book title cannot be empty".to_string(),
            ));
        }

        Ok(Self {
            id: BookId::new(),
            project_id,
            title,
            genre: "Geral".to_string(),
            synopsis: String::new(),
            description: String::new(),
            status: "draft".to_string(),
            order_in_series: 1,
            created_at: String::new(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_book_creation_fails_with_empty_title() {
        let project_id = ProjectId("test-project".to_string());
        let result = Book::new(project_id, "".to_string());

        assert!(result.is_err());
        if let Err(AppError::Validation(msg)) = result {
            assert_eq!(msg, "Book title cannot be empty");
        } else {
            panic!("Expected validation error for empty title");
        }
    }

    #[test]
    fn test_book_creation_succeeds_with_valid_data() {
        let project_id = ProjectId("test-project".to_string());
        let result = Book::new(project_id, "The First Chronicle".to_string());

        assert!(result.is_ok());
        let book = result.unwrap();
        assert_eq!(book.title, "The First Chronicle");
        assert_eq!(book.genre, "Geral");
        assert_eq!(book.status, "draft");
        assert_eq!(book.order_in_series, 1);
        assert!(!book.id.0.is_empty());
    }
}
