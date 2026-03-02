pub mod book;

use crate::domain::result::AppResult;
use crate::domain::ports::DatabasePort;
use crate::infrastructure::sqlite::SqliteDatabase;
use tauri::State;
use serde::Serialize;

#[derive(Serialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
}

#[derive(Serialize)]
pub struct HealthStatus {
    pub database: bool,
}

#[tauri::command]
pub async fn get_app_info() -> AppInfo {
    AppInfo {
        name: "StoryForge".to_string(),
        version: "0.1.0".to_string(),
    }
}

#[tauri::command]
pub async fn health_check(state: State<'_, SqliteDatabase>) -> AppResult<HealthStatus> {
    Ok(HealthStatus {
        database: state.is_healthy(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_app_info() {
        let info = futures::executor::block_on(get_app_info());
        assert_eq!(info.name, "StoryForge");
    }

    #[test]
    fn test_health_check() {
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
