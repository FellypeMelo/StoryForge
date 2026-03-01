use rusqlite::{Connection, Result, Row};
use std::path::Path;
use std::sync::Mutex;
use crate::domain::ports::DatabasePort;

pub struct SqliteDatabase {
    connection: Mutex<Connection>,
}

impl SqliteDatabase {
    pub fn new(path: &Path) -> Result<Self> {
        let connection = Connection::open(path)?;
        
        // Enable WAL mode for better concurrency
        connection.pragma_update(None, "journal_mode", &"WAL")?;
        
        Ok(SqliteDatabase { connection: Mutex::new(connection) })
    }

    pub fn run_migrations(&self) -> Result<()> {
        let conn = self.connection.lock().map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))))?;
        let current_version: i32 = conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
        
        if current_version < 1 {
            conn.execute_batch(
                "BEGIN;
                 CREATE TABLE IF NOT EXISTS story_bible (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                 );
                 PRAGMA user_version = 1;
                 COMMIT;"
            )?;
        }

        let current_version: i32 = conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
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
                 COMMIT;"
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
        assert!(db_port.get_version() >= 2);
    }

    #[test]
    fn test_characters_table_exists() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_chars.db");
        
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");
        
        let conn = db.connection.lock().expect("Failed to lock connection");
        let table_exists: bool = conn.query_row(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='characters'",
            [],
            |row| row.get(0),
        ).map(|count: i32| count > 0).expect("Failed to query sqlite_master");
        
        assert!(table_exists, "Characters table should exist after migration");
    }

    #[test]
    fn test_wal_mode_enabled() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_wal.db");
        
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        let conn = db.connection.lock().expect("Failed to lock connection");
        let journal_mode: String = conn.query_row("PRAGMA journal_mode", [], |row: &Row| row.get(0)).expect("Failed to get journal mode");
        assert_eq!(journal_mode.to_uppercase(), "WAL");
    }
}
