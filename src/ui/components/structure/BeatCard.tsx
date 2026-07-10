interface BeatCardProps {
  index: number;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function BeatCard({ index, label, value, onChange, onBlur }: BeatCardProps) {
  const filled = value.trim().length > 0;
  return (
    <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle">
      <div className="flex items-center gap-2 mb-2 font-sans">
        <span className="text-sm font-mono text-text-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="font-medium text-text-main">{label}</span>
        <span className={`ml-auto text-sm ${filled ? "text-success" : "text-text-muted"}`}>
          {filled ? "Preenchido" : "Vazio"}
        </span>
      </div>
      <textarea
        aria-label={`Beat: ${label}`}
        className="w-full bg-bg-base border border-border-subtle rounded-lg p-2 text-sm text-text-main resize-y min-h-[60px] placeholder:text-text-muted focus:border-border-default"
        placeholder={`Descreva o beat: ${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </div>
  );
}
