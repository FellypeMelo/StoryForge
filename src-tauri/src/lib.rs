pub mod domain;
pub mod application;
pub mod infrastructure;
pub mod commands;

use std::sync::Arc;
use tauri::Manager;
use crate::infrastructure::sqlite::SqliteDatabase;
use crate::domain::ports::DatabasePort;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            if !app_data_dir.exists() {
                std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data dir");
            }
            let db_path = app_data_dir.join("storyforge.db");
            let db = SqliteDatabase::new(&db_path).expect("Failed to initialize database");
            db.run_migrations().expect("Failed to run database migrations");
            
            app.manage(Arc::new(db) as Arc<dyn DatabasePort + Send + Sync>);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_app_info,
            commands::health_check
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
