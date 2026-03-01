import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CharacterList } from "../character/CharacterList";
import { CharacterWizard } from "../character/CharacterWizard";
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
import { Users, MapPin, Scroll, Clock, GitBranch, Ban } from "lucide-react";

type Tab = "characters" | "locations" | "rules" | "timeline" | "relationships" | "blacklist";

export function BibleDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("characters");
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [rules, setRules] = useState<WorldRule[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [injectedIds, setInjectedIds] = useState<string[]>([]);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WorldRule | null>(null);
  
  // Mock project ID for now (until Milestone 1 full project management is active)
  const currentProjectId = "550e8400-e29b-41d4-a716-446655440000";

  useEffect(() => {
    // Simulando IDs injetados pelo RAG para demonstração visual
    // Em produção isso viria de um ContextProvider ou Store (Zustand)
    setInjectedIds(characters.slice(0, 1).map(c => c.id.value));
  }, [characters]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setIsSearching(false);
      loadData();
    } else {
      setIsSearching(true);
      handleSearch(searchQuery);
    }
  }, [activeTab, searchQuery]);

  const loadData = async () => {
    // Only load if not searching
    if (searchQuery.trim() !== "") return;
    
    setLoading(true);
    try {
      if (activeTab === "characters") {
        const data = await invoke<any[]>("list_characters", { projectId: currentProjectId });
        setCharacters(data.map(d => Character.create({
          ...d,
          id: { value: d.id },
          projectId: { value: d.project_id },
          name: d.name || "Sem nome",
        } as any)));
      } else if (activeTab === "locations") {
        const data = await invoke<any[]>("list_locations", { projectId: currentProjectId });
        setLocations(data.map(d => Location.create({
          ...d,
          id: { value: d.id },
          projectId: { value: d.project_id },
          name: d.name || "Sem nome",
        } as any)));
      } else if (activeTab === "rules") {
        const data = await invoke<any[]>("list_world_rules", { projectId: currentProjectId });
        setRules(data.map(d => WorldRule.create({
          ...d,
          id: { value: d.id },
          projectId: { value: d.project_id },
          category: d.category || "Geral",
          content: d.content || "",
        } as any)));
      }
    } catch (error) {
      console.error("Failed to load lore data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const results = await invoke<any[]>("search_lore", { projectId: currentProjectId, query });
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleCreateCharacter = () => {
    const newChar = Character.generate(ProjectId.create(currentProjectId), "");
    setEditingCharacter(newChar);
    setIsWizardOpen(true);
  };

  const handleEditCharacter = (char: Character) => {
    setEditingCharacter(char);
    setIsWizardOpen(true);
  };

  const handleSaveCharacter = async (char: Character) => {
    try {
      // In a real app, you'd check if it's new or existing. 
      // For this UI demo, we'll just try to create/update.
      const charData = char.toProps();
      await invoke("create_character", { 
        projectId: currentProjectId, 
        name: charData.name 
      });
      // After creation, update the other fields (simplified for now)
      await invoke("update_character", { 
        character: {
          ...charData,
          id: charData.id.value,
          project_id: charData.projectId.value,
          // Map snake_case for Rust if needed, but our toProps should be consistent
        } 
      });
      
      setIsWizardOpen(false);
      setEditingCharacter(null);
      loadData();
    } catch (error) {
      console.error("Failed to save character:", error);
    }
  };

  const handleCreateLocation = () => {
    const newLoc = Location.generate(ProjectId.create(currentProjectId), "");
    setEditingLocation(newLoc);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = async (loc: Location) => {
    try {
      const locData = loc.toProps();
      await invoke("create_location", { 
        projectId: currentProjectId, 
        name: locData.name 
      });
      // Simplified update for now
      await invoke("update_location", {
        location: {
          ...locData,
          id: locData.id.value,
          project_id: locData.projectId.value,
        }
      });
      setIsLocationModalOpen(false);
      setEditingLocation(null);
      loadData();
    } catch (error) {
      console.error("Failed to save location:", error);
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
      await invoke("create_world_rule", { 
        projectId: currentProjectId, 
        category: ruleData.category,
        content: ruleData.content
      });
      // Simplified update for now
      await invoke("update_world_rule", {
        rule: {
          ...ruleData,
          id: ruleData.id.value,
          project_id: ruleData.projectId.value,
        }
      });
      setIsRuleModalOpen(false);
      setEditingRule(null);
      loadData();
    } catch (error) {
      console.error("Failed to save world rule:", error);
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-main">Bíblia da História</h1>
          <p className="text-text-muted text-sm font-sans">O guia definitivo para a sabedoria e lógica da sua história.</p>
        </div>
        <SearchBar onSearch={setSearchQuery} />
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
                  <div key={res.entity_id} className="bg-bg-hover p-4 rounded-lg border border-border-subtle hover:border-text-main transition-colors">
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
                onSelect={handleEditCharacter}
                injectedIds={injectedIds} 
              />
            )}
            {activeTab === "locations" && <LocationList locations={locations} onCreateNew={handleCreateLocation} injectedIds={injectedIds} />}
            {activeTab === "rules" && <WorldRuleList rules={rules} onCreateNew={handleCreateRule} injectedIds={injectedIds} />}
            {activeTab === "timeline" && <TimelineList events={[]} onCreateNew={() => {}} />}
            {activeTab === "relationships" && <RelationshipList relationships={[]} onCreateNew={() => {}} />}
            {activeTab === "blacklist" && <BlacklistList entries={[]} onCreateNew={() => {}} />}
          </>
        )}
      </main>

      <SlideOver 
        isOpen={isWizardOpen} 
        onClose={() => {
          setIsWizardOpen(false);
          setEditingCharacter(null);
        }}
      >
        {editingCharacter && (
          <CharacterWizard 
            character={editingCharacter}
            onSave={handleSaveCharacter}
            onCancel={() => {
              setIsWizardOpen(false);
              setEditingCharacter(null);
            }}
          />
        )}
      </SlideOver>

      <SlideOver 
        isOpen={isLocationModalOpen} 
        onClose={() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        }}
      >
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
      </SlideOver>

      <SlideOver 
        isOpen={isRuleModalOpen} 
        onClose={() => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
        }}
      >
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
      </SlideOver>
    </div>
  );
}



