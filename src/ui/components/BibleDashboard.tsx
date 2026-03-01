import { useState } from "react";
import { CharacterList } from "./CharacterList";
import { LocationList } from "./LocationList";
import { WorldRuleList } from "./WorldRuleList";
import { TimelineList, RelationshipList, BlacklistList } from "./LoreLists";
import { SearchBar } from "./SearchBar";
import { Users, MapPin, Scroll, Clock, GitBranch, Ban } from "lucide-react";

type Tab = "characters" | "locations" | "rules" | "timeline" | "relationships" | "blacklist";

export function BibleDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("characters");

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
        {activeTab === "characters" && <CharacterList characters={[]} onCreateNew={() => {}} />}
        {activeTab === "locations" && <LocationList locations={[]} onCreateNew={() => {}} />}
        {activeTab === "rules" && <WorldRuleList rules={[]} onCreateNew={() => {}} />}
        {activeTab === "timeline" && <TimelineList events={[]} onCreateNew={() => {}} />}
        {activeTab === "relationships" && <RelationshipList relationships={[]} onCreateNew={() => {}} />}
        {activeTab === "blacklist" && <BlacklistList entries={[]} onCreateNew={() => {}} />}
      </main>
    </div>
  );
}

