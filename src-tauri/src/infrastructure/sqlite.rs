use crate::domain::error::AppError;
use crate::domain::ports::{
    DatabasePort, EmbeddingPort, EntityType, SearchResult, VectorSearchPort,
};
use crate::domain::result::AppResult;
pub use crate::domain::value_objects::{BookId, ProjectId};
use rusqlite::{params, Connection, Result, Row};
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
            rusqlite::ffi::sqlite3_auto_extension(Some(std::mem::transmute::<
                *const (),
                unsafe extern "C" fn(
                    *mut rusqlite::ffi::sqlite3,
                    *mut *const i8,
                    *const rusqlite::ffi::sqlite3_api_routines,
                ) -> i32,
            >(
                sqlite_vec::sqlite3_vec_init as *const (),
            )));
        });

        let connection = Connection::open(path)?;
        connection.pragma_update(None, "journal_mode", "WAL")?;

        Ok(SqliteDatabase {
            connection: Mutex::new(connection),
            embedding_port: Box::new(MockEmbeddingPort),
        })
    }

    pub fn run_migrations(&self) -> Result<()> {
        let conn = self.connection.lock().map_err(|e| {
            rusqlite::Error::ToSqlConversionFailure(Box::new(std::io::Error::other(e.to_string())))
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

        let current_version: i32 =
            conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
        if current_version < 9 {
            conn.execute_batch(
                "BEGIN;
                 CREATE TABLE IF NOT EXISTS vector_meta (
                    id INTEGER PRIMARY KEY CHECK(id = 1),
                    dim INTEGER NOT NULL
                 );
                 INSERT OR IGNORE INTO vector_meta (id, dim) VALUES (1, 1536);
                 PRAGMA user_version = 9;
                 COMMIT;",
            )?;
        }

        Ok(())
    }
}

impl SqliteDatabase {
    /// Re-embeds every `lore_search` row in scope (project, optionally book) and
    /// refreshes `lore_vectors`. Explicit and idempotent — never called from a
    /// create/update path, keeping the app offline-first by default.
    ///
    /// Scope mirrors `VectorSearchPort::find_similar` exactly: `book_id = Some`
    /// matches that book, `book_id = None` matches only global (book_id IS NULL)
    /// rows, so anything reindexed here is guaranteed to be findable later.
    pub fn reindex_lore_vectors(
        &self,
        project_id: &ProjectId,
        book_id: Option<&BookId>,
    ) -> AppResult<usize> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;

        let mut sql =
            "SELECT entity_id, title, content FROM lore_search WHERE project_id = ?".to_string();
        if book_id.is_some() {
            sql.push_str(" AND book_id = ?");
        } else {
            sql.push_str(" AND book_id IS NULL");
        }

        let rows: Vec<(String, String, String)> = {
            let mut stmt = conn.prepare(&sql).map_err(AppError::from)?;

            let mut query_params: Vec<Box<dyn rusqlite::ToSql>> =
                vec![Box::new(project_id.0.clone())];
            if let Some(bid) = book_id {
                query_params.push(Box::new(bid.0.clone()));
            }
            let params_refs: Vec<&dyn rusqlite::ToSql> =
                query_params.iter().map(|b| b.as_ref()).collect();

            let row_iter = stmt
                .query_map(rusqlite::params_from_iter(params_refs), |row: &Row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, String>(1)?,
                        row.get::<_, String>(2)?,
                    ))
                })
                .map_err(AppError::from)?;

            let mut collected = Vec::new();
            for row in row_iter {
                collected.push(row.map_err(AppError::from)?);
            }
            collected
        };

        let mut indexed = 0usize;
        for (entity_id, title, content) in rows {
            let text = format!("{} {}", title, content);
            let embedding = self.embedding_port.generate_embedding(&text)?;
            let bytes = zerocopy::AsBytes::as_bytes(embedding.as_slice()).to_vec();

            // vec0's entity_id is a PRIMARY KEY: delete-then-insert keeps this
            // idempotent (plain re-INSERT would error on the second run).
            conn.execute(
                "DELETE FROM lore_vectors WHERE entity_id = ?",
                params![entity_id],
            )
            .map_err(AppError::from)?;
            conn.execute(
                "INSERT INTO lore_vectors (entity_id, embedding) VALUES (?, ?)",
                params![entity_id, bytes],
            )
            .map_err(AppError::from)?;
            indexed += 1;
        }

        Ok(indexed)
    }

    /// Embeds `query` and delegates to `VectorSearchPort::find_similar` for the
    /// actual vec0 ANN lookup.
    pub fn semantic_search_lore(
        &self,
        project_id: &ProjectId,
        book_id: Option<BookId>,
        query: &str,
        top_k: usize,
    ) -> AppResult<Vec<SearchResult>> {
        let embedding = self.embedding_port.generate_embedding(query)?;
        self.find_similar(project_id, embedding, top_k, book_id, None)
    }

    /// Ensures `lore_vectors` matches `dim`. Vectors are a reindexable cache,
    /// so on a dimension change the table is simply dropped and recreated —
    /// callers are expected to re-store embeddings for that new dimension.
    /// Caller must already hold `conn` (avoids re-locking `self.connection`).
    fn ensure_vector_dim(&self, conn: &Connection, dim: usize) -> AppResult<()> {
        if dim == 0 {
            return Err(AppError::Validation(
                "embedding dimension must be greater than zero".to_string(),
            ));
        }

        let stored_dim: i64 = conn
            .query_row(
                "SELECT dim FROM vector_meta WHERE id = 1",
                [],
                |row: &Row| row.get(0),
            )
            .map_err(AppError::from)?;

        if stored_dim as usize == dim {
            return Ok(());
        }

        // vec0 column types can't be bound as query parameters; `dim` is a
        // validated Rust `usize` (not user-supplied text), so this is safe.
        let recreate_sql = format!(
            "DROP TABLE IF EXISTS lore_vectors;
             CREATE VIRTUAL TABLE lore_vectors USING vec0(entity_id TEXT PRIMARY KEY, embedding float[{}]);",
            dim
        );
        conn.execute_batch(&recreate_sql).map_err(AppError::from)?;
        conn.execute(
            "UPDATE vector_meta SET dim = ? WHERE id = 1",
            params![dim as i64],
        )
        .map_err(AppError::from)?;

        Ok(())
    }

    /// Stores frontend-computed embeddings (entity_id, embedding) into
    /// `lore_vectors`, recreating the table if the batch's dimension differs
    /// from the stored one. Idempotent: re-storing the same entity_id
    /// replaces its row rather than erroring on the vec0 PRIMARY KEY.
    pub fn store_lore_vectors(&self, rows: Vec<(String, Vec<f32>)>) -> AppResult<usize> {
        if rows.is_empty() {
            return Ok(0);
        }

        let dim = rows[0].1.len();
        for (entity_id, embedding) in &rows {
            if embedding.len() != dim {
                return Err(AppError::Validation(format!(
                    "embedding for entity_id '{}' has dimension {} but expected {} (batch must share one dimension)",
                    entity_id,
                    embedding.len(),
                    dim
                )));
            }
        }

        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        self.ensure_vector_dim(&conn, dim)?;

        for (entity_id, embedding) in &rows {
            let bytes = zerocopy::AsBytes::as_bytes(embedding.as_slice()).to_vec();
            conn.execute(
                "DELETE FROM lore_vectors WHERE entity_id = ?",
                params![entity_id],
            )
            .map_err(AppError::from)?;
            conn.execute(
                "INSERT INTO lore_vectors (entity_id, embedding) VALUES (?, ?)",
                params![entity_id, bytes],
            )
            .map_err(AppError::from)?;
        }

        Ok(rows.len())
    }

    /// Lists `(entity_id, title + ' ' + content)` rows in scope for the
    /// frontend to embed itself. Scope mirrors `VectorSearchPort::find_similar`
    /// exactly: `book_id = Some` matches that book, `book_id = None` matches
    /// only global (book_id IS NULL) rows.
    pub fn list_lore_index_rows(
        &self,
        project_id: &ProjectId,
        book_id: Option<&BookId>,
    ) -> AppResult<Vec<(String, String)>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;

        let mut sql =
            "SELECT entity_id, (title || ' ' || content) FROM lore_search WHERE project_id = ?"
                .to_string();
        if book_id.is_some() {
            sql.push_str(" AND book_id = ?");
        } else {
            sql.push_str(" AND book_id IS NULL");
        }

        let mut stmt = conn.prepare(&sql).map_err(AppError::from)?;

        let mut query_params: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(project_id.0.clone())];
        if let Some(bid) = book_id {
            query_params.push(Box::new(bid.0.clone()));
        }
        let params_refs: Vec<&dyn rusqlite::ToSql> =
            query_params.iter().map(|b| b.as_ref()).collect();

        let row_iter = stmt
            .query_map(rusqlite::params_from_iter(params_refs), |row: &Row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })
            .map_err(AppError::from)?;

        let mut results = Vec::new();
        for row in row_iter {
            results.push(row.map_err(AppError::from)?);
        }
        Ok(results)
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
    use crate::features::lore::domain::{Location, LocationRepository};
    use crate::features::projects::domain::{Project, ProjectRepository};
    use tempfile::tempdir;

    fn seed_lore_search_row(db: &SqliteDatabase, entity_id: &str, project_id: &str) {
        let conn = db.connection.lock().expect("Failed to lock connection");
        conn.execute(
            "INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content) VALUES (?, ?, NULL, 'character', ?, ?)",
            params![entity_id, project_id, "Nara", "a brave hunter"],
        )
        .expect("Failed to seed lore_search");
    }

    fn count_lore_vectors(db: &SqliteDatabase) -> i64 {
        let conn = db.connection.lock().expect("Failed to lock connection");
        conn.query_row("SELECT COUNT(*) FROM lore_vectors", [], |row| row.get(0))
            .expect("Failed to count lore_vectors")
    }

    fn vector_meta_dim(db: &SqliteDatabase) -> i64 {
        let conn = db.connection.lock().expect("Failed to lock connection");
        conn.query_row("SELECT dim FROM vector_meta WHERE id = 1", [], |row| {
            row.get(0)
        })
        .expect("Failed to read vector_meta dim")
    }

    #[test]
    fn test_reindex_lore_vectors_populates_table() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_reindex.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-reindex".to_string());
        seed_lore_search_row(&db, "char-1", &project_id.0);

        let indexed = db
            .reindex_lore_vectors(&project_id, None)
            .expect("reindex should succeed");

        assert_eq!(indexed, 1);
        assert_eq!(count_lore_vectors(&db), 1);
    }

    #[test]
    fn test_reindex_lore_vectors_is_idempotent() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_reindex_idempotent.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-idempotent".to_string());
        seed_lore_search_row(&db, "char-1", &project_id.0);

        let first = db
            .reindex_lore_vectors(&project_id, None)
            .expect("first reindex should succeed");
        let second = db
            .reindex_lore_vectors(&project_id, None)
            .expect("second reindex should succeed without duplicate key error");

        assert_eq!(first, 1);
        assert_eq!(second, 1);
        assert_eq!(count_lore_vectors(&db), 1);
    }

    #[test]
    fn test_semantic_search_lore_returns_indexed_entity() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_semantic_search.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-semantic".to_string());
        seed_lore_search_row(&db, "char-1", &project_id.0);
        db.reindex_lore_vectors(&project_id, None)
            .expect("reindex should succeed");

        let results = db
            .semantic_search_lore(&project_id, None, "Nara a brave hunter", 5)
            .expect("semantic search should succeed");

        assert!(!results.is_empty());
        assert_eq!(results[0].entity_id, "char-1");
    }

    #[test]
    fn test_creating_location_does_not_populate_lore_vectors() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_offline_first.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_repo: &dyn ProjectRepository = &db;
        let project = Project::new("Offline Guard".to_string(), "".to_string())
            .expect("Failed to build project");
        project_repo
            .create_project(&project)
            .expect("Failed to create project");

        let location_repo: &dyn LocationRepository = &db;
        let location = Location::new(project.id.clone(), None, "Vale do Eco".to_string())
            .expect("Failed to build location");
        location_repo
            .create_location(&location)
            .expect("Failed to create location");

        assert_eq!(count_lore_vectors(&db), 0);
    }

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

    #[test]
    fn test_vector_meta_seeded_with_default_dimension_after_migrations() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_vector_meta_seed.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        assert_eq!(vector_meta_dim(&db), 1536);
    }

    #[test]
    fn test_store_lore_vectors_recreates_table_for_new_dimension_and_is_searchable() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_store_vectors_768.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-store-vec".to_string());
        seed_lore_search_row(&db, "char-1", &project_id.0);

        let embedding = vec![0.5f32; 768];
        let stored = db
            .store_lore_vectors(vec![("char-1".to_string(), embedding.clone())])
            .expect("store_lore_vectors should succeed");
        assert_eq!(stored, 1);
        assert_eq!(vector_meta_dim(&db), 768);

        let results = db
            .find_similar(&project_id, embedding, 5, None, None)
            .expect("find_similar should succeed");

        assert_eq!(results.len(), 1);
        assert_eq!(results[0].entity_id, "char-1");
        assert!(results[0].score.abs() < 1e-6);
    }

    #[test]
    fn test_store_lore_vectors_changing_dimension_recreates_table_and_drops_old_vectors() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_store_vectors_dim_change.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-dim-change".to_string());
        seed_lore_search_row(&db, "char-1", &project_id.0);

        assert_eq!(vector_meta_dim(&db), 1536);

        db.store_lore_vectors(vec![("char-1".to_string(), vec![0.1f32; 768])])
            .expect("first store should succeed");
        assert_eq!(vector_meta_dim(&db), 768);
        assert_eq!(count_lore_vectors(&db), 1);

        seed_lore_search_row(&db, "char-2", &project_id.0);
        db.store_lore_vectors(vec![("char-2".to_string(), vec![0.2f32; 384])])
            .expect("second store with different dim should succeed");

        assert_eq!(vector_meta_dim(&db), 384);
        // Recreating lore_vectors for the new dimension drops the previously
        // stored vectors (it is a reindexable cache) -- only char-2 remains.
        assert_eq!(count_lore_vectors(&db), 1);
    }

    #[test]
    fn test_store_lore_vectors_is_idempotent() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_store_vectors_idempotent.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-store-idempotent".to_string());
        seed_lore_search_row(&db, "char-1", &project_id.0);

        let embedding = vec![0.3f32; 768];
        let first = db
            .store_lore_vectors(vec![("char-1".to_string(), embedding.clone())])
            .expect("first store should succeed");
        let second = db
            .store_lore_vectors(vec![("char-1".to_string(), embedding)])
            .expect("second store should succeed without duplicate key error");

        assert_eq!(first, 1);
        assert_eq!(second, 1);
        assert_eq!(count_lore_vectors(&db), 1);
    }

    #[test]
    fn test_store_lore_vectors_empty_batch_returns_zero_without_error() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_store_vectors_empty.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let stored = db
            .store_lore_vectors(vec![])
            .expect("empty batch should succeed");
        assert_eq!(stored, 0);
        assert_eq!(vector_meta_dim(&db), 1536);
    }

    #[test]
    fn test_store_lore_vectors_rejects_mismatched_dimensions_in_one_batch() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_store_vectors_mismatched.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let result = db.store_lore_vectors(vec![
            ("char-1".to_string(), vec![0.1f32; 768]),
            ("char-2".to_string(), vec![0.1f32; 384]),
        ]);

        assert!(result.is_err());
    }

    #[test]
    fn test_store_lore_vectors_rejects_zero_length_embedding() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_store_vectors_zero_len.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let result = db.store_lore_vectors(vec![("char-1".to_string(), vec![])]);

        assert!(result.is_err());
    }

    #[test]
    fn test_list_lore_index_rows_scopes_by_project_and_book() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_list_index_rows.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-list-index".to_string());
        let book_id = BookId("book-list-index".to_string());

        {
            let conn = db.connection.lock().expect("Failed to lock connection");
            conn.execute(
                "INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content) VALUES (?, ?, NULL, 'character', ?, ?)",
                params!["global-1", project_id.0, "Global Hero", "roams free"],
            )
            .expect("seed global row");
            conn.execute(
                "INSERT INTO lore_search (entity_id, project_id, book_id, type, title, content) VALUES (?, ?, ?, 'character', ?, ?)",
                params!["book-1", project_id.0, book_id.0, "Book Hero", "tied to book"],
            )
            .expect("seed book-scoped row");
        }

        let global_rows = db
            .list_lore_index_rows(&project_id, None)
            .expect("list global rows should succeed");
        assert_eq!(global_rows.len(), 1);
        assert_eq!(global_rows[0].0, "global-1");
        assert_eq!(global_rows[0].1, "Global Hero roams free");

        let book_rows = db
            .list_lore_index_rows(&project_id, Some(&book_id))
            .expect("list book rows should succeed");
        assert_eq!(book_rows.len(), 1);
        assert_eq!(book_rows[0].0, "book-1");
        assert_eq!(book_rows[0].1, "Book Hero tied to book");
    }
}
