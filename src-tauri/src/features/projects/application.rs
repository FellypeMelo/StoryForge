use crate::domain::result::AppResult;
use crate::domain::value_objects::ProjectId;
use super::domain::{Project, ProjectRepository};

pub struct ProjectService<'a> {
    repository: &'a dyn ProjectRepository,
}

impl<'a> ProjectService<'a> {
    pub fn new(repository: &'a dyn ProjectRepository) -> Self {
        Self { repository }
    }

    pub fn create_project(&self, name: String, description: String) -> AppResult<Project> {
        let project = Project::new(name, description)?;
        self.repository.create_project(&project)?;
        Ok(project)
    }

    pub fn get_project(&self, id: ProjectId) -> AppResult<Project> {
        self.repository.get_project_by_id(&id)
    }

    pub fn list_projects(&self) -> AppResult<Vec<Project>> {
        self.repository.list_all_projects()
    }

    pub fn update_project(&self, project: Project) -> AppResult<()> {
        self.repository.update_project(&project)
    }

    pub fn delete_project(&self, id: ProjectId) -> AppResult<()> {
        self.repository.delete_project(&id)
    }
}
