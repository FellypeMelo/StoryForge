use crate::domain::error::AppError;
use crate::domain::result::AppResult;
pub use crate::domain::value_objects::ProjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: ProjectId,
    pub name: String,
    pub description: String,
    pub created_at: String,
}

impl Project {
    pub fn new(name: String, description: String) -> AppResult<Self> {
        if name.trim().is_empty() {
            return Err(AppError::Validation("Project name cannot be empty".to_string()));
        }
        Ok(Self {
            id: ProjectId::new(),
            name,
            description,
            created_at: String::new(),
        })
    }
}

pub trait ProjectRepository {
    fn create_project(&self, project: &Project) -> AppResult<()>;
    fn get_project_by_id(&self, id: &ProjectId) -> AppResult<Project>;
    fn list_all_projects(&self) -> AppResult<Vec<Project>>;
    fn update_project(&self, project: &Project) -> AppResult<()>;
    fn delete_project(&self, id: &ProjectId) -> AppResult<()>;
}
