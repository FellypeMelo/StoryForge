use crate::domain::result::AppResult;
pub use crate::domain::value_objects::{
    BookId, ProjectId,
};

pub trait DatabasePort {
    fn is_healthy(&self) -> bool;
    fn get_version(&self) -> i32;
}

pub trait SearchPort {
    fn search(
        &self,
        project_id: &ProjectId,
        query: &str,
        book_id: Option<BookId>,
        types: Option<Vec<EntityType>>,
    ) -> AppResult<Vec<SearchResult>>;
}

pub trait VectorSearchPort {
    fn find_similar(
        &self,
        project_id: &ProjectId,
        embedding: Vec<f32>,
        top_k: usize,
        book_id: Option<BookId>,
        types: Option<Vec<EntityType>>,
    ) -> AppResult<Vec<SearchResult>>;
}

pub trait EmbeddingPort {
    fn generate_embedding(&self, text: &str) -> AppResult<Vec<f32>>;
}

// Base traits for standard operations
pub trait Repository<T, ID> {
    fn create(&self, entity: &T) -> AppResult<()>;
    fn get_by_id(&self, id: &ID) -> AppResult<T>;
    fn update(&self, entity: &T) -> AppResult<()>;
    fn delete(&self, id: &ID) -> AppResult<()>;
}

pub trait ScopedRepository<T, ID>: Repository<T, ID> {
    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<T>>;
    fn list_by_book(&self, book_id: &BookId) -> AppResult<Vec<T>>;
    fn list_global(&self, project_id: &ProjectId) -> AppResult<Vec<T>>;
    fn move_to_book(&self, id: &ID, book_id: &BookId) -> AppResult<()>;
    fn move_to_project(&self, id: &ID) -> AppResult<()>;
}

pub trait BookRepository {
    fn create_book(&self, book: &crate::domain::book::Book) -> AppResult<()>;
    fn get_book_by_id(&self, id: &BookId) -> AppResult<crate::domain::book::Book>;
    fn list_books_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<crate::domain::book::Book>>;
    fn update_book(&self, book: &crate::domain::book::Book) -> AppResult<()>;
    fn delete_book(&self, id: &BookId) -> AppResult<()>;
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EntityType {
    Character,
    Location,
    WorldRule,
    TimelineEvent,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SearchResult {
    pub entity_id: String,
    pub entity_type: EntityType,
    pub snippet: String,
    pub score: f64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::features::characters::domain::{Character, CharacterId};

    #[test]
    fn test_generic_repository_usage() {
        struct MockRepo;
        impl Repository<Character, CharacterId> for MockRepo {
            fn create(&self, _entity: &Character) -> AppResult<()> { Ok(()) }
            fn get_by_id(&self, _id: &CharacterId) -> AppResult<Character> { 
                Character::new(ProjectId("test".to_string()), None, "Test".to_string()) 
            }
            fn update(&self, _entity: &Character) -> AppResult<()> { Ok(()) }
            fn delete(&self, _id: &CharacterId) -> AppResult<()> { Ok(()) }
        }
        impl ScopedRepository<Character, CharacterId> for MockRepo {
            fn list_by_project(&self, _project_id: &ProjectId) -> AppResult<Vec<Character>> { Ok(vec![]) }
            fn list_by_book(&self, _book_id: &BookId) -> AppResult<Vec<Character>> { Ok(vec![]) }
            fn list_global(&self, _project_id: &ProjectId) -> AppResult<Vec<Character>> { Ok(vec![]) }
            fn move_to_book(&self, _id: &CharacterId, _book_id: &BookId) -> AppResult<()> { Ok(()) }
            fn move_to_project(&self, _id: &CharacterId) -> AppResult<()> { Ok(()) }
        }
        let repo = MockRepo;
        assert!(repo.list_global(&ProjectId("test".to_string())).is_ok());
    }
}
