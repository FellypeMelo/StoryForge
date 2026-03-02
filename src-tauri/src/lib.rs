pub mod application;
pub mod commands;
pub mod domain;
pub mod features;
pub mod infrastructure;

use crate::infrastructure::sqlite::SqliteDatabase;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");
            if !app_data_dir.exists() {
                std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data dir");
            }
            let db_path = app_data_dir.join("storyforge.db");
            let db = SqliteDatabase::new(&db_path).expect("Failed to initialize database");
            db.run_migrations()
                .expect("Failed to run database migrations");

            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_app_info,
            commands::health_check,
            features::characters::commands::create_character,
            features::characters::commands::get_character,
            features::characters::commands::list_characters,
            features::characters::commands::list_characters_by_book,
            features::characters::commands::list_global_characters,
            features::characters::commands::move_character_to_book,
            features::characters::commands::move_character_to_project,
            features::characters::commands::update_character,
            features::characters::commands::delete_character,
            commands::book::create_book,
            commands::lore::list_projects,
            commands::lore::create_location,
            commands::lore::list_locations,
            commands::lore::list_locations_by_book,
            commands::lore::list_global_locations,
            commands::lore::move_location_to_book,
            commands::lore::move_location_to_project,
            commands::lore::create_world_rule,
            commands::lore::list_world_rules,
            commands::lore::list_world_rules_by_book,
            commands::lore::list_global_world_rules,
            commands::lore::move_world_rule_to_book,
            commands::lore::move_world_rule_to_project,
            commands::lore::create_timeline_event,
            commands::lore::list_timeline_events_by_book,
            commands::lore::list_global_timeline_events,
            commands::lore::update_timeline_event,
            commands::lore::move_timeline_event_to_book,
            commands::lore::move_timeline_event_to_project,
            commands::lore::delete_timeline_event,
            commands::lore::create_relationship,
            commands::lore::list_relationships_by_book,
            commands::lore::list_global_relationships,
            commands::lore::update_relationship,
            commands::lore::move_relationship_to_book,
            commands::lore::move_relationship_to_project,
            commands::lore::delete_relationship,
            commands::lore::create_blacklist_entry,
            commands::lore::list_blacklist_entries_by_book,
            commands::lore::list_global_blacklist_entries,
            commands::lore::update_blacklist_entry,
            commands::lore::move_blacklist_entry_to_book,
            commands::lore::move_blacklist_entry_to_project,
            commands::lore::delete_blacklist_entry,
            commands::lore::search_lore,
            commands::book::create_book,
            commands::book::get_book,
            commands::book::list_books,
            commands::book::update_book,
            commands::book::delete_book
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
