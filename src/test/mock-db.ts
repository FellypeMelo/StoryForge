import { vi } from "vitest";

export class MockDatabase {
  private projects: any[] = [];
  private books: any[] = [];
  private characters: any[] = [];
  private locations: any[] = [];
  private worldRules: any[] = [];
  private timelineEvents: any[] = [];
  private relationships: any[] = [];
  private blacklistEntries: any[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.projects = [];
    this.books = [];
    this.characters = [];
    this.locations = [];
    this.worldRules = [];
    this.timelineEvents = [];
    this.relationships = [];
    this.blacklistEntries = [];
  }

  seed(data: {
    projects?: any[];
    books?: any[];
    characters?: any[];
    locations?: any[];
    worldRules?: any[];
    timelineEvents?: any[];
    relationships?: any[];
    blacklistEntries?: any[];
  }) {
    if (data.projects) this.projects = [...data.projects];
    if (data.books) this.books = [...data.books];
    if (data.characters) this.characters = [...data.characters];
    if (data.locations) this.locations = [...data.locations];
    if (data.worldRules) this.worldRules = [...data.worldRules];
    if (data.timelineEvents) this.timelineEvents = [...data.timelineEvents];
    if (data.relationships) this.relationships = [...data.relationships];
    if (data.blacklistEntries) this.blacklistEntries = [...data.blacklistEntries];
  }

  async invoke(cmd: string, args: any): Promise<any> {
    switch (cmd) {
      // Projects
      case "list_projects":
        return this.projects;
      case "create_project": {
        const newProject = { 
          id: crypto.randomUUID(), 
          createdAt: new Date().toISOString(),
          ...args 
        };
        this.projects.push(newProject);
        return newProject;
      }
      case "get_project":
        return this.projects.find(p => p.id === args.id);

      // Books
      case "list_books":
        return this.books.filter(b => b.project_id === args.projectId);
      case "create_book": {
        const newBook = { 
          id: crypto.randomUUID(), 
          status: "draft",
          orderInSeries: 1,
          createdAt: new Date().toISOString(),
          project_id: args.projectId,
          ...args 
        };
        this.books.push(newBook);
        return newBook;
      }

      // Characters
      case "list_characters":
      case "list_global_characters":
        return this.characters.filter(c => c.project_id === args.projectId);
      case "list_characters_by_book":
        return this.characters.filter(c => c.book_id === args.bookId);
      case "create_character": {
        const charData = args.character || args;
        const newChar = { id: crypto.randomUUID(), ...charData };
        this.characters.push(newChar);
        return newChar;
      }
      case "get_character":
        return this.characters.find(c => c.id === args.id);
      case "update_character": {
        const charData = args.character || args;
        const idx = this.characters.findIndex(c => c.id === charData.id);
        if (idx !== -1) this.characters[idx] = { ...this.characters[idx], ...charData };
        return {};
      }
      case "delete_character": {
        this.characters = this.characters.filter(c => c.id !== args.id);
        return {};
      }
      case "move_character_to_book": {
        const char = this.characters.find(c => c.id === args.id);
        if (char) char.book_id = args.bookId;
        return {};
      }
      case "move_character_to_project": {
        const char = this.characters.find(c => c.id === args.id);
        if (char) char.book_id = null;
        return {};
      }

      // Locations
      case "list_global_locations":
        return this.locations.filter(l => l.project_id === args.projectId);
      case "list_locations_by_book":
        return this.locations.filter(l => l.book_id === args.bookId);
      case "create_location": {
        const locData = args.location || args;
        const newLoc = { 
          id: crypto.randomUUID(), 
          ...locData, 
          project_id: locData.projectId || locData.project_id,
          book_id: locData.bookId || locData.book_id,
          symbolic_meaning: locData.symbolicMeaning || locData.symbolic_meaning || "" 
        };
        this.locations.push(newLoc);
        return newLoc;
      }
      case "update_location": {
        const locData = args.location || args;
        const idx = this.locations.findIndex(l => l.id === locData.id);
        if (idx !== -1) this.locations[idx] = { ...this.locations[idx], ...locData };
        return {};
      }
      case "delete_location": {
        this.locations = this.locations.filter(l => l.id !== args.id);
        return {};
      }
      case "move_location_to_book": {
        const loc = this.locations.find(l => l.id === args.id);
        if (loc) loc.book_id = args.bookId;
        return {};
      }
      case "move_location_to_project": {
        const loc = this.locations.find(l => l.id === args.id);
        if (loc) loc.book_id = null;
        return {};
      }

      // World Rules
      case "list_global_world_rules":
        return this.worldRules.filter(r => r.project_id === args.projectId);
      case "list_world_rules_by_book":
        return this.worldRules.filter(r => r.book_id === args.bookId);
      case "create_world_rule": {
        const ruleData = args.rule || args;
        const newRule = { 
          id: crypto.randomUUID(), 
          ...ruleData,
          project_id: ruleData.projectId || ruleData.project_id,
          book_id: ruleData.bookId || ruleData.book_id,
        };
        this.worldRules.push(newRule);
        return newRule;
      }
      case "update_world_rule": {
        const ruleData = args.rule || args;
        const idx = this.worldRules.findIndex(r => r.id === ruleData.id);
        if (idx !== -1) this.worldRules[idx] = { ...this.worldRules[idx], ...ruleData };
        return {};
      }
      case "delete_world_rule": {
        this.worldRules = this.worldRules.filter(r => r.id !== args.id);
        return {};
      }
      case "move_world_rule_to_book": {
        const rule = this.worldRules.find(r => r.id === args.id);
        if (rule) rule.book_id = args.bookId;
        return {};
      }
      case "move_world_rule_to_project": {
        const rule = this.worldRules.find(r => r.id === args.id);
        if (rule) rule.book_id = null;
        return {};
      }

      // Timeline Events
      case "list_global_timeline_events":
        return this.timelineEvents.filter(e => e.project_id === args.projectId);
      case "list_timeline_events_by_book":
        return this.timelineEvents.filter(e => e.book_id === args.bookId);
      case "create_timeline_event": {
        const eventData = args.event || args;
        const newEvent = { 
          id: crypto.randomUUID(), 
          ...eventData,
          project_id: eventData.projectId || eventData.project_id,
          book_id: eventData.bookId || eventData.book_id,
          causal_dependencies: eventData.causalDependencies || eventData.causal_dependencies || "[]"
        };
        this.timelineEvents.push(newEvent);
        return newEvent;
      }
      case "update_timeline_event": {
        const eventData = args.event || args;
        const idx = this.timelineEvents.findIndex(e => e.id === eventData.id);
        if (idx !== -1) this.timelineEvents[idx] = { ...this.timelineEvents[idx], ...eventData };
        return {};
      }
      case "delete_timeline_event": {
        this.timelineEvents = this.timelineEvents.filter(e => e.id !== args.id);
        return {};
      }
      case "move_timeline_event_to_book": {
        const ev = this.timelineEvents.find(e => e.id === args.id);
        if (ev) ev.book_id = args.bookId;
        return {};
      }
      case "move_timeline_event_to_project": {
        const ev = this.timelineEvents.find(e => e.id === args.id);
        if (ev) ev.book_id = null;
        return {};
      }

      // Relationships
      case "list_global_relationships":
        return this.relationships.filter(r => r.project_id === args.projectId);
      case "list_relationships_by_book":
        return this.relationships.filter(r => r.book_id === args.bookId);
      case "create_relationship": {
        const relData = args.relationship || args;
        const newRel = { 
          id: crypto.randomUUID(), 
          ...relData,
          project_id: relData.projectId || relData.project_id,
          book_id: relData.bookId || relData.book_id,
          character_a: relData.characterA || relData.character_a,
          character_b: relData.characterB || relData.character_b,
        };
        this.relationships.push(newRel);
        return newRel;
      }
      case "update_relationship": {
        const relData = args.relationship || args;
        const idx = this.relationships.findIndex(r => r.id === relData.id);
        if (idx !== -1) this.relationships[idx] = { ...this.relationships[idx], ...relData };
        return {};
      }
      case "delete_relationship": {
        this.relationships = this.relationships.filter(r => r.id !== args.id);
        return {};
      }
      case "move_relationship_to_book": {
        const rel = this.relationships.find(r => r.id === args.id);
        if (rel) rel.book_id = args.bookId;
        return {};
      }
      case "move_relationship_to_project": {
        const rel = this.relationships.find(r => r.id === args.id);
        if (rel) rel.book_id = null;
        return {};
      }

      // Blacklist
      case "list_global_blacklist_entries":
        return this.blacklistEntries.filter(e => e.project_id === args.projectId);
      case "list_blacklist_entries_by_book":
        return this.blacklistEntries.filter(e => e.book_id === args.bookId);
      case "create_blacklist_entry": {
        const entryData = args.entry || args;
        const newEntry = { 
          id: crypto.randomUUID(), 
          ...entryData,
          project_id: entryData.projectId || entryData.project_id,
          book_id: entryData.bookId || entryData.book_id,
        };
        this.blacklistEntries.push(newEntry);
        return newEntry;
      }
      case "update_blacklist_entry": {
        const entryData = args.entry || args;
        const idx = this.blacklistEntries.findIndex(e => e.id === entryData.id);
        if (idx !== -1) this.blacklistEntries[idx] = { ...this.blacklistEntries[idx], ...entryData };
        return {};
      }
      case "delete_blacklist_entry": {
        this.blacklistEntries = this.blacklistEntries.filter(e => e.id !== args.id);
        return {};
      }
      case "move_blacklist_entry_to_book": {
        const entry = this.blacklistEntries.find(e => e.id === args.id);
        if (entry) entry.book_id = args.bookId;
        return {};
      }
      case "move_blacklist_entry_to_project": {
        const entry = this.blacklistEntries.find(e => e.id === args.id);
        if (entry) entry.book_id = null;
        return {};
      }

      case "search_lore":
      case "search_codex": {
        const q = args.query.toLowerCase();
        const results = [];
        this.characters.forEach(c => {
          if (c.name.toLowerCase().includes(q)) {
            results.push({ entity_id: c.id, entity_type: "character", snippet: c.name });
          }
        });
        return results;
      }

      case "health_check":
        return "ok";
      case "get_app_info":
        return { version: "0.1.0-test" };

      default:
        console.warn(`MockDatabase: Command "${cmd}" not implemented.`);
        return null;
    }
  }
}

export const mockDb = new MockDatabase();
