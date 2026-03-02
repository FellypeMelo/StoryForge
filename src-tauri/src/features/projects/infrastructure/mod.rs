use crate::features::projects::domain::*;
use crate::infrastructure::sqlite::SqliteDatabase;
use crate::domain::result::AppResult;
use crate::domain::error::AppError;
use rusqlite::{params, Row};

impl ProjectRepository for SqliteDatabase {
    fn create_project(&self, project: &Project) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO projects (id, name, description) VALUES (?, ?, ?)",
            params![project.id.0, project.name, project.description],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn get_project_by_id(&self, id: &ProjectId) -> AppResult<Project> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let project = conn
            .query_row(
                "SELECT id, name, description, created_at FROM projects WHERE id = ?",
                [id.0.clone()],
                |row: &Row| {
                    Ok(Project {
                        id: ProjectId(row.get(0)?),
                        name: row.get(1)?,
                        description: row.get(2)?,
                        created_at: row.get(3)?,
                    })
                },
            )
            .map_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    AppError::NotFound(format!("Project with id {} not found", id.0))
                }
                _ => AppError::from(e),
            })?;
        Ok(project)
    }

    fn list_all_projects(&self) -> AppResult<Vec<Project>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("SELECT id, name, description, created_at FROM projects")
            .map_err(AppError::from)?;

        let project_iter = stmt
            .query_map([], |row: &Row| {
                Ok(Project {
                    id: ProjectId(row.get(0)?),
                    name: row.get(1)?,
                    description: row.get(2)?,
                    created_at: row.get(3)?,
                })
            })
            .map_err(AppError::from)?;

        let mut projects = Vec::new();
        for project in project_iter {
            projects.push(project?);
        }
        Ok(projects)
    }

    fn update_project(&self, project: &Project) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
                "UPDATE projects SET name = ?, description = ? WHERE id = ?",
                params![project.name, project.description, project.id.0],
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Project with id {} not found",
                project.id.0
            )));
        }
        Ok(())
    }

    fn delete_project(&self, id: &ProjectId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM projects WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Project with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests;
