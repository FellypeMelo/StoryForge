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
            let db_name = if std::env::var("STORYFORGE_ENV").unwrap_or_default() == "test" {
                "storyforge_test.db"
            } else {
                "storyforge.db"
            };
            let db_path = app_data_dir.join(db_name);
            let db = SqliteDatabase::new(&db_path).expect("Failed to initialize database");
            db.run_migrations()
                .expect("Failed to run database migrations");

            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_app_info,
            commands::health_check,
            features::projects::commands::create_project,
            features::projects::commands::get_project,
            features::projects::commands::list_projects,
            features::projects::commands::delete_project,
            features::characters::commands::create_character,
            features::characters::commands::get_character,
            features::characters::commands::list_characters,
            features::characters::commands::list_characters_by_book,
            features::characters::commands::list_global_characters,
            features::characters::commands::move_character_to_book,
            features::characters::commands::move_character_to_project,
            features::characters::commands::update_character,
            features::characters::commands::delete_character,
            features::lore::commands::create_location,
            features::lore::commands::list_locations,
            features::lore::commands::list_locations_by_book,
            features::lore::commands::list_global_locations,
            features::lore::commands::move_location_to_book,
            features::lore::commands::move_location_to_project,
            features::lore::commands::create_world_rule,
            features::lore::commands::list_world_rules,
            features::lore::commands::list_world_rules_by_book,
            features::lore::commands::list_global_world_rules,
            features::lore::commands::move_world_rule_to_book,
            features::lore::commands::move_world_rule_to_project,
            features::lore::commands::search_lore,
            features::lore::commands::get_lore_context,
            features::lore::commands::create_timeline_event,
            features::lore::commands::list_timeline_events_by_book,
            features::lore::commands::list_global_timeline_events,
            features::lore::commands::update_timeline_event,
            features::lore::commands::move_timeline_event_to_book,
            features::lore::commands::move_timeline_event_to_project,
            features::lore::commands::delete_timeline_event,
            features::lore::commands::create_relationship,
            features::lore::commands::list_relationships_by_book,
            features::lore::commands::list_global_relationships,
            features::lore::commands::update_relationship,
            features::lore::commands::move_relationship_to_book,
            features::lore::commands::move_relationship_to_project,
            features::lore::commands::delete_relationship,
            features::lore::commands::create_blacklist_entry,
            features::lore::commands::list_blacklist_entries_by_book,
            features::lore::commands::list_global_blacklist_entries,
            features::lore::commands::update_blacklist_entry,
            features::lore::commands::move_blacklist_entry_to_book,
            features::lore::commands::move_blacklist_entry_to_project,
            features::lore::commands::delete_blacklist_entry,
            features::books::commands::create_book,
            features::books::commands::get_book,
            features::books::commands::list_books,
            features::books::commands::update_book,
            features::books::commands::delete_book
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
