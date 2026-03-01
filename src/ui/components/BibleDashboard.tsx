import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CharacterList } from "./CharacterList";
import { LocationList } from "./LocationList";
import { WorldRuleList } from "./WorldRuleList";
import { TimelineList, RelationshipList, BlacklistList } from "./LoreLists";
import { SearchBar } from "./SearchBar";
import { Character } from "../../domain/character";
import { Location } from "../../domain/location";
import { WorldRule } from "../../domain/world-rule";
import { Users, MapPin, Scroll, Clock, GitBranch, Ban } from "lucide-react";

type Tab = "characters" | "locations" | "rules" | "timeline" | "relationships" | "blacklist";

export function BibleDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("characters");
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [rules, setRules] = useState<WorldRule[]>([]);
  
  // Mock project ID for now (until Milestone 1 full project management is active)
  const currentProjectId = "default-project";

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "characters") {
        const data = await invoke<any[]>("list_characters", { projectId: currentProjectId });
        // Em um projeto real, converteríamos os POJOs em instâncias da classe Character
        // mas aqui os Lists esperam as instâncias para chamarem .id.value etc.
        // Como o invoke retorna objetos planos, precisamos ter cuidado.
        // A CharacterList usa char.id.value, então os mocks devem ser compatíveis.
        setCharacters(data.map(d => Character.create({
          ...d,
          id: { value: d.id },
          projectId: { value: d.project_id }
        } as any)));
      } else if (activeTab === "locations") {
        const data = await invoke<any[]>("list_locations", { projectId: currentProjectId });
        setLocations(data.map(d => Location.create({
          ...d,
          id: { value: d.id },
          projectId: { value: d.project_id }
        } as any)));
      } else if (activeTab === "rules") {
        const data = await invoke<any[]>("list_world_rules", { projectId: currentProjectId });
        setRules(data.map(d => WorldRule.create({
          ...d,
          id: { value: d.id },
          projectId: { value: d.project_id }
        } as any)));
      }
    } catch (error) {
      console.error("Failed to load lore data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    const name = prompt("Location Name:");
    if (name) {
      await invoke("create_location", { projectId: currentProjectId, name });
      loadData();
    }
  };

  const handleCreateRule = async () => {
    const category = prompt("Category (e.g. Magic):");
    const content = prompt("Rule Content:");
    if (category && content) {
      await invoke("create_world_rule", { projectId: currentProjectId, category, content });
      loadData();
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "characters", label: "Characters", icon: Users },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "rules", label: "World Rules", icon: Scroll },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "relationships", label: "Relationships", icon: GitBranch },
    { id: "blacklist", label: "Blacklist", icon: Ban },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-main">Story Bible</h1>
          <p className="text-text-muted text-sm font-sans">The definitive guide to your story's lore and logic.</p>
        </div>
        <SearchBar onSearch={(q) => console.log("Searching for:", q)} />
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
        {loading ? (
          <div className="py-20 text-center font-mono text-text-muted animate-pulse">
            Consulting the archives...
          </div>
        ) : (
          <>
            {activeTab === "characters" && <CharacterList characters={characters} onCreateNew={() => {}} />}
            {activeTab === "locations" && <LocationList locations={locations} onCreateNew={handleCreateLocation} />}
            {activeTab === "rules" && <WorldRuleList rules={rules} onCreateNew={handleCreateRule} />}
            {activeTab === "timeline" && <TimelineList events={[]} onCreateNew={() => {}} />}
            {activeTab === "relationships" && <RelationshipList relationships={[]} onCreateNew={() => {}} />}
            {activeTab === "blacklist" && <BlacklistList entries={[]} onCreateNew={() => {}} />}
          </>
        )}
      </main>
    </div>
  );
}


