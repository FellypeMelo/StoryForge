pub mod book;
pub mod character;
pub mod lore;

use crate::domain::error::AppResult;
use crate::domain::ports::DatabasePort;
use serde::{Deserialize, Serialize};

use crate::infrastructure::sqlite::SqliteDatabase;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthStatus {
    pub database: bool,
}

#[tauri::command]
pub fn get_app_info() -> AppResult<AppInfo> {
    Ok(AppInfo {
        name: "StoryForge".to_string(),
        version: "0.1.0".to_string(),
    })
}

#[tauri::command]
pub fn health_check(db: tauri::State<'_, SqliteDatabase>) -> AppResult<HealthStatus> {
    Ok(HealthStatus {
        database: db.is_healthy(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_get_app_info() {
        let info = get_app_info().expect("Failed to get app info");
        assert_eq!(info.name, "StoryForge");
        assert_eq!(info.version, "0.1.0");
    }

    #[test]
    fn test_health_check_logic() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_health.db");
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");

        // Simulating the logic inside health_check since we can't easily mock tauri::State
        let status = HealthStatus {
            database: db.is_healthy(),
        };
        assert!(status.database);
    }
}
