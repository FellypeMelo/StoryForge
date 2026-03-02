use crate::features::lore::domain::*;
use crate::infrastructure::sqlite::SqliteDatabase;
use crate::domain::result::AppResult;
use crate::domain::error::AppError;
use crate::domain::ports::{SearchResult, SearchPort, EntityType};
use rusqlite::{params, Row};

impl LocationRepository for SqliteDatabase {
    fn create_location(&self, location: &Location) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO locations (id, project_id, book_id, name, description, symbolic_meaning) VALUES (?, ?, ?, ?, ?, ?)",
            params![
                location.id.0,
                location.project_id.0,
                location.book_id.as_ref().map(|id| id.0.clone()),
                location.name,
                location.description,
                location.symbolic_meaning
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_location_by_id(&self, id: &LocationId) -> AppResult<Location> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let location = conn.query_row(
            "SELECT id, project_id, book_id, name, description, symbolic_meaning FROM locations WHERE id = ?",
            [id.0.clone()],
            |row: &Row| {
                Ok(Location {
                    id: LocationId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    description: row.get(4)?,
                    symbolic_meaning: row.get(5)?,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Location with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(location)
    }

    fn list_locations_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<Location>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, name, description, symbolic_meaning FROM locations WHERE project_id = ?")
            .map_err(AppError::from)?;

        let location_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Location {
                    id: LocationId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    description: row.get(4)?,
                    symbolic_meaning: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut locations = Vec::new();
        for loc in location_iter {
            locations.push(loc?);
        }
        Ok(locations)
    }

    fn list_locations_by_book(&self, book_id: &BookId) -> AppResult<Vec<Location>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, name, description, symbolic_meaning FROM locations WHERE book_id = ?")
            .map_err(AppError::from)?;

        let location_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                Ok(Location {
                    id: LocationId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    description: row.get(4)?,
                    symbolic_meaning: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut locations = Vec::new();
        for loc in location_iter {
            locations.push(loc?);
        }
        Ok(locations)
    }

    fn list_global_locations(&self, project_id: &ProjectId) -> AppResult<Vec<Location>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, name, description, symbolic_meaning FROM locations WHERE project_id = ? AND book_id IS NULL")
            .map_err(AppError::from)?;

        let location_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Location {
                    id: LocationId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    name: row.get(3)?,
                    description: row.get(4)?,
                    symbolic_meaning: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut locations = Vec::new();
        for loc in location_iter {
            locations.push(loc?);
        }
        Ok(locations)
    }

    fn move_location_to_book(&self, id: &LocationId, book_id: &BookId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE locations SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_location_to_project(&self, id: &LocationId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE locations SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_location(&self, location: &Location) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
                "UPDATE locations SET name = ?, description = ?, symbolic_meaning = ? WHERE id = ?",
                params![
                    location.name,
                    location.description,
                    location.symbolic_meaning,
                    location.id.0
                ],
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Location with id {} not found",
                location.id.0
            )));
        }
        Ok(())
    }

    fn delete_location(&self, id: &LocationId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM locations WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Location with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

impl WorldRuleRepository for SqliteDatabase {
    fn create_world_rule(&self, rule: &WorldRule) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO world_rules (id, project_id, book_id, category, content, hierarchy) VALUES (?, ?, ?, ?, ?, ?)",
            params![
                rule.id.0,
                rule.project_id.0,
                rule.book_id.as_ref().map(|id| id.0.clone()),
                rule.category,
                rule.content,
                rule.hierarchy
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_world_rule_by_id(&self, id: &WorldRuleId) -> AppResult<WorldRule> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rule = conn
            .query_row(
                "SELECT id, project_id, book_id, category, content, hierarchy FROM world_rules WHERE id = ?",
                [id.0.clone()],
                |row: &Row| {
                    Ok(WorldRule {
                        id: WorldRuleId(row.get(0)?),
                        project_id: ProjectId(row.get(1)?),
                        book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                        category: row.get(3)?,
                        content: row.get(4)?,
                        hierarchy: row.get(5)?,
                    })
                },
            )
            .map_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    AppError::NotFound(format!("WorldRule with id {} not found", id.0))
                }
                _ => AppError::from(e),
            })?;
        Ok(rule)
    }

    fn list_world_rules_by_project(&self, project_id: &ProjectId) -> AppResult<Vec<WorldRule>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, category, content, hierarchy FROM world_rules WHERE project_id = ? ORDER BY hierarchy ASC")
            .map_err(AppError::from)?;

        let rule_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(WorldRule {
                    id: WorldRuleId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    category: row.get(3)?,
                    content: row.get(4)?,
                    hierarchy: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut rules = Vec::new();
        for rule in rule_iter {
            rules.push(rule?);
        }
        Ok(rules)
    }

    fn list_world_rules_by_book(&self, book_id: &BookId) -> AppResult<Vec<WorldRule>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, category, content, hierarchy FROM world_rules WHERE book_id = ? ORDER BY hierarchy ASC")
            .map_err(AppError::from)?;

        let rule_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                Ok(WorldRule {
                    id: WorldRuleId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    category: row.get(3)?,
                    content: row.get(4)?,
                    hierarchy: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut rules = Vec::new();
        for rule in rule_iter {
            rules.push(rule?);
        }
        Ok(rules)
    }

    fn list_global_world_rules(&self, project_id: &ProjectId) -> AppResult<Vec<WorldRule>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, category, content, hierarchy FROM world_rules WHERE project_id = ? AND book_id IS NULL ORDER BY hierarchy ASC")
            .map_err(AppError::from)?;

        let rule_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(WorldRule {
                    id: WorldRuleId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    category: row.get(3)?,
                    content: row.get(4)?,
                    hierarchy: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut rules = Vec::new();
        for rule in rule_iter {
            rules.push(rule?);
        }
        Ok(rules)
    }

    fn move_world_rule_to_book(&self, id: &WorldRuleId, book_id: &BookId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE world_rules SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_world_rule_to_project(&self, id: &WorldRuleId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE world_rules SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_world_rule(&self, rule: &WorldRule) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
                "UPDATE world_rules SET category = ?, content = ?, hierarchy = ? WHERE id = ?",
                params![rule.category, rule.content, rule.hierarchy, rule.id.0],
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "WorldRule with id {} not found",
                rule.id.0
            )));
        }
        Ok(())
    }

    fn delete_world_rule(&self, id: &WorldRuleId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM world_rules WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "WorldRule with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

impl TimelineRepository for SqliteDatabase {
    fn create_timeline_event(&self, event: &TimelineEvent) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let deps_json =
            serde_json::to_string(&event.causal_dependencies).unwrap_or_else(|_| "[]".to_string());
        conn.execute(
            "INSERT INTO timeline_events (id, project_id, book_id, date, description, causal_dependencies) VALUES (?, ?, ?, ?, ?, ?)",
            params![
                event.id.0,
                event.project_id.0,
                event.book_id.as_ref().map(|id| id.0.clone()),
                event.date,
                event.description,
                deps_json
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_timeline_event_by_id(&self, id: &TimelineEventId) -> AppResult<TimelineEvent> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let event = conn.query_row(
            "SELECT id, project_id, book_id, date, description, causal_dependencies FROM timeline_events WHERE id = ?",
            [id.0.clone()],
            |row: &Row| {
                let deps_json: String = row.get(5)?;
                let causal_dependencies: Vec<TimelineEventId> = serde_json::from_str(&deps_json).unwrap_or_default();
                Ok(TimelineEvent {
                    id: TimelineEventId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    date: row.get(3)?,
                    description: row.get(4)?,
                    causal_dependencies,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("TimelineEvent with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(event)
    }

    fn list_timeline_events_by_project(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<TimelineEvent>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, date, description, causal_dependencies FROM timeline_events WHERE project_id = ?")
            .map_err(AppError::from)?;

        let event_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                let deps_json: String = row.get(5)?;
                let causal_dependencies: Vec<TimelineEventId> =
                    serde_json::from_str(&deps_json).unwrap_or_default();
                Ok(TimelineEvent {
                    id: TimelineEventId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    date: row.get(3)?,
                    description: row.get(4)?,
                    causal_dependencies,
                })
            })
            .map_err(AppError::from)?;

        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        Ok(events)
    }

    fn list_timeline_events_by_book(&self, book_id: &BookId) -> AppResult<Vec<TimelineEvent>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, date, description, causal_dependencies FROM timeline_events WHERE book_id = ?")
            .map_err(AppError::from)?;

        let event_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                let deps_json: String = row.get(5)?;
                let causal_dependencies: Vec<TimelineEventId> =
                    serde_json::from_str(&deps_json).unwrap_or_default();
                Ok(TimelineEvent {
                    id: TimelineEventId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    date: row.get(3)?,
                    description: row.get(4)?,
                    causal_dependencies,
                })
            })
            .map_err(AppError::from)?;

        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        Ok(events)
    }

    fn list_global_timeline_events(&self, project_id: &ProjectId) -> AppResult<Vec<TimelineEvent>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, date, description, causal_dependencies FROM timeline_events WHERE project_id = ? AND book_id IS NULL")
            .map_err(AppError::from)?;

        let event_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                let deps_json: String = row.get(5)?;
                let causal_dependencies: Vec<TimelineEventId> =
                    serde_json::from_str(&deps_json).unwrap_or_default();
                Ok(TimelineEvent {
                    id: TimelineEventId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    date: row.get(3)?,
                    description: row.get(4)?,
                    causal_dependencies,
                })
            })
            .map_err(AppError::from)?;

        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        Ok(events)
    }

    fn move_timeline_event_to_book(&self, id: &TimelineEventId, book_id: &BookId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE timeline_events SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_timeline_event_to_project(&self, id: &TimelineEventId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE timeline_events SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_timeline_event(&self, event: &TimelineEvent) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let deps_json =
            serde_json::to_string(&event.causal_dependencies).unwrap_or_else(|_| "[]".to_string());
        let rows_affected = conn.execute(
            "UPDATE timeline_events SET date = ?, description = ?, causal_dependencies = ? WHERE id = ?",
            params![event.date, event.description, deps_json, event.id.0],
        ).map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "TimelineEvent with id {} not found",
                event.id.0
            )));
        }
        Ok(())
    }

    fn delete_timeline_event(&self, id: &TimelineEventId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM timeline_events WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "TimelineEvent with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

impl RelationshipRepository for SqliteDatabase {
    fn create_relationship(&self, rel: &Relationship) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO relationships (id, project_id, book_id, character_a, character_b, type) VALUES (?, ?, ?, ?, ?, ?)",
            params![
                rel.id.0,
                rel.project_id.0,
                rel.book_id.as_ref().map(|id| id.0.clone()),
                rel.character_a.0,
                rel.character_b.0,
                rel.r#type
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_relationship_by_id(&self, id: &RelationshipId) -> AppResult<Relationship> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rel = conn.query_row(
            "SELECT id, project_id, book_id, character_a, character_b, type FROM relationships WHERE id = ?",
            [id.0.clone()],
            |row: &Row| {
                Ok(Relationship {
                    id: RelationshipId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    character_a: CharacterId(row.get(3)?),
                    character_b: CharacterId(row.get(4)?),
                    r#type: row.get(5)?,
                })
            },
        ).map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Relationship with id {} not found", id.0)),
            _ => AppError::from(e),
        })?;
        Ok(rel)
    }

    fn list_relationships_by_project(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<Relationship>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, character_a, character_b, type FROM relationships WHERE project_id = ?")
            .map_err(AppError::from)?;

        let rel_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Relationship {
                    id: RelationshipId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    character_a: CharacterId(row.get(3)?),
                    character_b: CharacterId(row.get(4)?),
                    r#type: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut relationships = Vec::new();
        for rel in rel_iter {
            relationships.push(rel?);
        }
        Ok(relationships)
    }

    fn list_relationships_by_book(&self, book_id: &BookId) -> AppResult<Vec<Relationship>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, character_a, character_b, type FROM relationships WHERE book_id = ?")
            .map_err(AppError::from)?;

        let rel_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                Ok(Relationship {
                    id: RelationshipId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    character_a: CharacterId(row.get(3)?),
                    character_b: CharacterId(row.get(4)?),
                    r#type: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut relationships = Vec::new();
        for rel in rel_iter {
            relationships.push(rel?);
        }
        Ok(relationships)
    }

    fn list_global_relationships(&self, project_id: &ProjectId) -> AppResult<Vec<Relationship>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, character_a, character_b, type FROM relationships WHERE project_id = ? AND book_id IS NULL")
            .map_err(AppError::from)?;

        let rel_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(Relationship {
                    id: RelationshipId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    character_a: CharacterId(row.get(3)?),
                    character_b: CharacterId(row.get(4)?),
                    r#type: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut relationships = Vec::new();
        for rel in rel_iter {
            relationships.push(rel?);
        }
        Ok(relationships)
    }

    fn move_relationship_to_book(&self, id: &RelationshipId, book_id: &BookId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE relationships SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_relationship_to_project(&self, id: &RelationshipId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE relationships SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_relationship(&self, relationship: &Relationship) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
                "UPDATE relationships SET character_a = ?, character_b = ?, type = ? WHERE id = ?",
                params![
                    relationship.character_a.0,
                    relationship.character_b.0,
                    relationship.r#type,
                    relationship.id.0
                ],
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Relationship with id {} not found",
                relationship.id.0
            )));
        }
        Ok(())
    }

    fn delete_relationship(&self, id: &RelationshipId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM relationships WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "Relationship with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

impl BlacklistRepository for SqliteDatabase {
    fn create_blacklist_entry(&self, entry: &BlacklistEntry) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "INSERT INTO blacklist_entries (id, project_id, book_id, term, category, reason) VALUES (?, ?, ?, ?, ?, ?)",
            params![
                entry.id.0,
                entry.project_id.0,
                entry.book_id.as_ref().map(|id| id.0.clone()),
                entry.term,
                entry.category,
                entry.reason
            ],
        ).map_err(AppError::from)?;
        Ok(())
    }

    fn get_blacklist_entry_by_id(&self, id: &BlacklistEntryId) -> AppResult<BlacklistEntry> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let entry = conn
            .query_row(
                "SELECT id, project_id, book_id, term, category, reason FROM blacklist_entries WHERE id = ?",
                [id.0.clone()],
                |row: &Row| {
                    Ok(BlacklistEntry {
                        id: BlacklistEntryId(row.get(0)?),
                        project_id: ProjectId(row.get(1)?),
                        book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                        term: row.get(3)?,
                        category: row.get(4)?,
                        reason: row.get(5)?,
                    })
                },
            )
            .map_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    AppError::NotFound(format!("BlacklistEntry with id {} not found", id.0))
                }
                _ => AppError::from(e),
            })?;
        Ok(entry)
    }

    fn list_blacklist_entries_by_project(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<BlacklistEntry>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("SELECT id, project_id, book_id, term, category, reason FROM blacklist_entries WHERE project_id = ?")
            .map_err(AppError::from)?;

        let entry_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(BlacklistEntry {
                    id: BlacklistEntryId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    term: row.get(3)?,
                    category: row.get(4)?,
                    reason: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut entries = Vec::new();
        for entry in entry_iter {
            entries.push(entry?);
        }
        Ok(entries)
    }

    fn list_blacklist_entries_by_book(&self, book_id: &BookId) -> AppResult<Vec<BlacklistEntry>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, term, category, reason FROM blacklist_entries WHERE book_id = ?")
            .map_err(AppError::from)?;

        let entry_iter = stmt
            .query_map([book_id.0.clone()], |row: &Row| {
                Ok(BlacklistEntry {
                    id: BlacklistEntryId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    term: row.get(3)?,
                    category: row.get(4)?,
                    reason: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut entries = Vec::new();
        for entry in entry_iter {
            entries.push(entry?);
        }
        Ok(entries)
    }

    fn list_global_blacklist_entries(
        &self,
        project_id: &ProjectId,
    ) -> AppResult<Vec<BlacklistEntry>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, project_id, book_id, term, category, reason FROM blacklist_entries WHERE project_id = ? AND book_id IS NULL")
            .map_err(AppError::from)?;

        let entry_iter = stmt
            .query_map([project_id.0.clone()], |row: &Row| {
                Ok(BlacklistEntry {
                    id: BlacklistEntryId(row.get(0)?),
                    project_id: ProjectId(row.get(1)?),
                    book_id: row.get::<_, Option<String>>(2)?.map(BookId),
                    term: row.get(3)?,
                    category: row.get(4)?,
                    reason: row.get(5)?,
                })
            })
            .map_err(AppError::from)?;

        let mut entries = Vec::new();
        for entry in entry_iter {
            entries.push(entry?);
        }
        Ok(entries)
    }

    fn move_blacklist_entry_to_book(
        &self,
        id: &BlacklistEntryId,
        book_id: &BookId,
    ) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE blacklist_entries SET book_id = ? WHERE id = ?",
            params![book_id.0, id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn move_blacklist_entry_to_project(&self, id: &BlacklistEntryId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute(
            "UPDATE blacklist_entries SET book_id = NULL WHERE id = ?",
            params![id.0],
        )
        .map_err(AppError::from)?;
        Ok(())
    }

    fn update_blacklist_entry(&self, entry: &BlacklistEntry) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute(
                "UPDATE blacklist_entries SET term = ?, category = ?, reason = ? WHERE id = ?",
                params![entry.term, entry.category, entry.reason, entry.id.0],
            )
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "BlacklistEntry with id {} not found",
                entry.id.0
            )));
        }
        Ok(())
    }

    fn delete_blacklist_entry(&self, id: &BlacklistEntryId) -> AppResult<()> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        let rows_affected = conn
            .execute("DELETE FROM blacklist_entries WHERE id = ?", [id.0.clone()])
            .map_err(AppError::from)?;

        if rows_affected == 0 {
            return Err(AppError::NotFound(format!(
                "BlacklistEntry with id {} not found",
                id.0
            )));
        }
        Ok(())
    }
}

impl SearchPort for SqliteDatabase {
    fn search(
        &self,
        project_id: &ProjectId,
        query: &str,
        book_id: Option<BookId>,
        types: Option<Vec<EntityType>>,
    ) -> AppResult<Vec<SearchResult>> {
        let conn = self
            .connection
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;

        let mut sql =
            "SELECT entity_id, type, title || ': ' || content, bm25(lore_search) as score 
                       FROM lore_search 
                       WHERE project_id = ? AND lore_search MATCH ?"
                .to_string();

        if let Some(ref _bid) = book_id {
            sql.push_str(" AND book_id = ?");
        } else {
            sql.push_str(" AND book_id IS NULL");
        }

        if let Some(ref t) = types {
            if !t.is_empty() {
                let type_placeholders: Vec<String> = t.iter().map(|_| "?".to_string()).collect();
                sql.push_str(&format!(" AND type IN ({})", type_placeholders.join(",")));
            }
        }

        sql.push_str(" ORDER BY score DESC");

        let mut stmt = conn.prepare(&sql).map_err(AppError::from)?;

        let mut params: Vec<Box<dyn rusqlite::ToSql>> =
            vec![Box::new(project_id.0.clone()), Box::new(query.to_string())];

        if let Some(ref _bid) = book_id {
            params.push(Box::new(_bid.0.clone()));
        }

        if let Some(t) = types {
            for entity_type in t {
                let type_str = match entity_type {
                    EntityType::Character => "character",
                    EntityType::Location => "location",
                    EntityType::WorldRule => "world_rule",
                    EntityType::TimelineEvent => "timeline_event",
                };
                params.push(Box::new(type_str.to_string()));
            }
        }

        // Convert Vec<Box<dyn ToSql>> to slice of &dyn ToSql
        let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

        let results_iter = stmt
            .query_map(rusqlite::params_from_iter(params_refs), |row: &Row| {
                let type_str: String = row.get(1)?;
                let entity_type = match type_str.as_str() {
                    "character" => EntityType::Character,
                    "location" => EntityType::Location,
                    "world_rule" => EntityType::WorldRule,
                    "timeline_event" => EntityType::TimelineEvent,
                    _ => EntityType::WorldRule, // Fallback
                };

                Ok(SearchResult {
                    entity_id: row.get(0)?,
                    entity_type,
                    snippet: row.get(2)?,
                    score: row.get(3)?,
                })
            })
            .map_err(AppError::from)?;

        let mut results = Vec::new();
        for res in results_iter {
            results.push(res?);
        }
        Ok(results)
    }
}
