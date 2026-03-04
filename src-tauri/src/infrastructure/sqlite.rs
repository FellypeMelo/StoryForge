use crate::domain::ports::{
    DatabasePort, EmbeddingPort,
    VectorSearchPort, SearchResult, EntityType
};
use crate::domain::result::AppResult;
use crate::domain::error::AppError;
pub use crate::domain::value_objects::{
    BookId, ProjectId,
};
use rusqlite::{Connection, Result, Row};
use std::path::Path;
use std::sync::{Mutex, Once};

pub struct MockEmbeddingPort;

impl EmbeddingPort for MockEmbeddingPort {
    fn generate_embedding(&self, text: &str) -> AppResult<Vec<f32>> {
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

pub struct SqliteDatabase {
    pub connection: Mutex<Connection>,
    pub embedding_port: Box<dyn EmbeddingPort + Send + Sync>,
}

impl SqliteDatabase {
    pub fn new(path: &Path) -> Result<Self> {
        SQLITE_VEC_INIT.call_once(|| unsafe {
            rusqlite::ffi::sqlite3_auto_extension(Some(std::mem::transmute(
                sqlite_vec::sqlite3_vec_init as *const (),
            )));
        });

        let connection = Connection::open(path)?;
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
                 CREATE VIRTUAL TABLE IF NOT EXISTS lore_search USING fts5(
                    entity_id UNINDEXED,
                    project_id UNINDEXED,
                    type UNINDEXED,
                    title,
                    content
                 );
                 
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

                 DROP TABLE IF EXISTS lore_search;
                 CREATE VIRTUAL TABLE lore_search USING fts5(
                    entity_id UNINDEXED,
                    project_id UNINDEXED,
                    book_id UNINDEXED,
                    type UNINDEXED,
                    title,
                    content
                 );

                 INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                 SELECT id, project_id, book_id, 'character', name, occupation || ' ' || physical_description FROM characters;

                 INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                 SELECT id, project_id, book_id, 'location', name, description FROM locations;

                 INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                 SELECT id, project_id, book_id, 'world_rule', category, content FROM world_rules;

                 INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content)
                 SELECT id, project_id, book_id, 'timeline_event', date, description FROM timeline_events;

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

        let current_version: i32 =
            conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
        if current_version < 8 {
            conn.execute_batch(
                "BEGIN;
                 ALTER TABLE characters ADD COLUMN hauge_wound TEXT DEFAULT '';
                 ALTER TABLE characters ADD COLUMN hauge_belief TEXT DEFAULT '';
                 ALTER TABLE characters ADD COLUMN hauge_fear TEXT DEFAULT '';
                 ALTER TABLE characters ADD COLUMN hauge_identity TEXT DEFAULT '';
                 ALTER TABLE characters ADD COLUMN hauge_essence TEXT DEFAULT '';
                 ALTER TABLE characters ADD COLUMN voice_sentence_length TEXT DEFAULT '';
                 ALTER TABLE characters ADD COLUMN voice_formality TEXT DEFAULT '';
                 ALTER TABLE characters ADD COLUMN voice_verbal_tics TEXT DEFAULT '[]';
                 ALTER TABLE characters ADD COLUMN voice_evasion_mechanism TEXT DEFAULT '';
                 ALTER TABLE characters ADD COLUMN physical_tells TEXT DEFAULT '[]';
                 PRAGMA user_version = 8;
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

        if book_id.is_some() {
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
}
