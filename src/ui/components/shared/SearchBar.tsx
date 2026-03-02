import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-text-main transition-colors" size={18} />
      <input 
        type="text" 
        placeholder="Pesquisar sabedoria..." 
        onChange={(e) => onSearch(e.target.value)}
        className="bg-bg-hover border border-border-subtle pl-10 pr-4 py-2 rounded-lg font-sans text-sm focus:border-text-main outline-none w-full md:w-64 transition-all"
      />
    </div>
  );
}


