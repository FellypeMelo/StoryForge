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
import { SearchBar } from "../shared/SearchBar";
import { SlideOver } from "../shared/SlideOver";
import { Character } from "../../../domain/character";
import { ProjectId } from "../../../domain/value-objects/project-id";
import { Location } from "../../../domain/location";
import { WorldRule } from "../../../domain/world-rule";
import { TimelineEvent } from "../../../domain/timeline-event";
import { Relationship } from "../../../domain/relationship";
import { BlacklistEntry } from "../../../domain/blacklist-entry";
import { Users, MapPin, Scroll, Clock, GitBranch, Ban } from "lucide-react";

type Tab = "characters" | "locations" | "rules" | "timeline" | "relationships" | "blacklist";
type Scope = "book" | "global";

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
        const command = scope === "book" ? "list_characters_by_book" : "list_global_characters";
        const params = scope === "book" ? { bookId } : { projectId: currentProjectId };
        const data = await invoke<any[]>(command, params);
        setCharacters(
          data.map((d) =>
            Character.create({
              ...d,
              id: { value: d.id },
              projectId: { value: d.project_id },
              bookId: d.book_id ? { value: d.book_id } : undefined,
              name: d.name || "Sem nome",
            } as any),
          ),
        );
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
      const charData = char.toProps();
      const payload = {
        ...charData,
        project_id: currentProjectId,
        book_id: scope === "book" ? bookId : null,
      };

      // Try update first, if it fails (not found), create
      try {
        await invoke("update_character", { character: payload });
      } catch (err) {
        await invoke("create_character", { character: payload });
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

  const handleSaveLocation = async (loc: Location) => {
    try {
      const locData = loc.toProps();
      const created = await invoke<{ id: string }>("create_location", {
        projectId: currentProjectId,
        bookId: scope === "book" ? bookId : null,
        name: locData.name,
      });
      await invoke("update_location", {
        location: {
          ...locData,
          id: created.id,
          project_id: currentProjectId,
          book_id: scope === "book" ? bookId : null,
        },
      });
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

  const handleSaveRule = async (rule: WorldRule) => {
    try {
      const ruleData = rule.toProps();
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
      setIsRuleModalOpen(false);
      setEditingRule(null);
      loadData();
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      console.error("Failed to save world rule:", msg);
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
                injectedIds={injectedIds}
              />
            )}
            {activeTab === "rules" && (
              <WorldRuleList
                rules={rules}
                onCreateNew={handleCreateRule}
                injectedIds={injectedIds}
              />
            )}
            {activeTab === "timeline" && <TimelineList events={events} onCreateNew={() => {}} />}
            {activeTab === "relationships" && (
              <RelationshipList relationships={relationships} onCreateNew={() => {}} />
            )}
            {activeTab === "blacklist" && (
              <BlacklistList entries={entries} onCreateNew={() => {}} />
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
