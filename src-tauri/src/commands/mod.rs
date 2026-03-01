pub mod character;
pub mod lore;

use serde::{Serialize, Deserialize};
use crate::domain::ports::DatabasePort;
use crate::domain::error::AppResult;
use std::sync::Arc;

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
pub fn health_check(db: tauri::State<'_, Arc<dyn DatabasePort + Send + Sync>>) -> AppResult<HealthStatus> {
    Ok(HealthStatus {
        database: db.is_healthy(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_app_info() {
        let info = get_app_info().expect("Failed to get app info");
        assert_eq!(info.name, "StoryForge");
        assert_eq!(info.version, "0.1.0");
    }
}
