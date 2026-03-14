import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CharacterList } from "../character/CharacterList";
import { CharacterWizard } from "../character/CharacterWizard";
import { CharacterDashboard } from "../character/CharacterDashboard";
import { AIGeneratorWizard } from "../character/AIGeneratorWizard";
import { TauriCharacterRepository } from "../../../infrastructure/tauri/tauri-character-repository";
import { LocationList } from "../location/LocationList";
import { LocationForm } from "../location/LocationForm";
import { WorldRuleList } from "../world-rule/WorldRuleList";
import { WorldRuleForm } from "../world-rule/WorldRuleForm";
import { TimelineList, RelationshipList, BlacklistList } from "./LoreLists";
import { TimelineEventForm, RelationshipForm, BlacklistEntryForm } from "./LoreForms";
import { SearchBar } from "../shared/SearchBar";
import { SlideOver } from "../shared/SlideOver";
import { Character } from "../../../domain/character";
import { ProjectId } from "../../../domain/value-objects/project-id";
import { CharacterId } from "../../../domain/value-objects/character-id";
import { OceanProfile, OceanTraitScore } from "../../../domain/ocean-profile";
import { HaugeArc } from "../../../domain/hauge-arc";
import { VoiceProfile, PhysicalTells } from "../../../domain/voice-profile";
import { CharacterSheet } from "../../../domain/character-sheet";
import { Location } from "../../../domain/location";
import { WorldRule } from "../../../domain/world-rule";
import { TimelineEvent } from "../../../domain/timeline-event";
import { Relationship } from "../../../domain/relationship";
import { BlacklistEntry } from "../../../domain/blacklist-entry";
import { Users, MapPin, Scroll, Clock, GitBranch, Ban } from "lucide-react";

type Tab = "characters" | "locations" | "rules" | "timeline" | "relationships" | "blacklist";
type Scope = "book" | "global";

function mapScoreToNumber(score: OceanTraitScore): number {
  switch (score) {
    case OceanTraitScore.High: return 80;
    case OceanTraitScore.Medium: return 50;
    case OceanTraitScore.Low: return 20;
    default: return 50;
  }
}

function mapNumberToScore(score: number): OceanTraitScore {
  if (score >= 70) return OceanTraitScore.High;
  if (score <= 30) return OceanTraitScore.Low;
  return OceanTraitScore.Medium;
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    for (const key of ["Validation", "Database", "NotFound", "Internal"]) {
      if (typeof obj[key] === "string") return obj[key];
    }
  }
  return JSON.stringify(error);
}

interface CodexDashboardProps {
  projectId: string;
  bookId: string;
  onBack: () => void;
}

export function CodexDashboard({ projectId, bookId, onBack }: CodexDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("characters");
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [rules, setRules] = useState<WorldRule[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [scope, setScope] = useState<Scope>("book");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [injectedIds, setInjectedIds] = useState<string[]>([]);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [viewingCharacter, setViewingCharacter] = useState<Character | null>(null);

  const characterRepo = new TauriCharacterRepository();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WorldRule | null>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);

  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [editingBlacklistEntry, setEditingBlacklistEntry] = useState<BlacklistEntry | null>(null);

  const currentProjectId = projectId;

  useEffect(() => {
    // Simulando IDs injetados pelo RAG para demonstração visual
    // Em produção isso viria de um ContextProvider ou Store (Zustand)
    setInjectedIds(characters.slice(0, 1).map((c) => c.id.value));
  }, [characters]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setIsSearching(false);
      loadData();
    } else {
      setIsSearching(true);
      handleSearch(searchQuery);
    }
  }, [activeTab, searchQuery, scope]);

  const loadData = async () => {
    // Only load if not searching
    if (searchQuery.trim() !== "") return;

    setLoading(true);
    try {
      if (activeTab === "characters") {
        const result = await characterRepo.findByProject(ProjectId.create(currentProjectId));
        if (result.success) {
          // Map CharacterSheet to Character for the UI
          setCharacters(result.data.map(sheet => Character.create({
            id: sheet.id,
            projectId: sheet.projectId,
            name: sheet.name,
            ocean_scores: {
              openness: mapScoreToNumber(sheet.ocean.openness),
              conscientiousness: mapScoreToNumber(sheet.ocean.conscientiousness),
              extraversion: mapScoreToNumber(sheet.extraversion),
              agreeableness: mapScoreToNumber(sheet.agreeableness),
              neuroticism: mapScoreToNumber(sheet.neuroticism),
            },
            hauge_wound: sheet.hauge?.wound || "",
            hauge_belief: sheet.hauge?.belief || "",
            hauge_fear: sheet.hauge?.fear || "",
            hauge_identity: sheet.hauge?.identity || "",
            hauge_essence: sheet.hauge?.essence || "",
            voice_sentence_length: sheet.voice.sentenceLength,
            voice_formality: sheet.voice.formality,
            voice_verbal_tics: JSON.stringify(sheet.voice.verbalTics),
            voice_evasion_mechanism: sheet.voice.evasionMechanism,
            physical_tells: JSON.stringify(sheet.tells.list),
          } as any)));
        }
      } else if (activeTab === "locations") {
        const command = scope === "book" ? "list_locations_by_book" : "list_global_locations";
        const params = scope === "book" ? { bookId } : { projectId: currentProjectId };
        const data = await invoke<any[]>(command, params);
        setLocations(
          data.map((d) =>
            Location.create({
              ...d,
              id: { value: d.id },
              projectId: { value: d.project_id },
              bookId: d.book_id ? { value: d.book_id } : undefined,
              name: d.name || "Sem nome",
            } as any),
          ),
        );
      } else if (activeTab === "rules") {
        const command = scope === "book" ? "list_world_rules_by_book" : "list_global_world_rules";
        const params = scope === "book" ? { bookId } : { projectId: currentProjectId };
        const data = await invoke<any[]>(command, params);
        setRules(
          data.map((d) =>
            WorldRule.create({
              ...d,
              id: { value: d.id },
              projectId: { value: d.project_id },
              bookId: d.book_id ? { value: d.book_id } : undefined,
              category: d.category || "Geral",
              content: d.content || "",
            } as any),
          ),
        );
      } else if (activeTab === "timeline") {
        const command =
          scope === "book" ? "list_timeline_events_by_book" : "list_global_timeline_events";
        const params = scope === "book" ? { bookId } : { projectId: currentProjectId };
        const data = await invoke<any[]>(command, params);
        setEvents(
          data.map((d) =>
            TimelineEvent.create({
              ...d,
              id: { value: d.id },
              projectId: { value: d.project_id },
              bookId: d.book_id ? { value: d.book_id } : undefined,
              description: d.description || "",
            } as any),
          ),
        );
      } else if (activeTab === "relationships") {
        const command =
          scope === "book" ? "list_relationships_by_book" : "list_global_relationships";
        const params = scope === "book" ? { bookId } : { projectId: currentProjectId };
        const data = await invoke<any[]>(command, params);
        setRelationships(
          data.map((d) =>
            Relationship.create({
              ...d,
              id: { value: d.id },
              projectId: { value: d.project_id },
              bookId: d.book_id ? { value: d.book_id } : undefined,
              characterAId: { value: d.character_a },
              characterBId: { value: d.character_b },
              relationshipType: d.type || "",
            } as any),
          ),
        );
      } else if (activeTab === "blacklist") {
        const command =
          scope === "book" ? "list_blacklist_entries_by_book" : "list_global_blacklist_entries";
        const params = scope === "book" ? { bookId } : { projectId: currentProjectId };
        const data = await invoke<any[]>(command, params);
        setEntries(
          data.map((d) =>
            BlacklistEntry.create({
              ...d,
              id: { value: d.id },
              projectId: { value: d.project_id },
              bookId: d.book_id ? { value: d.book_id } : undefined,
              term: d.term || "",
            } as any),
          ),
        );
      }
    } catch (error) {
      console.error("Failed to load lore data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const results = await invoke<any[]>("search_lore", {
        projectId: currentProjectId,
        bookId: scope === "book" ? bookId : null,
        query,
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // const handleDelete = async (id: string) => {
  //   try {
  //     if (activeTab === "characters") {
  //       await invoke("delete_character", { id });
  //     } else if (activeTab === "locations") {
  //       await invoke("delete_location", { id });
  //     } else if (activeTab === "rules") {
  //       await invoke("delete_world_rule", { id });
  //     }
  //     loadData();
  //   } catch (err) {
  //     console.error("Failed to delete entity:", err);
  //   }
  // };

  const handleCreateCharacter = () => {
    setViewingCharacter(null);
    const newChar = Character.generate(ProjectId.create(currentProjectId), "");
    setEditingCharacter(newChar);
    setIsWizardOpen(true);
  };

  const handleEditCharacter = (char: Character) => {
    setViewingCharacter(null);
    setEditingCharacter(char);
    setIsWizardOpen(true);
  };

  const handleViewCharacter = (char: Character) => {
    setEditingCharacter(null);
    setViewingCharacter(char);
    setIsWizardOpen(true);
  };

  const handleGenerateAI = () => {
    setIsAIGeneratorOpen(true);
  };

  const handleAIGenerated = (char: Character) => {
    setIsAIGeneratorOpen(false);
    loadData();
    handleViewCharacter(char);
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      await invoke("delete_character", { id });
      setIsWizardOpen(false);
      setViewingCharacter(null);
      loadData();
    } catch (err) {
      console.error("Failed to delete character:", err);
    }
  };

  const handleSaveCharacter = async (char: Character) => {
    try {
      const props = char.toProps();
      
      const sheet = CharacterSheet.create({
        id: char.id,
        projectId: char.projectId,
        name: char.name,
        ocean: OceanProfile.create({
          openness: mapNumberToScore(props.ocean_scores.openness),
          conscientiousness: mapNumberToScore(props.ocean_scores.conscientiousness),
          extraversion: mapNumberToScore(props.ocean_scores.extraversion),
          agreeableness: mapNumberToScore(props.ocean_scores.agreeableness),
          neuroticism: mapNumberToScore(props.ocean_scores.neuroticism),
        }),
        hauge: props.hauge_identity ? HaugeArc.create({
          wound: props.hauge_wound,
          belief: props.hauge_belief,
          fear: props.hauge_fear,
          identity: props.hauge_identity,
          essence: props.hauge_essence,
        }) : undefined,
        voice: VoiceProfile.create({
          sentenceLength: props.voice_sentence_length,
          formality: props.voice_formality,
          verbalTics: JSON.parse(props.voice_verbal_tics || "[]"),
          evasionMechanism: props.voice_evasion_mechanism,
        }),
        tells: PhysicalTells.create(JSON.parse(props.physical_tells || "[]")),
      });

      const result = await characterRepo.save(sheet);
      if (!result.success) {
        throw new Error(result.error.message);
      }

      setIsWizardOpen(false);
      setEditingCharacter(null);
      loadData();
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      console.error("Failed to save character:", msg);
    }
  };

  const handleCreateLocation = () => {
    const newLoc = Location.generate(ProjectId.create(currentProjectId), "Novo Local");
    setEditingLocation(newLoc);
    setIsLocationModalOpen(true);
  };

  const handleEditLocation = (loc: Location) => {
    setEditingLocation(loc);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = async (loc: Location) => {
    try {
      const locData = loc.toProps();
      
      // Check if location exists in our current list to decide between create or update
      const exists = locations.some(l => l.id.value === loc.id.value);

      if (!exists) {
        // Create first
        const created = await invoke<{ id: string }>("create_location", {
          projectId: currentProjectId,
          bookId: scope === "book" ? bookId : null,
          name: locData.name,
        });
        // Update with full data (since create only takes name)
        await invoke("update_location", {
          location: {
            ...locData,
            id: created.id,
            project_id: currentProjectId,
            book_id: scope === "book" ? bookId : null,
          },
        });
      } else {
        // Update existing
        await invoke("update_location", {
          location: {
            ...locData,
            id: loc.id.value,
            project_id: currentProjectId,
            book_id: loc.bookId?.value || null,
          },
        });
      }
      setIsLocationModalOpen(false);
      setEditingLocation(null);
      loadData();
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      console.error("Failed to save location:", msg);
    }
  };

  const handleCreateRule = () => {
    const newRule = WorldRule.generate(ProjectId.create(currentProjectId));
    setEditingRule(newRule);
    setIsRuleModalOpen(true);
  };

  const handleEditRule = (rule: WorldRule) => {
    setEditingRule(rule);
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = async (rule: WorldRule) => {
    try {
      const ruleData = rule.toProps();
      const exists = rules.some(r => r.id.value === rule.id.value);

      if (!exists) {
        const created = await invoke<{ id: string }>("create_world_rule", {
          projectId: currentProjectId,
          bookId: scope === "book" ? bookId : null,
          category: ruleData.category,
          content: ruleData.content,
        });
        await invoke("update_world_rule", {
          rule: {
            ...ruleData,
            id: created.id,
            project_id: currentProjectId,
            book_id: scope === "book" ? bookId : null,
          },
        });
      } else {
        await invoke("update_world_rule", {
          rule: {
            ...ruleData,
            id: rule.id.value,
            project_id: currentProjectId,
            book_id: rule.bookId?.value || null,
          },
        });
      }
      setIsRuleModalOpen(false);
      setEditingRule(null);
      loadData();
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      console.error("Failed to save world rule:", msg);
    }
  };

  const handleCreateEvent = () => {
    // We need a TimelineEvent.generate or create a blank one
    // Assuming TimelineEvent.create works with just projectId and description
    const newEvent = TimelineEvent.create({
      id: CharacterId.generate() as any, // TimelineEventId.generate()
      projectId: ProjectId.create(currentProjectId),
      bookId: scope === "book" ? { value: bookId } : undefined,
      description: "Novo Evento",
    });
    setEditingEvent(newEvent);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (event: TimelineEvent) => {
    try {
      const data = event.toProps();
      const exists = events.some(e => e.id.value === event.id.value);

      if (!exists) {
        const created = await invoke<any>("create_timeline_event", {
          projectId: currentProjectId,
          bookId: scope === "book" ? bookId : null,
          description: data.description,
        });
        await invoke("update_timeline_event", {
          event: {
            ...data,
            id: created.id,
            project_id: currentProjectId,
            book_id: scope === "book" ? bookId : null,
            causal_dependencies: [], // Backend expects snake_case and array
          },
        });
      } else {
        await invoke("update_timeline_event", {
          event: {
            ...data,
            id: event.id.value,
            project_id: currentProjectId,
            book_id: event.bookId?.value || null,
            causal_dependencies: data.causalDependencies.map(d => d.value),
          },
        });
      }
      setIsEventModalOpen(false);
      setEditingEvent(null);
      loadData();
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  const handleCreateRelationship = () => {
    if (characters.length < 2) {
      alert("Você precisa de pelo menos 2 personagens para criar um relacionamento.");
      return;
    }
    const newRel = Relationship.create({
      id: CharacterId.generate() as any,
      projectId: ProjectId.create(currentProjectId),
      bookId: scope === "book" ? { value: bookId } : undefined,
      characterAId: characters[0].id,
      characterBId: characters[1].id,
      type: "Conhecidos",
    });
    setEditingRelationship(newRel);
    setIsRelationshipModalOpen(true);
  };

  const handleEditRelationship = (rel: Relationship) => {
    setEditingRelationship(rel);
    setIsRelationshipModalOpen(true);
  };

  const handleSaveRelationship = async (rel: Relationship) => {
    try {
      const data = rel.toProps();
      const exists = relationships.some(r => r.id.value === rel.id.value);

      if (!exists) {
        const created = await invoke<any>("create_relationship", {
          projectId: currentProjectId,
          bookId: scope === "book" ? bookId : null,
          characterA: data.characterAId.value,
          characterB: data.characterBId.value,
          type: data.type,
        });
        await invoke("update_relationship", {
          relationship: {
            ...data,
            id: created.id,
            project_id: currentProjectId,
            book_id: scope === "book" ? bookId : null,
            character_a: data.characterAId.value,
            character_b: data.characterBId.value,
          },
        });
      } else {
        await invoke("update_relationship", {
          relationship: {
            ...data,
            id: rel.id.value,
            project_id: currentProjectId,
            book_id: rel.bookId?.value || null,
            character_a: data.characterAId.value,
            character_b: data.characterBId.value,
          },
        });
      }
      setIsRelationshipModalOpen(false);
      setEditingRelationship(null);
      loadData();
    } catch (error) {
      console.error("Failed to save relationship:", error);
    }
  };

  const handleCreateBlacklist = () => {
    const newEntry = BlacklistEntry.create({
      id: CharacterId.generate() as any,
      projectId: ProjectId.create(currentProjectId),
      bookId: scope === "book" ? { value: bookId } : undefined,
      term: "Novo Termo",
    });
    setEditingBlacklistEntry(newEntry);
    setIsBlacklistModalOpen(true);
  };

  const handleEditBlacklist = (entry: BlacklistEntry) => {
    setEditingBlacklistEntry(entry);
    setIsBlacklistModalOpen(true);
  };

  const handleSaveBlacklistEntry = async (entry: BlacklistEntry) => {
    try {
      const data = entry.toProps();
      const exists = entries.some(e => e.id.value === entry.id.value);

      if (!exists) {
        const created = await invoke<any>("create_blacklist_entry", {
          projectId: currentProjectId,
          bookId: scope === "book" ? bookId : null,
          term: data.term,
        });
        await invoke("update_blacklist_entry", {
          entry: {
            ...data,
            id: created.id,
            project_id: currentProjectId,
            book_id: scope === "book" ? bookId : null,
          },
        });
      } else {
        await invoke("update_blacklist_entry", {
          entry: {
            ...data,
            id: entry.id.value,
            project_id: currentProjectId,
            book_id: entry.bookId?.value || null,
          },
        });
      }
      setIsBlacklistModalOpen(false);
      setEditingBlacklistEntry(null);
      loadData();
    } catch (error) {
      console.error("Failed to save blacklist entry:", error);
    }
  };

  const handleMoveToBook = async (entityId: string) => {
    try {
      let command = "";
      if (activeTab === "characters") command = "move_character_to_book";
      else if (activeTab === "locations") command = "move_location_to_book";
      else if (activeTab === "rules") command = "move_world_rule_to_book";
      else if (activeTab === "timeline") command = "move_timeline_event_to_book";
      else if (activeTab === "relationships") command = "move_relationship_to_book";
      else if (activeTab === "blacklist") command = "move_blacklist_entry_to_book";

      if (command) {
        await invoke(command, { id: entityId, bookId });
        loadData();
        setIsWizardOpen(false);
        setIsLocationModalOpen(false);
        setIsRuleModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to move entity to book:", error);
    }
  };

  const handleMoveToProject = async (entityId: string) => {
    try {
      let command = "";
      if (activeTab === "characters") command = "move_character_to_project";
      else if (activeTab === "locations") command = "move_location_to_project";
      else if (activeTab === "rules") command = "move_world_rule_to_project";
      else if (activeTab === "timeline") command = "move_timeline_event_to_project";
      else if (activeTab === "relationships") command = "move_relationship_to_project";
      else if (activeTab === "blacklist") command = "move_blacklist_entry_to_project";

      if (command) {
        await invoke(command, { id: entityId });
        loadData();
        setIsWizardOpen(false);
        setIsLocationModalOpen(false);
        setIsRuleModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to move entity to project:", error);
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "characters", label: "Personagens", icon: Users },
    { id: "locations", label: "Locais", icon: MapPin },
    { id: "rules", label: "Regras do Mundo", icon: Scroll },
    { id: "timeline", label: "Linha do Tempo", icon: Clock },
    { id: "relationships", label: "Relacionamentos", icon: GitBranch },
    { id: "blacklist", label: "Lista Negra", icon: Ban },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
        >
          ← Voltar
        </button>
      </div>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-main">Codex da História</h1>
          <p className="text-text-muted text-sm font-sans">
            Guia de sabedoria.{" "}
            <span className="opacity-50 text-xs">
              Projeto: {projectId.slice(0, 8)} | Livro: {bookId.slice(0, 8)}
            </span>
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <SearchBar onSearch={setSearchQuery} />

          <div className="flex bg-bg-hover p-1 rounded-lg border border-border-subtle">
            <button
              onClick={() => setScope("book")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-widest uppercase transition-all ${
                scope === "book"
                  ? "bg-text-main text-bg-base shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Este Livro
            </button>
            <button
              onClick={() => setScope("global")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-widest uppercase transition-all ${
                scope === "global"
                  ? "bg-text-main text-bg-base shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Universo
            </button>
          </div>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-text-main text-bg-base shadow-lg shadow-text-main/10"
                  : "bg-bg-hover text-text-muted hover:text-text-main hover:bg-border-subtle"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <main className="min-h-[400px]">
        {isSearching ? (
          <div className="space-y-6">
            <h2 className="text-xs font-bold tracking-widest uppercase text-text-muted">
              Resultados da Busca ({searchResults.length})
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.map((res) => (
                  <div
                    key={res.entity_id}
                    className="bg-bg-hover p-4 rounded-lg border border-border-subtle hover:border-text-main transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted px-2 py-0.5 bg-bg-base rounded">
                        {res.entity_type}
                      </span>
                    </div>
                    <p className="text-sm font-serif text-text-main">{res.snippet}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-text-muted font-sans">
                Nenhuma entrada correspondente encontrada.
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="py-20 text-center font-mono text-text-muted animate-pulse">
            Consultando os arquivos...
          </div>
        ) : (
          <>
            {activeTab === "characters" && (
              <CharacterList
                characters={characters}
                onCreateNew={handleCreateCharacter}
                onSelect={handleViewCharacter}
                onGenerateAI={handleGenerateAI}
                injectedIds={injectedIds}
              />
            )}
            {activeTab === "locations" && (
              <LocationList
                locations={locations}
                onCreateNew={handleCreateLocation}
                onSelect={handleEditLocation}
                injectedIds={injectedIds}
              />
            )}
            {activeTab === "rules" && (
              <WorldRuleList
                rules={rules}
                onCreateNew={handleCreateRule}
                onSelect={handleEditRule}
                injectedIds={injectedIds}
              />
            )}
            {activeTab === "timeline" && (
              <TimelineList
                events={events}
                onCreateNew={handleCreateEvent}
                onSelect={handleEditEvent}
              />
            )}
            {activeTab === "relationships" && (
              <RelationshipList
                relationships={relationships}
                onCreateNew={handleCreateRelationship}
                onSelect={handleEditRelationship}
              />
            )}
            {activeTab === "blacklist" && (
              <BlacklistList
                entries={entries}
                onCreateNew={handleCreateBlacklist}
                onSelect={handleEditBlacklist}
              />
            )}
          </>
        )}
      </main>

      <SlideOver
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setEditingCharacter(null);
          setViewingCharacter(null);
        }}
      >
        <div className="h-full flex flex-col">
          {(editingCharacter || viewingCharacter) && (
            <div className="p-4 border-b border-border-subtle flex justify-end gap-2 bg-bg-hover/50">
              {(editingCharacter?.bookId || viewingCharacter?.bookId) ? (
                <button
                  onClick={() => handleMoveToProject((editingCharacter?.id || viewingCharacter?.id)!.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-purple-500 hover:underline"
                >
                  Mover para Universo
                </button>
              ) : (
                <button
                  onClick={() => handleMoveToBook((editingCharacter?.id || viewingCharacter?.id)!.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-text-main hover:underline"
                >
                  Mover para Este Livro
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-hidden p-6">
            {viewingCharacter && (
              <CharacterDashboard
                character={viewingCharacter}
                onEdit={handleEditCharacter}
                onDelete={handleDeleteCharacter}
              />
            )}
            {editingCharacter && (
              <CharacterWizard
                character={editingCharacter}
                onSave={handleSaveCharacter}
                onCancel={() => {
                  setEditingCharacter(null);
                  if (!viewingCharacter) {
                    setIsWizardOpen(false);
                  }
                }}
              />
            )}
          </div>
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        }}
      >
        <div className="h-full flex flex-col">
          {editingLocation && (
            <div className="p-4 border-b border-border-subtle flex justify-end gap-2 bg-bg-hover/50">
              {editingLocation.bookId ? (
                <button
                  onClick={() => handleMoveToProject(editingLocation.id.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-purple-500 hover:underline"
                >
                  Mover para Universo
                </button>
              ) : (
                <button
                  onClick={() => handleMoveToBook(editingLocation.id.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-text-main hover:underline"
                >
                  Mover para Este Livro
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            {editingLocation && (
              <LocationForm
                location={editingLocation}
                onSave={handleSaveLocation}
                onCancel={() => {
                  setIsLocationModalOpen(false);
                  setEditingLocation(null);
                }}
              />
            )}
          </div>
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isRuleModalOpen}
        onClose={() => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
        }}
      >
        <div className="h-full flex flex-col">
          {editingRule && (
            <div className="p-4 border-b border-border-subtle flex justify-end gap-2 bg-bg-hover/50">
              {editingRule.bookId ? (
                <button
                  onClick={() => handleMoveToProject(editingRule.id.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-purple-500 hover:underline"
                >
                  Mover para Universo
                </button>
              ) : (
                <button
                  onClick={() => handleMoveToBook(editingRule.id.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-text-main hover:underline"
                >
                  Mover para Este Livro
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            {editingRule && (
              <WorldRuleForm
                rule={editingRule}
                onSave={handleSaveRule}
                onCancel={() => {
                  setIsRuleModalOpen(false);
                  setEditingRule(null);
                }}
              />
            )}
          </div>
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
      >
        <div className="h-full flex flex-col">
          {editingEvent && (
            <div className="p-4 border-b border-border-subtle flex justify-end gap-2 bg-bg-hover/50">
              {editingEvent.bookId ? (
                <button
                  onClick={() => handleMoveToProject(editingEvent.id.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-purple-500 hover:underline"
                >
                  Mover para Universo
                </button>
              ) : (
                <button
                  onClick={() => handleMoveToBook(editingEvent.id.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-text-main hover:underline"
                >
                  Mover para Este Livro
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            {editingEvent && (
              <TimelineEventForm
                event={editingEvent}
                onSave={handleSaveEvent}
                onCancel={() => {
                  setIsEventModalOpen(false);
                  setEditingEvent(null);
                }}
              />
            )}
          </div>
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isRelationshipModalOpen}
        onClose={() => {
          setIsRelationshipModalOpen(false);
          setEditingRelationship(null);
        }}
      >
        <div className="h-full flex flex-col">
          {editingRelationship && (
            <div className="p-4 border-b border-border-subtle flex justify-end gap-2 bg-bg-hover/50">
              {editingRelationship.bookId ? (
                <button
                  onClick={() => handleMoveToProject(editingRelationship.id.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-purple-500 hover:underline"
                >
                  Mover para Universo
                </button>
              ) : (
                <button
                  onClick={() => handleMoveToBook(editingRelationship.id.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-text-main hover:underline"
                >
                  Mover para Este Livro
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            {editingRelationship && (
              <RelationshipForm
                relationship={editingRelationship}
                characters={characters}
                onSave={handleSaveRelationship}
                onCancel={() => {
                  setIsRelationshipModalOpen(false);
                  setEditingRelationship(null);
                }}
              />
            )}
          </div>
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isBlacklistModalOpen}
        onClose={() => {
          setIsBlacklistModalOpen(false);
          setEditingBlacklistEntry(null);
        }}
      >
        <div className="h-full flex flex-col">
          {editingBlacklistEntry && (
            <div className="p-4 border-b border-border-subtle flex justify-end gap-2 bg-bg-hover/50">
              {editingBlacklistEntry.bookId ? (
                <button
                  onClick={() => handleMoveToProject(editingBlacklistEntry.id.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-purple-500 hover:underline"
                >
                  Mover para Universo
                </button>
              ) : (
                <button
                  onClick={() => handleMoveToBook(editingBlacklistEntry.id.value)}
                  className="text-[10px] font-bold tracking-widest uppercase text-text-main hover:underline"
                >
                  Mover para Este Livro
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            {editingBlacklistEntry && (
              <BlacklistEntryForm
                entry={editingBlacklistEntry}
                onSave={handleSaveBlacklistEntry}
                onCancel={() => {
                  setIsBlacklistModalOpen(false);
                  setEditingBlacklistEntry(null);
                }}
              />
            )}
          </div>
        </div>
      </SlideOver>

      <SlideOver
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
      >
        <div className="h-full flex items-center justify-center bg-bg-hover/20 p-6">
          <AIGeneratorWizard
            projectId={projectId}
            repository={characterRepo}
            onGenerated={handleAIGenerated}
            onCancel={() => setIsAIGeneratorOpen(false)}
          />
        </div>
      </SlideOver>
    </div>
  );
}
