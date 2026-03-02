use crate::domain::ports::{
    BlacklistRepository, BookRepository, DatabasePort, EmbeddingPort,
    EntityType, LocationRepository, ProjectRepository, RelationshipRepository, SearchPort,
    SearchResult, TimelineRepository, VectorSearchPort, WorldRuleRepository,
};
use crate::features::characters::domain::CharacterRepository;
use rusqlite::{params, Connection, Result, Row};
use std::path::Path;
use std::sync::{Mutex, Once};
use zerocopy::AsBytes;

pub struct MockEmbeddingPort;

impl EmbeddingPort for MockEmbeddingPort {
    fn generate_embedding(&self, text: &str) -> AppResult<Vec<f32>> {
        // Gera um vetor determinístico baseado no texto para testes
        let mut embedding = vec![0.0f32; 1536];
        for (i, char) in text.chars().enumerate() {
            if i < 1536 {
                embedding[i] = (char as u32 as f32) / 255.0;
            }
        }
        Ok(embedding)
    }
}

static SQLITE_VEC_INIT: Once = Once::new();

use crate::domain::blacklist_entry::BlacklistEntry;
use crate::domain::book::Book;
use crate::features::characters::domain::{Character, OceanScores};
use crate::domain::error::AppError;
use crate::domain::result::AppResult;
use crate::domain::location::Location;
use crate::domain::project::Project;
use crate::domain::relationship::Relationship;
use crate::domain::timeline_event::TimelineEvent;
pub use crate::domain::value_objects::{
    BlacklistEntryId, BookId, CharacterId, LocationId, ProjectId, RelationshipId, TimelineEventId,
    WorldRuleId,
};
use crate::domain::world_rule::WorldRule;

pub struct SqliteDatabase {
    pub connection: Mutex<Connection>,
    pub embedding_port: Box<dyn EmbeddingPort + Send + Sync>,
}

impl SqliteDatabase {
    pub fn new(path: &Path) -> Result<Self> {
        // Register sqlite-vec auto-extension once
        SQLITE_VEC_INIT.call_once(|| unsafe {
            rusqlite::ffi::sqlite3_auto_extension(Some(std::mem::transmute(
                sqlite_vec::sqlite3_vec_init as *const (),
            )));
        });

        let connection = Connection::open(path)?;

        // Enable WAL mode for better concurrency
        connection.pragma_update(None, "journal_mode", &"WAL")?;

        Ok(SqliteDatabase {
            connection: Mutex::new(connection),
            embedding_port: Box::new(MockEmbeddingPort),
        })
    }

    pub fn run_migrations(&self) -> Result<()> {
        let conn = self.connection.lock().map_err(|e| {
            rusqlite::Error::ToSqlConversionFailure(Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            )))
        })?;
        let current_version: i32 =
            conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;

        if current_version < 1 {
            conn.execute_batch(
                "BEGIN;
                 CREATE TABLE IF NOT EXISTS story_codex (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                 );
                 PRAGMA user_version = 1;
                 COMMIT;",
            )?;
        }

        let current_version: i32 =
            conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
        if current_version < 2 {
            conn.execute_batch(
                "BEGIN;
                 CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                 );
                 CREATE TABLE IF NOT EXISTS characters (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    age INTEGER DEFAULT 0,
                    occupation TEXT DEFAULT '',
                    physical_description TEXT DEFAULT '',
                    goal TEXT DEFAULT '',
                    motivation TEXT DEFAULT '',
                    internal_conflict TEXT DEFAULT '',
                    voice TEXT DEFAULT '',
                    mannerisms TEXT DEFAULT '',
                    ocean_openness INTEGER DEFAULT 50,
                    ocean_conscientiousness INTEGER DEFAULT 50,
                    ocean_extraversion INTEGER DEFAULT 50,
                    ocean_agreeableness INTEGER DEFAULT 50,
                    ocean_neuroticism INTEGER DEFAULT 50,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
                 );
                 PRAGMA user_version = 2;
                 COMMIT;",
            )?;
        }

        let current_version: i32 =
            conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
        if current_version < 3 {
            conn.execute_batch(
                "BEGIN;
                 CREATE TABLE IF NOT EXISTS locations (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT DEFAULT '',
                    symbolic_meaning TEXT DEFAULT '',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
                 );
                 CREATE TABLE IF NOT EXISTS world_rules (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    category TEXT NOT NULL,
                    content TEXT NOT NULL,
                    hierarchy INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
                 );
                 CREATE TABLE IF NOT EXISTS timeline_events (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    date TEXT DEFAULT '',
                    description TEXT NOT NULL,
                    causal_dependencies TEXT DEFAULT '[]',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
                 );
                 CREATE TABLE IF NOT EXISTS relationships (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    character_a TEXT NOT NULL,
                    character_b TEXT NOT NULL,
                    type TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
                    FOREIGN KEY(character_a) REFERENCES characters(id) ON DELETE CASCADE,
                    FOREIGN KEY(character_b) REFERENCES characters(id) ON DELETE CASCADE
                 );
                 CREATE TABLE IF NOT EXISTS blacklist_entries (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    term TEXT NOT NULL,
                    category TEXT DEFAULT '',
                    reason TEXT DEFAULT '',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
                 );
                 PRAGMA user_version = 3;
                 COMMIT;",
            )?;
        }

        let current_version: i32 =
            conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
        if current_version < 4 {
            conn.execute_batch(
                "BEGIN;
                 -- Virtual table for unified Lore search
                 CREATE VIRTUAL TABLE IF NOT EXISTS lore_search USING fts5(
                    entity_id UNINDEXED,
                    project_id UNINDEXED,
                    type UNINDEXED,
                    title,
                    content
                 );
                 
                 -- Trigger to keep lore_search updated when a character is added/updated
                 CREATE TRIGGER IF NOT EXISTS trg_characters_ai AFTER INSERT ON characters BEGIN
                    INSERT INTO lore_search (entity_id, project_id, type, title, content)
                    VALUES (new.id, new.project_id, 'character', new.name, new.occupation || ' ' || new.physical_description);
                 END;
                 
                 CREATE TRIGGER IF NOT EXISTS trg_locations_ai AFTER INSERT ON locations BEGIN
                    INSERT INTO lore_search (entity_id, project_id, type, title, content)
                    VALUES (new.id, new.project_id, 'location', new.name, new.description);
                 END;

                 CREATE TRIGGER IF NOT EXISTS trg_world_rules_ai AFTER INSERT ON world_rules BEGIN
                    INSERT INTO lore_search (entity_id, project_id, type, title, content)
                    VALUES (new.id, new.project_id, 'world_rule', new.category, new.content);
                 END;

                 CREATE TRIGGER IF NOT EXISTS trg_timeline_events_ai AFTER INSERT ON timeline_events BEGIN
                    INSERT INTO lore_search (entity_id, project_id, type, title, content)
                    VALUES (new.id, new.project_id, 'timeline_event', new.date, new.description);
                 END;

                 PRAGMA user_version = 4;
                 COMMIT;"
            )?;
        }

        let current_version: i32 =
            conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
        if current_version < 5 {
            conn.execute_batch(
                "BEGIN;
                 -- Virtual table for vector search (1536 dims for OpenAI standard, can be adjusted)
                 -- We use primary key to link back to entities
                 CREATE VIRTUAL TABLE IF NOT EXISTS lore_vectors USING vec0(
                    entity_id TEXT PRIMARY KEY,
                    embedding float[1536]
                 );
                 PRAGMA user_version = 5;
                 COMMIT;",
            )?;
        }

        let current_version: i32 =
            conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
        if current_version < 6 {
            conn.execute_batch(
                "BEGIN;
                 ALTER TABLE projects ADD COLUMN description TEXT DEFAULT '';

                 CREATE TABLE IF NOT EXISTS books (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    genre TEXT DEFAULT 'Geral',
                    synopsis TEXT DEFAULT '',
                    description TEXT DEFAULT '',
                    status TEXT DEFAULT 'draft',
                    order_in_series INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
                 );
                 PRAGMA user_version = 6;
                 COMMIT;",
            )?;
        }

        let current_version: i32 =
            conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
        if current_version < 7 {
            conn.execute_batch(
                "BEGIN;
                 ALTER TABLE characters ADD COLUMN book_id TEXT;
                 ALTER TABLE locations ADD COLUMN book_id TEXT;
                 ALTER TABLE world_rules ADD COLUMN book_id TEXT;
                 ALTER TABLE timeline_events ADD COLUMN book_id TEXT;
                 ALTER TABLE relationships ADD COLUMN book_id TEXT;
                 ALTER TABLE blacklist_entries ADD COLUMN book_id TEXT;

                 -- Drop and recreate FTS5 table to add book_id column
                 DROP TABLE IF EXISTS lore_search;
                 CREATE VIRTUAL TABLE lore_search USING fts5(
                    entity_id UNINDEXED,
                    project_id UNINDEXED,
                    book_id UNINDEXED,
                    type UNINDEXED,
                    title,
                    content
                 );

                 -- Re-populate lore_search
                 INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                 SELECT id, project_id, book_id, 'character', name, occupation || ' ' || physical_description FROM characters;

                 INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                 SELECT id, project_id, book_id, 'location', name, description FROM locations;

                 INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                 SELECT id, project_id, book_id, 'world_rule', category, content FROM world_rules;

                 INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                 SELECT id, project_id, book_id, 'timeline_event', date, description FROM timeline_events;

                 -- Recreate triggers
                 DROP TRIGGER IF EXISTS trg_characters_ai;
                 CREATE TRIGGER trg_characters_ai AFTER INSERT ON characters BEGIN
                    INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                    VALUES (new.id, new.project_id, new.book_id, 'character', new.name, new.occupation || ' ' || new.physical_description);
                 END;

                 DROP TRIGGER IF EXISTS trg_locations_ai;
                 CREATE TRIGGER trg_locations_ai AFTER INSERT ON locations BEGIN
                    INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                    VALUES (new.id, new.project_id, new.book_id, 'location', new.name, new.description);
                 END;

                 DROP TRIGGER IF EXISTS trg_world_rules_ai;
                 CREATE TRIGGER trg_world_rules_ai AFTER INSERT ON world_rules BEGIN
                    INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                    VALUES (new.id, new.project_id, new.book_id, 'world_rule', new.category, new.content);
                 END;

                 DROP TRIGGER IF EXISTS trg_timeline_events_ai;
                 CREATE TRIGGER trg_timeline_events_ai AFTER INSERT ON timeline_events BEGIN
                    INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                    VALUES (new.id, new.project_id, new.book_id, 'timeline_event', new.date, new.description);
                 END;

                 PRAGMA user_version = 7;
                 COMMIT;",
            )?;
        }

        Ok(())
    }
}

impl DatabasePort for SqliteDatabase {
    fn is_healthy(&self) -> bool {
        match self.connection.lock() {
            Ok(conn) => conn.query_row("SELECT 1", [], |_| Ok(())).is_ok(),
            Err(e) => {
                eprintln!("Critical: Database mutex poisoned: {}", e);
                false
            }
        }
    }

    fn get_version(&self) -> i32 {
        let conn_result = self.connection.lock();
        if let Ok(conn) = conn_result {
            conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))
                .unwrap_or_else(|e| {
                    eprintln!("Warning: Failed to fetch database version: {}", e);
                    0
                })
        } else {
            0
        }
    }
}

impl VectorSearchPort for SqliteDatabase {
    fn find_similar(
        &self,
        project_id: &ProjectId,
        embedding: Vec<f32>,
        top_k: usize,
        book_id: Option<BookId>,
        types: Option<Vec<EntityType>>,
    ) -> AppResult<Vec<SearchResult>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;

        let mut sql = "
            SELECT v.entity_id, v.distance, s.type, s.title, s.content
            FROM lore_vectors v
            JOIN lore_search s ON v.entity_id = s.entity_id
            WHERE s.project_id = ? AND v.embedding MATCH ? AND v.k = ?
        "
        .to_string();

        if let Some(ref bid) = book_id {
            sql.push_str(" AND s.book_id = ?");
        } else {
            sql.push_str(" AND s.book_id IS NULL");
        }

        if let Some(ref t) = types {
            if !t.is_empty() {
                let type_placeholders: Vec<String> = t.iter().map(|_| "?".to_string()).collect();
                sql.push_str(&format!(" AND s.type IN ({})", type_placeholders.join(",")));
            }
        }

        sql.push_str(&format!(" ORDER BY v.distance ASC LIMIT {}", top_k));

        let mut stmt = conn.prepare(&sql).map_err(AppError::from)?;

        let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![
            Box::new(project_id.0.clone()),
            Box::new(zerocopy::AsBytes::as_bytes(embedding.as_slice()).to_vec()),
            Box::new(top_k as i64),
        ];

        if let Some(ref bid) = book_id {
            params.push(Box::new(bid.0.clone()));
        }

        if let Some(t) = types {
            for entity_type in t {
                let type_str = match entity_type {
                    EntityType::Character => "character",
                    EntityType::Location => "location",
                    EntityType::WorldRule => "world_rule",
                    EntityType::TimelineEvent => "timeline_event",
                };
                params.push(Box::new(type_str.to_string()));
            }
        }

        let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

        let results_iter = stmt
            .query_map(rusqlite::params_from_iter(params_refs), |row: &Row| {
                let type_str: String = row.get(2)?;
                let entity_type = match type_str.as_str() {
                    "character" => EntityType::Character,
                    "location" => EntityType::Location,
                    "world_rule" => EntityType::WorldRule,
                    "timeline_event" => EntityType::TimelineEvent,
                    _ => EntityType::WorldRule,
                };

                Ok(SearchResult {
                    entity_id: row.get(0)?,
                    entity_type,
                    snippet: row.get(3)?,
                    score: row.get(1)?,
                })
            })
            .map_err(AppError::from)?;

        let mut results = Vec::new();
        for res in results_iter {
            results.push(res?);
        }
        Ok(results)
    }
}

impl ProjectRepository for SqliteDatabase {
    fn create_project(&self, project: &Project) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO projects (id, name, description) VALUES (?, ?, ?)",
            params![project.id.0, project.name, project.description],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn get_project_by_id(&self, id: &ProjectId) -> AppResult<Project> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let project = conn
            .query_row(
                "SELECT id, name, description, created_at FROM projects WHERE id = ?",
                [id.0.clone()],
                |row: &Row| {
                    Ok(Project {
                        id: ProjectId(row.get(0)?),
                        name: row.get(1)?,
                        description: row.get(2)?,
                        created_at: row.get(3)?,
                    })
                },
            )
            .map_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    AppError::NotFound(format!("Project with id {} not found", id.0))
                }
                _ => AppError::from(e),
            })?;
        Ok(project)
    }

    fn list_all_projects(&self) -> AppResult<Vec<Project>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("SELECT id, name, description, created_at FROM projects")
            .map_err(AppError::from)?;

        let project_iter = stmt
            .query_map([], |row: &Row| {
                Ok(Project {
                    id: ProjectId(row.get(0)?),
                    name: row.get(1)?,
                    description: row.get(2)?,
                    created_at: row.get(3)?,
                })
            })
            .map_err(AppError::from)?;

        let mut projects = Vec::new();
        for project in project_iter {
            projects.push(project?);
        }
        Ok(projects)
    }

    fn update_project(&self, project: &Project) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
                "UPDATE projects SET name = ?, description = ? WHERE id = ?",
                params![project.name, project.description, project.id.0],
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Project with id {} not found",
                project.id.0
            )));
        }
        Ok(())
    }

    fn delete_project(&self, id: &ProjectId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM projects WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Project with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

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

impl LocationRepository for SqliteDatabase {
    fn create_location(&self, location: &Location) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO locations (id, project_id, book_id, name, description, symbolic_meaning) VALUES (?, ?, ?, ?, ?, ?)",
            params![
                location.id.0,
                location.project_id.0,
                location.book_id.as_ref().map(|id| id.0.clone()),
                location.name,
                location.description,
                location.symbolic_meaning
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_location_by_id(&self, id: &LocationId) -> AppResult<Location> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let location = conn.query_row(
            "SELECT id, project_id, book_id, name, description, symbolic_meaning FROM locations WHERE id = ?",
            [id.0.clone()],
            |row: &Row| {
                Ok(Location {
                    id: LocationId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    description: row.get(4)?,
                    symbolic_meaning: row.get(5)?,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Location with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(location)
    }

    fn list_locations_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Location>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, name, description, symbolic_meaning FROM locations WHERE project_id = ?")
            .map_err(AppError::from)?;

        let location_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Location {
                    id: LocationId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    description: row.get(4)?,
                    symbolic_meaning: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut locations = Vec::new();
        for loc in location_iter {
            locations.push(loc?);
        }
        Ok(locations)
    }

    fn list_locations_by_book(&self, book_id: &BookId) -> AppResult<Vec<Location>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, name, description, symbolic_meaning FROM locations WHERE book_id = ?")
            .map_err(AppError::from)?;

        let location_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                Ok(Location {
                    id: LocationId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    description: row.get(4)?,
                    symbolic_meaning: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut locations = Vec::new();
        for loc in location_iter {
            locations.push(loc?);
        }
        Ok(locations)
    }

    fn list_global_locations(&self, project_id: &ProjectId) -> AppResult<Vec<Location>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, name, description, symbolic_meaning FROM locations WHERE project_id = ? AND book_id IS NULL")
            .map_err(AppError::from)?;

        let location_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Location {
                    id: LocationId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    description: row.get(4)?,
                    symbolic_meaning: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut locations = Vec::new();
        for loc in location_iter {
            locations.push(loc?);
        }
        Ok(locations)
    }

    fn move_location_to_book(&self, id: &LocationId, book_id: &BookId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE locations SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_location_to_project(&self, id: &LocationId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE locations SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_location(&self, location: &Location) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
                "UPDATE locations SET name = ?, description = ?, symbolic_meaning = ? WHERE id = ?",
                params![
                    location.name,
                    location.description,
                    location.symbolic_meaning,
                    location.id.0
                ],
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Location with id {} not found",
                location.id.0
            )));
        }
        Ok(())
    }

    fn delete_location(&self, id: &LocationId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM locations WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Location with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

impl WorldRuleRepository for SqliteDatabase {
    fn create_world_rule(&self, rule: &WorldRule) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO world_rules (id, project_id, book_id, category, content, hierarchy) VALUES (?, ?, ?, ?, ?, ?)",
            params![
                rule.id.0,
                rule.project_id.0,
                rule.book_id.as_ref().map(|id| id.0.clone()),
                rule.category,
                rule.content,
                rule.hierarchy
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_world_rule_by_id(&self, id: &WorldRuleId) -> AppResult<WorldRule> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rule = conn
            .query_row(
                "SELECT id, project_id, book_id, category, content, hierarchy FROM world_rules WHERE id = ?",
                [id.0.clone()],
                |row: &Row| {
                    Ok(WorldRule {
                        id: WorldRuleId(row.get(0)?),
                        project_id: ProjectId(row.get(1)?),
                        book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                        category: row.get(3)?,
                        content: row.get(4)?,
                        hierarchy: row.get(5)?,
                    })
                },
            )
            .map_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    AppError::NotFound(format!("WorldRule with id {} not found", id.0))
                }
                _ => AppError::from(e),
            })?;
        Ok(rule)
    }

    fn list_world_rules_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<WorldRule>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, category, content, hierarchy FROM world_rules WHERE project_id = ? ORDER BY hierarchy ASC")
            .map_err(AppError::from)?;

        let rule_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(WorldRule {
                    id: WorldRuleId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    category: row.get(3)?,
                    content: row.get(4)?,
                    hierarchy: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut rules = Vec::new();
        for rule in rule_iter {
            rules.push(rule?);
        }
        Ok(rules)
    }

    fn list_world_rules_by_book(&self, book_id: &BookId) -> AppResult<Vec<WorldRule>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, category, content, hierarchy FROM world_rules WHERE book_id = ? ORDER BY hierarchy ASC")
            .map_err(AppError::from)?;

        let rule_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                Ok(WorldRule {
                    id: WorldRuleId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    category: row.get(3)?,
                    content: row.get(4)?,
                    hierarchy: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut rules = Vec::new();
        for rule in rule_iter {
            rules.push(rule?);
        }
        Ok(rules)
    }

    fn list_global_world_rules(&self, project_id: &ProjectId) -> AppResult<Vec<WorldRule>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, category, content, hierarchy FROM world_rules WHERE project_id = ? AND book_id IS NULL ORDER BY hierarchy ASC")
            .map_err(AppError::from)?;

        let rule_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(WorldRule {
                    id: WorldRuleId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    category: row.get(3)?,
                    content: row.get(4)?,
                    hierarchy: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut rules = Vec::new();
        for rule in rule_iter {
            rules.push(rule?);
        }
        Ok(rules)
    }

    fn move_world_rule_to_book(&self, id: &WorldRuleId, book_id: &BookId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE world_rules SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_world_rule_to_project(&self, id: &WorldRuleId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE world_rules SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_world_rule(&self, rule: &WorldRule) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
                "UPDATE world_rules SET category = ?, content = ?, hierarchy = ? WHERE id = ?",
                params![rule.category, rule.content, rule.hierarchy, rule.id.0],
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "WorldRule with id {} not found",
                rule.id.0
            )));
        }
        Ok(())
    }

    fn delete_world_rule(&self, id: &WorldRuleId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM world_rules WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "WorldRule with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

impl TimelineRepository for SqliteDatabase {
    fn create_timeline_event(&self, event: &TimelineEvent) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let deps_json =
            serde_json::to_string(&event.causal_dependencies).unwrap_or_else(|_| "[]".to_string());
        conn.execute(
            "INSERT INTO timeline_events (id, project_id, book_id, date, description, causal_dependencies) VALUES (?, ?, ?, ?, ?, ?)",
            params![
                event.id.0,
                event.project_id.0,
                event.book_id.as_ref().map(|id| id.0.clone()),
                event.date,
                event.description,
                deps_json
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_timeline_event_by_id(&self, id: &TimelineEventId) -> AppResult<TimelineEvent> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let event = conn.query_row(
            "SELECT id, project_id, book_id, date, description, causal_dependencies FROM timeline_events WHERE id = ?",
            [id.0.clone()],
            |row: &Row| {
                let deps_json: String = row.get(5)?;
                let causal_dependencies: Vec<TimelineEventId> = serde_json::from_str(&deps_json).unwrap_or_default();
                Ok(TimelineEvent {
                    id: TimelineEventId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    date: row.get(3)?,
                    description: row.get(4)?,
                    causal_dependencies,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("TimelineEvent with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(event)
    }

    fn list_timeline_events_by_project(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<TimelineEvent>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, date, description, causal_dependencies FROM timeline_events WHERE project_id = ?")
            .map_err(AppError::from)?;

        let event_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                let deps_json: String = row.get(5)?;
                let causal_dependencies: Vec<TimelineEventId> =
                    serde_json::from_str(&deps_json).unwrap_or_default();
                Ok(TimelineEvent {
                    id: TimelineEventId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    date: row.get(3)?,
                    description: row.get(4)?,
                    causal_dependencies,
                })
            })
            .map_err(AppError::from)?;

        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        Ok(events)
    }

    fn list_timeline_events_by_book(&self, book_id: &BookId) -> AppResult<Vec<TimelineEvent>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, date, description, causal_dependencies FROM timeline_events WHERE book_id = ?")
            .map_err(AppError::from)?;

        let event_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                let deps_json: String = row.get(5)?;
                let causal_dependencies: Vec<TimelineEventId> =
                    serde_json::from_str(&deps_json).unwrap_or_default();
                Ok(TimelineEvent {
                    id: TimelineEventId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    date: row.get(3)?,
                    description: row.get(4)?,
                    causal_dependencies,
                })
            })
            .map_err(AppError::from)?;

        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        Ok(events)
    }

    fn list_global_timeline_events(&self, project_id: &ProjectId) -> AppResult<Vec<TimelineEvent>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, date, description, causal_dependencies FROM timeline_events WHERE project_id = ? AND book_id IS NULL")
            .map_err(AppError::from)?;

        let event_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                let deps_json: String = row.get(5)?;
                let causal_dependencies: Vec<TimelineEventId> =
                    serde_json::from_str(&deps_json).unwrap_or_default();
                Ok(TimelineEvent {
                    id: TimelineEventId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    date: row.get(3)?,
                    description: row.get(4)?,
                    causal_dependencies,
                })
            })
            .map_err(AppError::from)?;

        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        Ok(events)
    }

    fn move_timeline_event_to_book(&self, id: &TimelineEventId, book_id: &BookId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE timeline_events SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_timeline_event_to_project(&self, id: &TimelineEventId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE timeline_events SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_timeline_event(&self, event: &TimelineEvent) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let deps_json =
            serde_json::to_string(&event.causal_dependencies).unwrap_or_else(|_| "[]".to_string());
        let rows_affected = conn.execute(
            "UPDATE timeline_events SET date = ?, description = ?, causal_dependencies = ? WHERE id = ?",
            params![event.date, event.description, deps_json, event.id.0],
        ).map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "TimelineEvent with id {} not found",
                event.id.0
            )));
        }
        Ok(())
    }

    fn delete_timeline_event(&self, id: &TimelineEventId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM timeline_events WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "TimelineEvent with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

impl RelationshipRepository for SqliteDatabase {
    fn create_relationship(&self, rel: &Relationship) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO relationships (id, project_id, book_id, character_a, character_b, type) VALUES (?, ?, ?, ?, ?, ?)",
            params![
                rel.id.0,
                rel.project_id.0,
                rel.book_id.as_ref().map(|id| id.0.clone()),
                rel.character_a.0,
                rel.character_b.0,
                rel.r#type
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_relationship_by_id(&self, id: &RelationshipId) -> AppResult<Relationship> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rel = conn.query_row(
            "SELECT id, project_id, book_id, character_a, character_b, type FROM relationships WHERE id = ?",
            [id.0.clone()],
            |row: &Row| {
                Ok(Relationship {
                    id: RelationshipId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    character_a: CharacterId(row.get(3)?),
                    character_b: CharacterId(row.get(4)?),
                    r#type: row.get(5)?,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Relationship with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(rel)
    }

    fn list_relationships_by_project(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<Relationship>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, character_a, character_b, type FROM relationships WHERE project_id = ?")
            .map_err(AppError::from)?;

        let rel_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Relationship {
                    id: RelationshipId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    character_a: CharacterId(row.get(3)?),
                    character_b: CharacterId(row.get(4)?),
                    r#type: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut relationships = Vec::new();
        for rel in rel_iter {
            relationships.push(rel?);
        }
        Ok(relationships)
    }

    fn list_relationships_by_book(&self, book_id: &BookId) -> AppResult<Vec<Relationship>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, character_a, character_b, type FROM relationships WHERE book_id = ?")
            .map_err(AppError::from)?;

        let rel_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                Ok(Relationship {
                    id: RelationshipId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    character_a: CharacterId(row.get(3)?),
                    character_b: CharacterId(row.get(4)?),
                    r#type: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut relationships = Vec::new();
        for rel in rel_iter {
            relationships.push(rel?);
        }
        Ok(relationships)
    }

    fn list_global_relationships(&self, project_id: &ProjectId) -> AppResult<Vec<Relationship>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, character_a, character_b, type FROM relationships WHERE project_id = ? AND book_id IS NULL")
            .map_err(AppError::from)?;

        let rel_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Relationship {
                    id: RelationshipId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    character_a: CharacterId(row.get(3)?),
                    character_b: CharacterId(row.get(4)?),
                    r#type: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut relationships = Vec::new();
        for rel in rel_iter {
            relationships.push(rel?);
        }
        Ok(relationships)
    }

    fn move_relationship_to_book(&self, id: &RelationshipId, book_id: &BookId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE relationships SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_relationship_to_project(&self, id: &RelationshipId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE relationships SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_relationship(&self, relationship: &Relationship) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
                "UPDATE relationships SET character_a = ?, character_b = ?, type = ? WHERE id = ?",
                params![
                    relationship.character_a.0,
                    relationship.character_b.0,
                    relationship.r#type,
                    relationship.id.0
                ],
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Relationship with id {} not found",
                relationship.id.0
            )));
        }
        Ok(())
    }

    fn delete_relationship(&self, id: &RelationshipId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM relationships WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Relationship with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

impl BlacklistRepository for SqliteDatabase {
    fn create_blacklist_entry(&self, entry: &BlacklistEntry) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO blacklist_entries (id, project_id, book_id, term, category, reason) VALUES (?, ?, ?, ?, ?, ?)",
            params![
                entry.id.0,
                entry.project_id.0,
                entry.book_id.as_ref().map(|id| id.0.clone()),
                entry.term,
                entry.category,
                entry.reason
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_blacklist_entry_by_id(&self, id: &BlacklistEntryId) -> AppResult<BlacklistEntry> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let entry = conn
            .query_row(
                "SELECT id, project_id, book_id, term, category, reason FROM blacklist_entries WHERE id = ?",
                [id.0.clone()],
                |row: &Row| {
                    Ok(BlacklistEntry {
                        id: BlacklistEntryId(row.get(0)?),
                        project_id: ProjectId(row.get(1)?),
                        book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                        term: row.get(3)?,
                        category: row.get(4)?,
                        reason: row.get(5)?,
                    })
                },
            )
            .map_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    AppError::NotFound(format!("BlacklistEntry with id {} not found", id.0))
                }
                _ => AppError::from(e),
            })?;
        Ok(entry)
    }

    fn list_blacklist_entries_by_project(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<BlacklistEntry>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("SELECT id, project_id, book_id, term, category, reason FROM blacklist_entries WHERE project_id = ?")
            .map_err(AppError::from)?;

        let entry_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(BlacklistEntry {
                    id: BlacklistEntryId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    term: row.get(3)?,
                    category: row.get(4)?,
                    reason: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut entries = Vec::new();
        for entry in entry_iter {
            entries.push(entry?);
        }
        Ok(entries)
    }

    fn list_blacklist_entries_by_book(&self, book_id: &BookId) -> AppResult<Vec<BlacklistEntry>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, term, category, reason FROM blacklist_entries WHERE book_id = ?")
            .map_err(AppError::from)?;

        let entry_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                Ok(BlacklistEntry {
                    id: BlacklistEntryId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    term: row.get(3)?,
                    category: row.get(4)?,
                    reason: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut entries = Vec::new();
        for entry in entry_iter {
            entries.push(entry?);
        }
        Ok(entries)
    }

    fn list_global_blacklist_entries(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<BlacklistEntry>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, term, category, reason FROM blacklist_entries WHERE project_id = ? AND book_id IS NULL")
            .map_err(AppError::from)?;

        let entry_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(BlacklistEntry {
                    id: BlacklistEntryId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    term: row.get(3)?,
                    category: row.get(4)?,
                    reason: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut entries = Vec::new();
        for entry in entry_iter {
            entries.push(entry?);
        }
        Ok(entries)
    }

    fn move_blacklist_entry_to_book(
        &self,
        id: &BlacklistEntryId,
        book_id: &BookId,
    ) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE blacklist_entries SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_blacklist_entry_to_project(&self, id: &BlacklistEntryId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE blacklist_entries SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_blacklist_entry(&self, entry: &BlacklistEntry) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
                "UPDATE blacklist_entries SET term = ?, category = ?, reason = ? WHERE id = ?",
                params![entry.term, entry.category, entry.reason, entry.id.0],
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "BlacklistEntry with id {} not found",
                entry.id.0
            )));
        }
        Ok(())
    }

    fn delete_blacklist_entry(&self, id: &BlacklistEntryId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM blacklist_entries WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "BlacklistEntry with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

impl SearchPort for SqliteDatabase {
    fn search(
        &self,
        project_id: &ProjectId,
        query: &str,
        book_id: Option<BookId>,
        types: Option<Vec<EntityType>>,
    ) -> AppResult<Vec<SearchResult>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;

        let mut sql =
            "SELECT entity_id, type, title || ': ' || content, bm25(lore_search) as score 
                       FROM lore_search 
                       WHERE project_id = ? AND lore_search MATCH ?"
                .to_string();

        if let Some(ref bid) = book_id {
            sql.push_str(" AND book_id = ?");
        } else {
            sql.push_str(" AND book_id IS NULL");
        }

        if let Some(ref t) = types {
            if !t.is_empty() {
                let type_placeholders: Vec<String> = t.iter().map(|_| "?".to_string()).collect();
                sql.push_str(&format!(" AND type IN ({})", type_placeholders.join(",")));
            }
        }

        sql.push_str(" ORDER BY score DESC");

        let mut stmt = conn.prepare(&sql).map_err(AppError::from)?;

        let mut params: Vec<Box<dyn rusqlite::ToSql>> =
            vec![Box::new(project_id.0.clone()), Box::new(query.to_string())];

        if let Some(ref bid) = book_id {
            params.push(Box::new(bid.0.clone()));
        }

        if let Some(t) = types {
            for entity_type in t {
                let type_str = match entity_type {
                    EntityType::Character => "character",
                    EntityType::Location => "location",
                    EntityType::WorldRule => "world_rule",
                    EntityType::TimelineEvent => "timeline_event",
                };
                params.push(Box::new(type_str.to_string()));
            }
        }

        // Convert Vec<Box<dyn ToSql>> to slice of &dyn ToSql
        let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

        let results_iter = stmt
            .query_map(rusqlite::params_from_iter(params_refs), |row: &Row| {
                let type_str: String = row.get(1)?;
                let entity_type = match type_str.as_str() {
                    "character" => EntityType::Character,
                    "location" => EntityType::Location,
                    "world_rule" => EntityType::WorldRule,
                    "timeline_event" => EntityType::TimelineEvent,
                    _ => EntityType::WorldRule, // Fallback
                };

                Ok(SearchResult {
                    entity_id: row.get(0)?,
                    entity_type,
                    snippet: row.get(2)?,
                    score: row.get(3)?,
                })
            })
            .map_err(AppError::from)?;

        let mut results = Vec::new();
        for res in results_iter {
            results.push(res?);
        }
        Ok(results)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_sqlite_connection_creation() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");

        assert!(db_path.exists());
        let db_port: &dyn DatabasePort = &db;
        assert!(db_port.is_healthy());
    }

    #[test]
    fn test_migrations_execution() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_migrations.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let db_port: &dyn DatabasePort = &db;
        assert!(db_port.get_version() >= 4);
    }

    #[test]
    fn test_characters_table_exists() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_chars.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let conn = db.connection.lock().expect("Failed to lock connection");
        let table_exists: bool = conn
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='characters'",
                [],
                |row: &Row| row.get(0),
            )
            .map(|count: i32| count > 0)
            .expect("Failed to query sqlite_master");

        assert!(
            table_exists,
            "Characters table should exist after migration"
        );
    }

    #[test]
    fn test_all_codex_tables_exist() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_all_tables.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let conn = db.connection.lock().expect("Failed to lock connection");
        let tables = vec![
            "projects",
            "characters",
            "locations",
            "world_rules",
            "timeline_events",
            "relationships",
            "blacklist_entries",
            "lore_search",
        ];

        for table in tables {
            let table_exists: bool = conn
                .query_row(
                    &format!("SELECT count(*) FROM sqlite_master WHERE name='{}'", table),
                    [],
                    |row: &Row| row.get(0),
                )
                .map(|count: i32| count > 0)
                .expect(&format!(
                    "Failed to query sqlite_master for table {}",
                    table
                ));

            assert!(table_exists, "Table {} should exist after migration", table);
        }
    }

    #[test]
    fn test_wal_mode_enabled() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_wal.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        let conn = db.connection.lock().expect("Failed to lock connection");
        let journal_mode: String = conn
            .query_row("PRAGMA journal_mode", [], |row: &Row| row.get(0))
            .expect("Failed to get journal mode");
        assert_eq!(journal_mode.to_uppercase(), "WAL");
    }

    #[test]
    fn test_character_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_crud.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-1".to_string());

        // Setup: Create project first due to FK constraint
        {
            let conn = db.connection.lock().unwrap();
            conn.execute(
                "INSERT INTO projects (id, name) VALUES (?, ?)",
                [&project_id.0, "Project 1"],
            )
            .unwrap();
        }

        let mut character =
            Character::new(project_id.clone(), None, "John Doe".to_string()).unwrap();
        character.age = 30;
        character.occupation = "Writer".to_string();

        let repo: &dyn CharacterRepository = &db;

        // Create
        repo.create_character(&character)
            .expect("Failed to create character");

        // Get
        let fetched = repo
            .get_character_by_id(&character.id)
            .expect("Failed to fetch character");
        assert_eq!(fetched.name, "John Doe");
        assert_eq!(fetched.age, 30);

        // List
        let list = repo
            .list_characters_by_project(&project_id)
            .expect("Failed to list characters");
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].id, character.id);

        // Update
        character.name = "Jane Doe".to_string();
        repo.update_character(&character)
            .expect("Failed to update character");
        let updated = repo
            .get_character_by_id(&character.id)
            .expect("Failed to fetch updated character");
        assert_eq!(updated.name, "Jane Doe");

        // Delete
        repo.delete_character(&character.id)
            .expect("Failed to delete character");
        let result = repo.get_character_by_id(&character.id);
        assert!(result.is_err(), "Character should be deleted");
    }

    #[test]
    fn test_project_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_project_crud.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project =
            Project::new("My New Project".to_string(), "Description".to_string()).unwrap();
        let repo: &dyn crate::domain::ports::ProjectRepository = &db;

        // Create
        repo.create_project(&project)
            .expect("Failed to create project");

        // Get
        let fetched = repo
            .get_project_by_id(&project.id)
            .expect("Failed to fetch project");
        assert_eq!(fetched.name, "My New Project");

        // List
        let list = repo.list_all_projects().expect("Failed to list projects");
        assert!(list.iter().any(|p| p.id == project.id));

        // Update
        let mut updated_project = project.clone();
        updated_project.name = "Updated Project Name".to_string();
        repo.update_project(&updated_project)
            .expect("Failed to update project");
        let fetched_updated = repo
            .get_project_by_id(&project.id)
            .expect("Failed to fetch updated project");
        assert_eq!(fetched_updated.name, "Updated Project Name");

        // Delete
        repo.delete_project(&project.id)
            .expect("Failed to delete project");
        let result = repo.get_project_by_id(&project.id);
        assert!(result.is_err(), "Project should be deleted");
    }

    #[test]
    fn test_location_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_location_crud.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-1".to_string());
        {
            let conn = db.connection.lock().unwrap();
            conn.execute(
                "INSERT INTO projects (id, name) VALUES (?, ?)",
                [&project_id.0, "Project 1"],
            )
            .unwrap();
        }

        let location =
            Location::new(project_id.clone(), None, "The Dark Forest".to_string()).unwrap();
        let repo: &dyn crate::domain::ports::LocationRepository = &db;

        // Create
        repo.create_location(&location)
            .expect("Failed to create location");

        // Get
        let fetched = repo
            .get_location_by_id(&location.id)
            .expect("Failed to fetch location");
        assert_eq!(fetched.name, "The Dark Forest");

        // List
        let list = repo
            .list_locations_by_project(&project_id)
            .expect("Failed to list locations");
        assert_eq!(list.len(), 1);

        // Delete
        repo.delete_location(&location.id)
            .expect("Failed to delete location");
        let result = repo.get_location_by_id(&location.id);
        assert!(result.is_err());
    }

    #[test]
    fn test_world_rule_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_rule_crud.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-1".to_string());
        {
            let conn = db.connection.lock().unwrap();
            conn.execute(
                "INSERT INTO projects (id, name) VALUES (?, ?)",
                [&project_id.0, "Project 1"],
            )
            .unwrap();
        }

        let rule = WorldRule::new(
            project_id.clone(),
            None,
            "Magic".to_string(),
            "Costs life energy".to_string(),
        )
        .unwrap();
        let repo: &dyn crate::domain::ports::WorldRuleRepository = &db;

        // Create
        repo.create_world_rule(&rule)
            .expect("Failed to create rule");

        // Get
        let fetched = repo
            .get_world_rule_by_id(&rule.id)
            .expect("Failed to fetch rule");
        assert_eq!(fetched.category, "Magic");

        // List
        let list = repo
            .list_world_rules_by_project(&project_id)
            .expect("Failed to list rules");
        assert_eq!(list.len(), 1);

        // Delete
        repo.delete_world_rule(&rule.id)
            .expect("Failed to delete rule");
        let result = repo.get_world_rule_by_id(&rule.id);
        assert!(result.is_err());
    }

    #[test]
    fn test_timeline_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_timeline_crud.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-1".to_string());
        {
            let conn = db.connection.lock().unwrap();
            conn.execute(
                "INSERT INTO projects (id, name) VALUES (?, ?)",
                [&project_id.0, "Project 1"],
            )
            .unwrap();
        }

        let event =
            TimelineEvent::new(project_id.clone(), None, "The War Started".to_string()).unwrap();
        let repo: &dyn crate::domain::ports::TimelineRepository = &db;

        // Create
        repo.create_timeline_event(&event)
            .expect("Failed to create event");

        // Get
        let fetched = repo
            .get_timeline_event_by_id(&event.id)
            .expect("Failed to fetch event");
        assert_eq!(fetched.description, "The War Started");

        // List
        let list = repo
            .list_timeline_events_by_project(&project_id)
            .expect("Failed to list events");
        assert_eq!(list.len(), 1);

        // Delete
        repo.delete_timeline_event(&event.id)
            .expect("Failed to delete event");
        let result = repo.get_timeline_event_by_id(&event.id);
        assert!(result.is_err());
    }

    #[test]
    fn test_relationship_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_relationship_crud.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-1".to_string());
        let char_a = CharacterId("char-a".to_string());
        let char_b = CharacterId("char-b".to_string());

        {
            let conn = db.connection.lock().unwrap();
            conn.execute(
                "INSERT INTO projects (id, name) VALUES (?, ?)",
                [&project_id.0, "Project 1"],
            )
            .unwrap();
            conn.execute(
                "INSERT INTO characters (id, project_id, name) VALUES (?, ?, ?)",
                [&char_a.0, &project_id.0, "Alice"],
            )
            .unwrap();
            conn.execute(
                "INSERT INTO characters (id, project_id, name) VALUES (?, ?, ?)",
                [&char_b.0, &project_id.0, "Bob"],
            )
            .unwrap();
        }

        let rel = Relationship::new(
            project_id.clone(),
            None,
            char_a.clone(),
            char_b.clone(),
            "Siblings".to_string(),
        )
        .unwrap();
        let repo: &dyn crate::domain::ports::RelationshipRepository = &db;

        // Create
        repo.create_relationship(&rel)
            .expect("Failed to create relationship");

        // Get
        let fetched = repo
            .get_relationship_by_id(&rel.id)
            .expect("Failed to fetch relationship");
        assert_eq!(fetched.r#type, "Siblings");

        // List
        let list = repo
            .list_relationships_by_project(&project_id)
            .expect("Failed to list relationships");
        assert_eq!(list.len(), 1);

        // Delete
        repo.delete_relationship(&rel.id)
            .expect("Failed to delete relationship");
        let result = repo.get_relationship_by_id(&rel.id);
        assert!(result.is_err());
    }

    #[test]
    fn test_blacklist_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_blacklist_crud.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-1".to_string());
        {
            let conn = db.connection.lock().unwrap();
            conn.execute(
                "INSERT INTO projects (id, name) VALUES (?, ?)",
                [&project_id.0, "Project 1"],
            )
            .unwrap();
        }

        let entry = BlacklistEntry::new(project_id.clone(), None, "cliché".to_string()).unwrap();
        let repo: &dyn crate::domain::ports::BlacklistRepository = &db;

        // Create
        repo.create_blacklist_entry(&entry)
            .expect("Failed to create entry");

        // Get
        let fetched = repo
            .get_blacklist_entry_by_id(&entry.id)
            .expect("Failed to fetch entry");
        assert_eq!(fetched.term, "cliché");

        // List
        let list = repo
            .list_blacklist_entries_by_project(&project_id)
            .expect("Failed to list entries");
        assert_eq!(list.len(), 1);

        // Delete
        repo.delete_blacklist_entry(&entry.id)
            .expect("Failed to delete entry");
        let result = repo.get_blacklist_entry_by_id(&entry.id);
        assert!(result.is_err());
    }

    #[test]
    fn test_search_port_ranked() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_search.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-1".to_string());
        {
            let conn = db.connection.lock().unwrap();
            conn.execute(
                "INSERT INTO projects (id, name) VALUES (?, ?)",
                [&project_id.0, "Project 1"],
            )
            .unwrap();
            conn.execute(
                "INSERT INTO characters (id, project_id, name, occupation) VALUES (?, ?, ?, ?)",
                [
                    "char-1",
                    &project_id.0,
                    "Conan the Barbarian",
                    "Warrior from Cimmeria",
                ],
            )
            .unwrap();
            conn.execute(
                "INSERT INTO world_rules (id, project_id, category, content) VALUES (?, ?, ?, ?)",
                [
                    "rule-1",
                    &project_id.0,
                    "Magic",
                    "Magic is dangerous and rare",
                ],
            )
            .unwrap();
        }

        let repo: &dyn crate::domain::ports::SearchPort = &db;

        // Search for \"Barbarian\" - should find Conan
        let results = repo
            .search(&project_id, "Barbarian", None, None)
            .expect("Search failed");
        assert!(!results.is_empty(), "Should find at least one result");
        assert_eq!(results[0].entity_id, "char-1");
        assert!(results[0].snippet.contains("Conan"));

        // Search for \"Magic\" - should find the rule
        let results = repo
            .search(
                &project_id,
                "Magic",
                None,
                Some(vec![EntityType::WorldRule]),
            )
            .expect("Search failed");
        assert!(!results.is_empty());
        assert_eq!(results[0].entity_id, "rule-1");
    }

    #[test]
    fn test_sqlite_vec_loaded() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_vec_load.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        let conn = db.connection.lock().expect("Failed to lock connection");

        let version: String = conn
            .query_row("SELECT vec_version()", [], |row: &Row| row.get(0))
            .expect("sqlite-vec not loaded");
        assert!(!version.is_empty());
    }

    #[test]
    fn test_vector_table_creation_succeeds() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_vec_success.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        let conn = db.connection.lock().expect("Failed to lock connection");

        let result = conn.execute(
            "CREATE VIRTUAL TABLE test_vec USING vec0(embedding float[3])",
            [],
        );
        assert!(
            result.is_ok(),
            "Vector table creation failed: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_vector_search_cosine() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_vector_search.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-1".to_string());
        {
            let conn = db.connection.lock().unwrap();
            conn.execute(
                "INSERT INTO projects (id, name) VALUES (?, ?)",
                [&project_id.0, "Project 1"],
            )
            .unwrap();
            conn.execute(
                "INSERT INTO characters (id, project_id, name, occupation) VALUES (?, ?, ?, ?)",
                ["char-1", &project_id.0, "Hero", "Warrior"],
            )
            .unwrap();

            // Insert vectors (must be 1536 dimensions)
            let mut v1 = vec![0.0f32; 1536];
            v1[0] = 1.0;

            let mut v2 = vec![0.0f32; 1536];
            v2[1] = 1.0;

            // vec0 expects bytes. For float[1536], it should be 1536 * 4 = 6144 bytes.
            let v1_bytes = zerocopy::AsBytes::as_bytes(v1.as_slice());

            conn.execute(
                "INSERT INTO lore_vectors(entity_id, embedding) VALUES (?, ?)",
                params!["char-1", v1_bytes],
            )
            .unwrap();
        }

        let repo: &dyn crate::domain::ports::VectorSearchPort = &db;

        // Search with vector similar to v1
        let mut query_vec = vec![0.0f32; 1536];
        query_vec[0] = 0.9;
        query_vec[1] = 0.1;

        let results = repo
            .find_similar(&project_id, query_vec, 1, None, None)
            .expect("Vector search failed");

        assert!(!results.is_empty(), "Results should not be empty");
        assert_eq!(results[0].entity_id, "char-1");
    }

    #[test]
    fn test_scope_filtering_and_movement() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_scope.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-1".to_string());
        let book_id = BookId("book-1".to_string());

        // Setup Project and Book
        {
            let conn = db.connection.lock().unwrap();
            conn.execute(
                "INSERT INTO projects (id, name) VALUES (?, ?)",
                [&project_id.0, "Project 1"],
            )
            .unwrap();
            conn.execute(
                "INSERT INTO books (id, project_id, title) VALUES (?, ?, ?)",
                [&book_id.0, &project_id.0, "Book 1"],
            )
            .unwrap();
        }

        let repo_char: &dyn CharacterRepository = &db;
        let repo_loc: &dyn crate::domain::ports::LocationRepository = &db;
        let repo_wr: &dyn crate::domain::ports::WorldRuleRepository = &db;
        let repo_te: &dyn crate::domain::ports::TimelineRepository = &db;
        let repo_rel: &dyn crate::domain::ports::RelationshipRepository = &db;
        let repo_bl: &dyn crate::domain::ports::BlacklistRepository = &db;

        // Create Global and Scoped entities
        let char_global = Character::new(project_id.clone(), None, "Global Char".to_string()).unwrap();
        repo_char.create_character(&char_global).unwrap();

        let loc_scoped = Location::new(project_id.clone(), Some(book_id.clone()), "Scoped Loc".to_string()).unwrap();
        repo_loc.create_location(&loc_scoped).unwrap();

        let wr_global = WorldRule::new(project_id.clone(), None, "Magic".to_string(), "Rules".to_string()).unwrap();
        repo_wr.create_world_rule(&wr_global).unwrap();

        let te_scoped = TimelineEvent::new(project_id.clone(), Some(book_id.clone()), "Event".to_string()).unwrap();
        repo_te.create_timeline_event(&te_scoped).unwrap();

        // Create characters for relationship to satisfy foreign key constraints
        let char_a = Character::new(project_id.clone(), None, "Char A".to_string()).unwrap();
        let char_b = Character::new(project_id.clone(), None, "Char B".to_string()).unwrap();
        repo_char.create_character(&char_a).unwrap();
        repo_char.create_character(&char_b).unwrap();

        let rel_global = Relationship::new(project_id.clone(), None, char_a.id.clone(), char_b.id.clone(), "Friends".to_string()).unwrap();
        repo_rel.create_relationship(&rel_global).unwrap();

        let bl_scoped = BlacklistEntry::new(project_id.clone(), Some(book_id.clone()), "Word".to_string()).unwrap();
        repo_bl.create_blacklist_entry(&bl_scoped).unwrap();

        // Check global/scoped lists
        assert_eq!(repo_char.list_global_characters(&project_id).unwrap().len(), 1);
        assert_eq!(repo_loc.list_locations_by_book(&book_id).unwrap().len(), 1);
        assert_eq!(repo_wr.list_global_world_rules(&project_id).unwrap().len(), 1);
        assert_eq!(repo_te.list_timeline_events_by_book(&book_id).unwrap().len(), 1);
        assert_eq!(repo_rel.list_global_relationships(&project_id).unwrap().len(), 1);
        assert_eq!(repo_bl.list_blacklist_entries_by_book(&book_id).unwrap().len(), 1);

        // Move Character to Book
        repo_char.move_character_to_book(&char_global.id, &book_id).unwrap();
        assert_eq!(repo_char.list_global_characters(&project_id).unwrap().len(), 0);
        assert_eq!(repo_char.list_characters_by_book(&book_id).unwrap().len(), 1);

        // Move Location to Global
        repo_loc.move_location_to_project(&loc_scoped.id).unwrap();
        assert_eq!(repo_loc.list_locations_by_book(&book_id).unwrap().len(), 0);
        assert_eq!(repo_loc.list_global_locations(&project_id).unwrap().len(), 1);

        // Move WorldRule to Book
        repo_wr.move_world_rule_to_book(&wr_global.id, &book_id).unwrap();
        assert_eq!(repo_wr.list_global_world_rules(&project_id).unwrap().len(), 0);

        // Move Timeline to Global
        repo_te.move_timeline_event_to_project(&te_scoped.id).unwrap();
        assert_eq!(repo_te.list_timeline_events_by_book(&book_id).unwrap().len(), 0);

        // Move Relationship to Book
        repo_rel.move_relationship_to_book(&rel_global.id, &book_id).unwrap();
        assert_eq!(repo_rel.list_global_relationships(&project_id).unwrap().len(), 0);

        // Move Blacklist to Global
        repo_bl.move_blacklist_entry_to_project(&bl_scoped.id).unwrap();
        assert_eq!(repo_bl.list_blacklist_entries_by_book(&book_id).unwrap().len(), 0);
    }
}
