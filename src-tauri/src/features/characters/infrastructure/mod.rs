use crate::features::characters::domain::{
    Character, CharacterId, CharacterRepository, OceanScores, ProjectId, BookId
};
use crate::infrastructure::sqlite::SqliteDatabase;
use crate::domain::result::AppResult;
use crate::domain::error::AppError;
use rusqlite::{params, Row};

impl CharacterRepository for SqliteDatabase {
    fn create_character(&self, character: &Character) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO characters (
                id, project_id, book_id, name, age, occupation, physical_description, 
                goal, motivation, internal_conflict, voice, mannerisms,
                ocean_openness, ocean_conscientiousness, ocean_extraversion,
                ocean_agreeableness, ocean_neuroticism
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                character.id.0,
                character.project_id.0,
                character.book_id.as_ref().map(|id| id.0.clone()),
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
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn get_character_by_id(&self, id: &CharacterId) -> AppResult<Character> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let character = conn
            .query_row(
                "SELECT 
                id, project_id, book_id, name, age, occupation, physical_description, 
                goal, motivation, internal_conflict, voice, mannerisms,
                ocean_openness, ocean_conscientiousness, ocean_extraversion,
                ocean_agreeableness, ocean_neuroticism
            FROM characters WHERE id = ?",
                [id.0.clone()],
                |row: &Row| {
                    Ok(Character {
                        id: CharacterId(row.get(0)?),
                        project_id: ProjectId(row.get(1)?),
                        book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                        name: row.get(3)?,
                        age: row.get(4)?,
                        occupation: row.get(5)?,
                        physical_description: row.get(6)?,
                        goal: row.get(7)?,
                        motivation: row.get(8)?,
                        internal_conflict: row.get(9)?,
                        voice: row.get(10)?,
                        mannerisms: row.get(11)?,
                        ocean_scores: OceanScores {
                            openness: row.get(12)?,
                            conscientiousness: row.get(13)?,
                            extraversion: row.get(14)?,
                            agreeableness: row.get(15)?,
                            neuroticism: row.get(16)?,
                        },
                    })
                },
            )
            .map_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    AppError::NotFound(format!("Character with id {} not found", id.0))
                }
                _ => AppError::from(e),
            })?;
        Ok(character)
    }

    fn list_characters_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Character>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare(
                "SELECT 
                id, project_id, book_id, name, age, occupation, physical_description, 
                goal, motivation, internal_conflict, voice, mannerisms,
                ocean_openness, ocean_conscientiousness, ocean_extraversion,
                ocean_agreeableness, ocean_neuroticism
            FROM characters WHERE project_id = ?",
            )
            .map_err(AppError::from)?;

        let character_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Character {
                    id: CharacterId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    age: row.get(4)?,
                    occupation: row.get(5)?,
                    physical_description: row.get(6)?,
                    goal: row.get(7)?,
                    motivation: row.get(8)?,
                    internal_conflict: row.get(9)?,
                    voice: row.get(10)?,
                    mannerisms: row.get(11)?,
                    ocean_scores: OceanScores {
                        openness: row.get(12)?,
                        conscientiousness: row.get(13)?,
                        extraversion: row.get(14)?,
                        agreeableness: row.get(15)?,
                        neuroticism: row.get(16)?,
                    },
                })
            })
            .map_err(AppError::from)?;

        let mut characters = Vec::new();
        for char in character_iter {
            characters.push(char?);
        }
        Ok(characters)
    }

    fn list_characters_by_book(&self, book_id: &BookId) -> AppResult<Vec<Character>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare(
                "SELECT 
                id, project_id, book_id, name, age, occupation, physical_description, 
                goal, motivation, internal_conflict, voice, mannerisms,
                ocean_openness, ocean_conscientiousness, ocean_extraversion,
                ocean_agreeableness, ocean_neuroticism
            FROM characters WHERE book_id = ?",
            )
            .map_err(AppError::from)?;

        let character_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                Ok(Character {
                    id: CharacterId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    age: row.get(4)?,
                    occupation: row.get(5)?,
                    physical_description: row.get(6)?,
                    goal: row.get(7)?,
                    motivation: row.get(8)?,
                    internal_conflict: row.get(9)?,
                    voice: row.get(10)?,
                    mannerisms: row.get(11)?,
                    ocean_scores: OceanScores {
                        openness: row.get(12)?,
                        conscientiousness: row.get(13)?,
                        extraversion: row.get(14)?,
                        agreeableness: row.get(15)?,
                        neuroticism: row.get(16)?,
                    },
                })
            })
            .map_err(AppError::from)?;

        let mut characters = Vec::new();
        for char in character_iter {
            characters.push(char?);
        }
        Ok(characters)
    }

    fn list_global_characters(&self, project_id: &ProjectId) -> AppResult<Vec<Character>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare(
                "SELECT 
                id, project_id, book_id, name, age, occupation, physical_description, 
                goal, motivation, internal_conflict, voice, mannerisms,
                ocean_openness, ocean_conscientiousness, ocean_extraversion,
                ocean_agreeableness, ocean_neuroticism
            FROM characters WHERE project_id = ? AND book_id IS NULL",
            )
            .map_err(AppError::from)?;

        let character_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Character {
                    id: CharacterId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    age: row.get(4)?,
                    occupation: row.get(5)?,
                    physical_description: row.get(6)?,
                    goal: row.get(7)?,
                    motivation: row.get(8)?,
                    internal_conflict: row.get(9)?,
                    voice: row.get(10)?,
                    mannerisms: row.get(11)?,
                    ocean_scores: OceanScores {
                        openness: row.get(12)?,
                        conscientiousness: row.get(13)?,
                        extraversion: row.get(14)?,
                        agreeableness: row.get(15)?,
                        neuroticism: row.get(16)?,
                    },
                })
            })
            .map_err(AppError::from)?;

        let mut characters = Vec::new();
        for char in character_iter {
            characters.push(char?);
        }
        Ok(characters)
    }

    fn move_character_to_book(&self, id: &CharacterId, book_id: &BookId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE characters SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_character_to_project(&self, id: &CharacterId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE characters SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_character(&self, character: &Character) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
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
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Character with id {} not found",
                character.id.0
            )));
        }
        Ok(())
    }

    fn delete_character(&self, id: &CharacterId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM characters WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Character with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_sqlite_character_repository_crud() {
        let dir = tempdir().expect("Failed to create temp dir");
        let db_path = dir.path().join("test_character_modular.db");

        let db = SqliteDatabase::new(&db_path).expect("Failed to create database");
        db.run_migrations().expect("Failed to run migrations");

        let project_id = ProjectId("proj-1".to_string());

        // Setup: Create project first due to FK constraint
        {
            let conn = db.connection.lock().unwrap();
            conn.execute(
                "INSERT INTO projects (id, name) VALUES (?, ?)",
                [&project_id.0, "Project 1"],
            )
            .unwrap();
        }

        let mut character =
            Character::new(project_id.clone(), None, "John Doe".to_string()).unwrap();
        character.age = 30;
        character.occupation = "Writer".to_string();

        let repo: &dyn CharacterRepository = &db;

        // Create
        repo.create_character(&character)
            .expect("Failed to create character");

        // Get
        let fetched = repo
            .get_character_by_id(&character.id)
            .expect("Failed to fetch character");
        assert_eq!(fetched.name, "John Doe");
        assert_eq!(fetched.age, 30);

        // List
        let list = repo
            .list_characters_by_project(&project_id)
            .expect("Failed to list characters");
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].id, character.id);

        // Update
        character.name = "Jane Doe".to_string();
        repo.update_character(&character)
            .expect("Failed to update character");
        let updated = repo
            .get_character_by_id(&character.id)
            .expect("Failed to fetch updated character");
        assert_eq!(updated.name, "Jane Doe");

        // Delete
        repo.delete_character(&character.id)
            .expect("Failed to delete character");
        let result = repo.get_character_by_id(&character.id);
        assert!(result.is_err(), "Character should be deleted");
    }
}
