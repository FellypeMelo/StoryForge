import { useState } from "react";
import { NarrativeFramework, BEATS_MAP } from "../../../domain/narrative-framework";
import { StoryStructure } from "../../../domain/story-structure";

interface StructurePageProps {
  onBack: () => void;
}

export default function StructurePage({ onBack }: StructurePageProps) {
  const frameworks = NarrativeFramework.all();
  const [selected, setSelected] = useState<NarrativeFramework>(frameworks[0]);
  const [beats, setBeats] = useState<string[]>(
    Array(BEATS_MAP[frameworks[0].name].length).fill(""),
  );

  const structure = StoryStructure.create(selected, beats);
  const missingCount = structure.missingBeats().length;
  const filledCount = structure.beatCount() - missingCount;

  function handleSelect(fw: NarrativeFramework) {
    setSelected(fw);
    setBeats(Array(BEATS_MAP[fw.name].length).fill(""));
  }

  function updateBeat(index: number, value: string) {
    const updated = [...beats];
    updated[index] = value;
    setBeats(updated);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-sm border border-border-subtle rounded text-text-muted hover:text-text-main hover:border-text-main transition-colors"
        >
          &larr; Voltar
        </button>
        <h1 className="text-2xl font-bold">Estrutura Narrativa</h1>
      </div>

      {/* Framework Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {frameworks.map((fw) => (
          <button
            key={fw.value}
            onClick={() => handleSelect(fw)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              selected.value === fw.value
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-zinc-800 border-zinc-700 hover:border-zinc-500"
            }`}
          >
            <div className="font-medium">{fw.name}</div>
            <div className="text-sm opacity-70">
              {BEATS_MAP[fw.name].length} beats
            </div>
          </button>
        ))}
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900">
        <span className="text-sm">
          {structure.isSuccess() ? (
            <span className="text-green-400">Estrutura completa</span>
          ) : (
            <span className="text-yellow-400">
              {missingCount} beat{missingCount > 1 ? "s" : ""} pendente{missingCount > 1 ? "s" : ""}
            </span>
          )}
        </span>
        <div className="flex-1 bg-zinc-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{
              width: `${(filledCount / structure.beatCount()) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Beat Cards */}
      <div className="space-y-4">
        {BEATS_MAP[selected.name].map((label, i) => (
          <div
            key={label}
            className="p-4 rounded-lg bg-zinc-800 border border-zinc-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-zinc-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-medium">{label}</span>
              {beats[i] ? (
                <span className="ml-auto text-green-400 text-sm">Preenchido</span>
              ) : (
                <span className="ml-auto text-zinc-500 text-sm">Vazio</span>
              )}
            </div>
            <textarea
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-200 resize-y min-h-[60px]"
              placeholder={`Descreva o beat: ${label}`}
              value={beats[i]}
              onChange={(e) => updateBeat(i, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
