use rusqlite::{Connection, Result};
use std::path::Path;
use crate::domain::ports::DatabasePort;

pub struct SqliteDatabase {
    connection: Connection,
}

impl SqliteDatabase {
    pub fn new(path: &Path) -> Result<Self> {
        let connection = Connection::open(path)?;
        Ok(SqliteDatabase { connection })
    }
}

impl DatabasePort for SqliteDatabase {
    fn is_healthy(&self) -> bool {
        self.connection.query_row("SELECT 1", [], |_| Ok(())).is_ok()
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
}
