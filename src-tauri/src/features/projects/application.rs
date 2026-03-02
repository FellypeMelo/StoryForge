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

#[cfg(test)]
mod tests {
    use super::*;

    struct MockRepo;
    impl ProjectRepository for MockRepo {
        fn create_project(&self, _p: &Project) -> AppResult<()> { Ok(()) }
        fn get_project_by_id(&self, _id: &ProjectId) -> AppResult<Project> {
            Ok(Project::new("N".to_string(), "D".to_string()).unwrap())
        }
        fn list_all_projects(&self) -> AppResult<Vec<Project>> { Ok(vec![]) }
        fn update_project(&self, _p: &Project) -> AppResult<()> { Ok(()) }
        fn delete_project(&self, _id: &ProjectId) -> AppResult<()> { Ok(()) }
    }

    #[test]
    fn test_project_service_ops() {
        let mock = MockRepo;
        let service = ProjectService::new(&mock);
        let pid = ProjectId("p".to_string());

        assert!(service.create_project("N".to_string(), "D".to_string()).is_ok());
        assert!(service.get_project(pid.clone()).is_ok());
        assert!(service.list_projects().is_ok());
        assert!(service.delete_project(pid).is_ok());
    }
}
