import { Location } from "../../domain/location";
import { MapPin, ShieldQuestion } from "lucide-react";

interface LocationListProps {
  locations: Location[];
  onSelect?: (location: Location) => void;
  onCreateNew?: () => void;
}

export function LocationList({ 
  locations, 
  onSelect,
  onCreateNew 
}: LocationListProps) {
  if (locations.length === 0) {
    return (
      <div className="py-20 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 bg-bg-hover rounded-full text-text-muted">
          <ShieldQuestion size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-serif text-text-main">No locations found</h3>
          <p className="text-text-muted max-w-xs mx-auto">
            Your world needs places. Add your first location to begin.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-text-main text-bg-base px-6 py-2.5 rounded font-sans font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          Create Location
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold tracking-widest uppercase text-text-muted">
          Locations ({locations.length})
        </h2>
        <button
          onClick={onCreateNew}
          className="text-xs font-bold tracking-widest uppercase text-text-main hover:underline cursor-pointer"
        >
          + Add New
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id.value}
            onClick={() => onSelect?.(loc)}
            className="group bg-bg-base border border-border-subtle p-6 rounded-lg space-y-4 hover:border-text-main transition-all duration-300 cursor-pointer flex flex-col h-full"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-bg-hover rounded group-hover:bg-text-main group-hover:text-bg-base transition-colors duration-300">
                <MapPin size={24} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-mono tracking-tighter text-text-muted opacity-50 uppercase">
                {loc.id.value.slice(0, 8)}
              </span>
            </div>

            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-serif text-text-main group-hover:tracking-tight transition-all duration-300">
                {loc.name}
              </h3>
              <p className="text-xs text-text-muted font-sans line-clamp-2">
                {loc.description || "No description"}
              </p>
            </div>

            <div className="pt-4 border-t border-border-subtle flex justify-between items-center">
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted italic">
                {loc.symbolicMeaning || "No symbolic meaning"}
              </span>
              <span className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity font-serif">
                →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
