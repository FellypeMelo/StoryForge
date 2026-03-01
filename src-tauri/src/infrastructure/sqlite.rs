use rusqlite::{params, Connection, Result, Row};
use std::path::Path;
use std::sync::Mutex;
use crate::domain::ports::{
    DatabasePort, CharacterRepository, ProjectRepository, LocationRepository, WorldRuleRepository,
    TimelineRepository, RelationshipRepository, BlacklistRepository
};
use crate::domain::character::{Character, OceanScores};
pub use crate::domain::value_objects::{
    CharacterId, ProjectId, LocationId, WorldRuleId, TimelineEventId, RelationshipId, BlacklistEntryId
};
use crate::domain::project::Project;
use crate::domain::location::Location;
use crate::domain::world_rule::WorldRule;
use crate::domain::timeline_event::TimelineEvent;
use crate::domain::relationship::Relationship;
use crate::domain::blacklist_entry::BlacklistEntry;
use crate::domain::error::{AppError, AppResult};

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

        let current_version: i32 = conn.query_row("PRAGMA user_version", [], |row: &Row| row.get(0))?;
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

impl ProjectRepository for SqliteDatabase {
    fn create(&self, project: &Project) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO projects (id, name) VALUES (?, ?)",
            params![project.id.0, project.name],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_by_id(&self, id: &ProjectId) -> AppResult<Project> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let project = conn.query_row(
            "SELECT id, name, created_at FROM projects WHERE id = ?",
            [id.0.clone()],
            |row| {
                Ok(Project {
                    id: ProjectId(row.get(0)?),
                    name: row.get(1)?,
                    created_at: row.get(2)?,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Project with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(project)
    }

    fn list_all(&self) -> AppResult<Vec<Project>> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, name, created_at FROM projects")
            .map_err(AppError::from)?;

        let project_iter = stmt.query_map([], |row| {
            Ok(Project {
                id: ProjectId(row.get(0)?),
                name: row.get(1)?,
                created_at: row.get(2)?,
            })
        }).map_err(AppError::from)?;

        let mut projects = Vec::new();
        for project in project_iter {
            projects.push(project?);
        }
        Ok(projects)
    }

    fn update(&self, project: &Project) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn.execute(
            "UPDATE projects SET name = ? WHERE id = ?",
            params![project.name, project.id.0],
        ).map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!("Project with id {} not found", project.id.0)));
        }
        Ok(())
    }

    fn delete(&self, id: &ProjectId) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn.execute("DELETE FROM projects WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!("Project with id {} not found", id.0)));
        }
        Ok(())
    }
}

impl CharacterRepository for SqliteDatabase {
    fn create(&self, character: &Character) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO characters (
                id, project_id, name, age, occupation, physical_description, 
                goal, motivation, internal_conflict, voice, mannerisms,
                ocean_openness, ocean_conscientiousness, ocean_extraversion,
                ocean_agreeableness, ocean_neuroticism
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                character.id.0,
                character.project_id.0,
                character.name,
                character.age,
                character.occupation,
                character.physical_description,
                character.goal,
                character.motivation,
                character.internal_conflict,
                character.voice,
                character.mannerisms,
                character.ocean_scores.openness,
                character.ocean_scores.conscientiousness,
                character.ocean_scores.extraversion,
                character.ocean_scores.agreeableness,
                character.ocean_scores.neuroticism,
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_by_id(&self, id: &CharacterId) -> AppResult<Character> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let character = conn.query_row(
            "SELECT 
                id, project_id, name, age, occupation, physical_description, 
                goal, motivation, internal_conflict, voice, mannerisms,
                ocean_openness, ocean_conscientiousness, ocean_extraversion,
                ocean_agreeableness, ocean_neuroticism
            FROM characters WHERE id = ?",
            [id.0.clone()],
            |row| {
                Ok(Character {
                    id: CharacterId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    name: row.get(2)?,
                    age: row.get(3)?,
                    occupation: row.get(4)?,
                    physical_description: row.get(5)?,
                    goal: row.get(6)?,
                    motivation: row.get(7)?,
                    internal_conflict: row.get(8)?,
                    voice: row.get(9)?,
                    mannerisms: row.get(10)?,
                    ocean_scores: OceanScores {
                        openness: row.get(11)?,
                        conscientiousness: row.get(12)?,
                        extraversion: row.get(13)?,
                        agreeableness: row.get(14)?,
                        neuroticism: row.get(15)?,
                    },
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Character with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(character)
    }

    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Character>> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare(
            "SELECT 
                id, project_id, name, age, occupation, physical_description, 
                goal, motivation, internal_conflict, voice, mannerisms,
                ocean_openness, ocean_conscientiousness, ocean_extraversion,
                ocean_agreeableness, ocean_neuroticism
            FROM characters WHERE project_id = ?",
        ).map_err(AppError::from)?;

        let character_iter = stmt.query_map([project_id.0.clone()], |row| {
            Ok(Character {
                id: CharacterId(row.get(0)?),
                project_id: ProjectId(row.get(1)?),
                name: row.get(2)?,
                age: row.get(3)?,
                occupation: row.get(4)?,
                physical_description: row.get(5)?,
                goal: row.get(6)?,
                motivation: row.get(7)?,
                internal_conflict: row.get(8)?,
                voice: row.get(9)?,
                mannerisms: row.get(10)?,
                ocean_scores: OceanScores {
                    openness: row.get(11)?,
                    conscientiousness: row.get(12)?,
                    extraversion: row.get(13)?,
                    agreeableness: row.get(14)?,
                    neuroticism: row.get(15)?,
                },
            })
        }).map_err(AppError::from)?;

        let mut characters = Vec::new();
        for char in character_iter {
            characters.push(char?);
        }
        Ok(characters)
    }

    fn update(&self, character: &Character) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn.execute(
            "UPDATE characters SET 
                name = ?, age = ?, occupation = ?, physical_description = ?, 
                goal = ?, motivation = ?, internal_conflict = ?, voice = ?, mannerisms = ?,
                ocean_openness = ?, ocean_conscientiousness = ?, ocean_extraversion = ?,
                ocean_agreeableness = ?, ocean_neuroticism = ?
            WHERE id = ?",
            params![
                character.name,
                character.age,
                character.occupation,
                character.physical_description,
                character.goal,
                character.motivation,
                character.internal_conflict,
                character.voice,
                character.mannerisms,
                character.ocean_scores.openness,
                character.ocean_scores.conscientiousness,
                character.ocean_scores.extraversion,
                character.ocean_scores.agreeableness,
                character.ocean_scores.neuroticism,
                character.id.0,
            ],
        ).map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!("Character with id {} not found", character.id.0)));
        }
        Ok(())
    }

    fn delete(&self, id: &CharacterId) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn.execute("DELETE FROM characters WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!("Character with id {} not found", id.0)));
        }
        Ok(())
    }
}

impl LocationRepository for SqliteDatabase {
    fn create(&self, location: &Location) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO locations (id, project_id, name, description, symbolic_meaning) VALUES (?, ?, ?, ?, ?)",
            params![location.id.0, location.project_id.0, location.name, location.description, location.symbolic_meaning],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_by_id(&self, id: &LocationId) -> AppResult<Location> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let location = conn.query_row(
            "SELECT id, project_id, name, description, symbolic_meaning FROM locations WHERE id = ?",
            [id.0.clone()],
            |row| {
                Ok(Location {
                    id: LocationId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    name: row.get(2)?,
                    description: row.get(3)?,
                    symbolic_meaning: row.get(4)?,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Location with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(location)
    }

    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Location>> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, name, description, symbolic_meaning FROM locations WHERE project_id = ?")
            .map_err(AppError::from)?;

        let location_iter = stmt.query_map([project_id.0.clone()], |row| {
            Ok(Location {
                id: LocationId(row.get(0)?),
                project_id: ProjectId(row.get(1)?),
                name: row.get(2)?,
                description: row.get(3)?,
                symbolic_meaning: row.get(4)?,
            })
        }).map_err(AppError::from)?;

        let mut locations = Vec::new();
        for loc in location_iter {
            locations.push(loc?);
        }
        Ok(locations)
    }

    fn update(&self, location: &Location) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn.execute(
            "UPDATE locations SET name = ?, description = ?, symbolic_meaning = ? WHERE id = ?",
            params![location.name, location.description, location.symbolic_meaning, location.id.0],
        ).map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!("Location with id {} not found", location.id.0)));
        }
        Ok(())
    }

    fn delete(&self, id: &LocationId) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn.execute("DELETE FROM locations WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!("Location with id {} not found", id.0)));
        }
        Ok(())
    }
}

impl WorldRuleRepository for SqliteDatabase {
    fn create(&self, rule: &WorldRule) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO world_rules (id, project_id, category, content, hierarchy) VALUES (?, ?, ?, ?, ?)",
            params![rule.id.0, rule.project_id.0, rule.category, rule.content, rule.hierarchy],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_by_id(&self, id: &WorldRuleId) -> AppResult<WorldRule> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let rule = conn.query_row(
            "SELECT id, project_id, category, content, hierarchy FROM world_rules WHERE id = ?",
            [id.0.clone()],
            |row| {
                Ok(WorldRule {
                    id: WorldRuleId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    category: row.get(2)?,
                    content: row.get(3)?,
                    hierarchy: row.get(4)?,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("WorldRule with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(rule)
    }

    fn list_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<WorldRule>> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, category, content, hierarchy FROM world_rules WHERE project_id = ? ORDER BY hierarchy ASC")
            .map_err(AppError::from)?;

        let rule_iter = stmt.query_map([project_id.0.clone()], |row| {
            Ok(WorldRule {
                id: WorldRuleId(row.get(0)?),
                project_id: ProjectId(row.get(1)?),
                category: row.get(2)?,
                content: row.get(3)?,
                hierarchy: row.get(4)?,
            })
        }).map_err(AppError::from)?;

        let mut rules = Vec::new();
        for rule in rule_iter {
            rules.push(rule?);
        }
        Ok(rules)
    }

    fn update(&self, rule: &WorldRule) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn.execute(
            "UPDATE world_rules SET category = ?, content = ?, hierarchy = ? WHERE id = ?",
            params![rule.category, rule.content, rule.hierarchy, rule.id.0],
        ).map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!("WorldRule with id {} not found", rule.id.0)));
        }
        Ok(())
    }

    fn delete(&self, id: &WorldRuleId) -> AppResult<()> {
        let conn = self.connection.lock().map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn.execute("DELETE FROM world_rules WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!("WorldRule with id {} not found", id.0)));
        }
        Ok(())
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
        assert!(db_port.get_version() >= 3);
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
    fn test_all_bible_tables_exist() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_all_tables.db");
        
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");
        
        let conn = db.connection.lock().expect("Failed to lock connection");
        let tables = vec![
            "projects",
            "characters",
            "locations",
            "world_rules",
            "timeline_events",
            "relationships",
            "blacklist_entries"
        ];

        for table in tables {
            let table_exists: bool = conn.query_row(
                &format!("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='{}'", table),
                [],
                |row| row.get(0),
            ).map(|count: i32| count > 0).expect(&format!("Failed to query sqlite_master for table {}", table));
            
            assert!(table_exists, "Table {} should exist after migration", table);
        }
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

    #[test]
    fn test_character_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_crud.db");
        
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");
        
        let project_id = ProjectId("proj-1".to_string());
        
        // Setup: Create project first due to FK constraint
        {
            let conn = db.connection.lock().unwrap();
            conn.execute("INSERT INTO projects (id, name) VALUES (?, ?)", [&project_id.0, "Project 1"]).unwrap();
        }

        let mut character = Character::new(project_id.clone(), "John Doe".to_string()).unwrap();
        character.age = 30;
        character.occupation = "Writer".to_string();
        
        let repo: &dyn crate::domain::ports::CharacterRepository = &db;
        
        // Create
        repo.create(&character).expect("Failed to create character");
        
        // Get
        let fetched = repo.get_by_id(&character.id).expect("Failed to fetch character");
        assert_eq!(fetched.name, "John Doe");
        assert_eq!(fetched.age, 30);
        
        // List
        let list = repo.list_by_project(&project_id).expect("Failed to list characters");
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].id, character.id);
        
        // Update
        character.name = "Jane Doe".to_string();
        repo.update(&character).expect("Failed to update character");
        let updated = repo.get_by_id(&character.id).expect("Failed to fetch updated character");
        assert_eq!(updated.name, "Jane Doe");
        
        // Delete
        repo.delete(&character.id).expect("Failed to delete character");
        let result = repo.get_by_id(&character.id);
        assert!(result.is_err(), "Character should be deleted");
    }

    #[test]
    fn test_project_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_project_crud.db");
        
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");
        
        let project = Project::new("My New Project".to_string()).unwrap();
        let repo: &dyn crate::domain::ports::ProjectRepository = &db;
        
        // Create
        repo.create(&project).expect("Failed to create project");
        
        // Get
        let fetched = repo.get_by_id(&project.id).expect("Failed to fetch project");
        assert_eq!(fetched.name, "My New Project");
        
        // List
        let list = repo.list_all().expect("Failed to list projects");
        assert!(list.iter().any(|p| p.id == project.id));
        
        // Update
        let mut updated_project = project.clone();
        updated_project.name = "Updated Project Name".to_string();
        repo.update(&updated_project).expect("Failed to update project");
        let fetched_updated = repo.get_by_id(&project.id).expect("Failed to fetch updated project");
        assert_eq!(fetched_updated.name, "Updated Project Name");
        
        // Delete
        repo.delete(&project.id).expect("Failed to delete project");
        let result = repo.get_by_id(&project.id);
        assert!(result.is_err(), "Project should be deleted");
    }

    #[test]
    fn test_location_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_location_crud.db");
        
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");
        
        let project_id = ProjectId("proj-1".to_string());
        {
            let conn = db.connection.lock().unwrap();
            conn.execute("INSERT INTO projects (id, name) VALUES (?, ?)", [&project_id.0, "Project 1"]).unwrap();
        }

        let location = Location::new(project_id.clone(), "The Dark Forest".to_string()).unwrap();
        let repo: &dyn crate::domain::ports::LocationRepository = &db;
        
        // Create
        repo.create(&location).expect("Failed to create location");
        
        // Get
        let fetched = repo.get_by_id(&location.id).expect("Failed to fetch location");
        assert_eq!(fetched.name, "The Dark Forest");
        
        // List
        let list = repo.list_by_project(&project_id).expect("Failed to list locations");
        assert_eq!(list.len(), 1);
        
        // Delete
        repo.delete(&location.id).expect("Failed to delete location");
        let result = repo.get_by_id(&location.id);
        assert!(result.is_err());
    }

    #[test]
    fn test_world_rule_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_rule_crud.db");
        
        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");
        
        let project_id = ProjectId("proj-1".to_string());
        {
            let conn = db.connection.lock().unwrap();
            conn.execute("INSERT INTO projects (id, name) VALUES (?, ?)", [&project_id.0, "Project 1"]).unwrap();
        }

        let rule = WorldRule::new(project_id.clone(), "Magic".to_string(), "Costs life energy".to_string()).unwrap();
        let repo: &dyn crate::domain::ports::WorldRuleRepository = &db;
        
        // Create
        repo.create(&rule).expect("Failed to create rule");
        
        // Get
        let fetched = repo.get_by_id(&rule.id).expect("Failed to fetch rule");
        assert_eq!(fetched.category, "Magic");
        
        // List
        let list = repo.list_by_project(&project_id).expect("Failed to list rules");
        assert_eq!(list.len(), 1);
        
        // Delete
        repo.delete(&rule.id).expect("Failed to delete rule");
        let result = repo.get_by_id(&rule.id);
        assert!(result.is_err());
    }
}
