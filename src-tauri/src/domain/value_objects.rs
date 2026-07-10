use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ProjectId(pub String);

impl Default for ProjectId {
    fn default() -> Self {
        Self::new()
    }
}

impl ProjectId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BookId(pub String);

impl Default for BookId {
    fn default() -> Self {
        Self::new()
    }
}

impl BookId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CharacterId(pub String);

impl Default for CharacterId {
    fn default() -> Self {
        Self::new()
    }
}

impl CharacterId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct LocationId(pub String);

impl Default for LocationId {
    fn default() -> Self {
        Self::new()
    }
}

impl LocationId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorldRuleId(pub String);

impl Default for WorldRuleId {
    fn default() -> Self {
        Self::new()
    }
}

impl WorldRuleId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TimelineEventId(pub String);

impl Default for TimelineEventId {
    fn default() -> Self {
        Self::new()
    }
}

impl TimelineEventId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RelationshipId(pub String);

impl Default for RelationshipId {
    fn default() -> Self {
        Self::new()
    }
}

impl RelationshipId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BlacklistEntryId(pub String);

impl Default for BlacklistEntryId {
    fn default() -> Self {
        Self::new()
    }
}

impl BlacklistEntryId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}
