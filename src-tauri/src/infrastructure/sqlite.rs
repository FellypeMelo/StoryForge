use rusqlite::{Connection, Result};
use std::path::Path;
use crate::domain::ports::DatabasePort;

pub struct SqliteDatabase {
    connection: Connection,
}

impl SqliteDatabase {
    pub fn new(path: &Path) -> Result<Self> {
        let connection = Connection::open(path)?;
        
        // Enable WAL mode for better concurrency
        connection.pragma_update(None, "journal_mode", &"WAL")?;
        
        Ok(SqliteDatabase { connection })
    }

    pub fn run_migrations(&self) -> Result<()> {
        let current_version: i32 = self.connection.query_row("PRAGMA user_version", [], |row| row.get(0))?;
        
        if current_version < 1 {
            self.connection.execute_batch(
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
        
        Ok(())
    }
}

impl DatabasePort for SqliteDatabase {
    fn is_healthy(&self) -> bool {
        self.connection.query_row("SELECT 1", [], |_| Ok(())).is_ok()
    }

    fn get_version(&self) -> i32 {
        self.connection.query_row("PRAGMA user_version", [], |row| row.get(0)).unwrap_or(0)
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
        assert!(db_port.get_version() > 0);
    }

    #[test]
    fn test_wal_mode_enabled() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_wal.db");
        
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        let journal_mode: String = db.connection.query_row("PRAGMA journal_mode", [], |row| row.get(0)).expect("Failed to get journal mode");
        assert_eq!(journal_mode.to_uppercase(), "WAL");
    }
}
