import { useState } from "react";
import { ChapterId } from "../../../domain/value-objects/chapter-id";
import { ChapterOutline } from "../../../domain/chapter-outline";
import { SceneBeat, DisasterType } from "../../../domain/scene-beat";
import { SequelBeat } from "../../../domain/sequel-beat";
import { Cliffhanger, CliffhangerType } from "../../../domain/cliffhanger";
import { ScenePolarity } from "../../../domain/scene-grid";

interface ChaptersPageProps {
  onBack: () => void;
}

function createDemoOutlines(): ChapterOutline[] {
  const scene1 = SceneBeat.create(
    "Find the hidden map",
    "Library is on fire and guarded",
    DisasterType.NoAndWorse(),
  );
  const sequel1 = SequelBeat.create(
    "Panics about losing the only connection to grandfather",
    [
      "Run into fire and risk death",
      "Abandon quest and fail everything forever",
      "Wait for firemen and lose the map to looters",
    ],
    "Decides to run in with wet clothes",
  );
  const scene2 = SceneBeat.create(
    "Search burning shelves for real map",
    "Ceiling collapses blocking the exit",
    DisasterType.YesBut(),
  );
  const sequel2 = SequelBeat.create(
    "Terrified but desperate for answers",
    [
      "Stay trapped and lose all hope forever",
      "Risk crushing injury to dig through rubble",
      "Sacrifice clothes as torch and risk fire spread",
    ],
    "Decides to dig through the rubble with bare hands",
  );
  const cliff1 = Cliffhanger.create(
    CliffhangerType.Climactic(),
    "Finds the map but realizes it is a fake",
  );

  const chapter1 = ChapterOutline.create(
    ChapterId.generate(),
    1,
    [scene1, sequel1, scene2, sequel2],
    cliff1,
    ScenePolarity.create("positive"),
    ScenePolarity.create("negative"),
  );

  const scene3 = SceneBeat.create(
    "Confront the traitor ally",
    "Ally reveals they were hired by the real villain",
    DisasterType.NoAndWorse(),
  );
  const sequel3 = SequelBeat.create(
    "Feels betrayed and questions all trust",
    [
      "Cut ties and lose the only ally forever",
      "Trust them again and risk worst betrayal",
      "Sacrifice the mission to save the relationship",
    ],
    "Decides to play along temporarily",
  );
  const cliff2 = Cliffhanger.create(
    CliffhangerType.PrePoint(),
    "The ally sends a secret message to the real villain",
  );

  const chapter2 = ChapterOutline.create(
    ChapterId.generate(),
    2,
    [scene3, sequel3],
    cliff2,
    ScenePolarity.create("negative"),
    ScenePolarity.create("positive"),
  );

  return [chapter1, chapter2];
}

export default function ChaptersPage({ onBack }: ChaptersPageProps) {
  const [outlines] = useState<ChapterOutline[]>(() => createDemoOutlines());
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const outline = outlines[selectedChapter];

  if (!outline) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-sm border border-border-subtle rounded text-text-muted hover:text-text-main transition-colors mb-4"
        >
          &larr; Voltar
        </button>
        <h1 className="text-2xl font-bold mb-4">Planejamento de Capítulos</h1>
        <p className="text-text-muted">No chapters planned yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-sm border border-border-subtle rounded text-text-muted hover:text-text-main transition-colors"
        >
          &larr; Voltar
        </button>
        <h1 className="text-2xl font-bold">Planejamento de Capítulos</h1>
      </div>

      {/* Chapter List */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {outlines.map((o, i) => (
          <button
            key={o.getChapterNumber()}
            onClick={() => setSelectedChapter(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              i === selectedChapter
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Cap. {o.getChapterNumber()}
          </button>
        ))}
      </div>

      {/* Polarity Indicator */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Polaridade:</span>
          <span
            className={`px-2 py-1 rounded text-sm font-mono ${
              outline.hasPolarityWarning()
                ? "bg-red-900 text-red-300"
                : "bg-green-900 text-green-300"
            }`}
          >
            {outline.getStartPolarity()} &rarr; {outline.getEndPolarity()}
          </span>
          {outline.hasPolarityWarning() && (
            <span className="text-xs text-red-400 ml-2">
              {outline.getPolarityWarning()}
            </span>
          )}
        </div>
      </div>

      {/* Beats List */}
      <div className="space-y-3">
        {outline.getBeats().map((beat, i) => {
          const isScene = "goal" in beat;

          return (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                isScene
                  ? "bg-blue-950 border-blue-800"
                  : "bg-amber-950 border-amber-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    isScene
                      ? "bg-blue-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {isScene ? "CENA" : "SEQUELA"}
                </span>
                <span className="text-xs text-zinc-500">Beat {i + 1}</span>
              </div>

              {isScene ? (
                <div className="space-y-1 text-sm text-zinc-300">
                  <div>
                    <span className="text-zinc-500">Objetivo:</span>{" "}
                    {(beat as SceneBeat).goal}
                  </div>
                  <div>
                    <span className="text-zinc-500">Conflito:</span>{" "}
                    {(beat as SceneBeat).conflict}
                  </div>
                  <div>
                    <span className="text-zinc-500">Desastre:</span>{" "}
                    {(beat as SceneBeat).disaster.label}
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm text-zinc-300">
                  <div>
                    <span className="text-zinc-500">Reação:</span>{" "}
                    {(beat as SequelBeat).reaction}
                  </div>
                  <div>
                    <span className="text-zinc-500">Dilema:</span>
                    <ul className="list-disc list-inside ml-2">
                      {(beat as SequelBeat).dilemmaOptions.map((opt, j) => (
                        <li key={j} className="text-zinc-400">{opt}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-zinc-500">Decisão:</span>{" "}
                    {(beat as SequelBeat).decision}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Cliffhanger */}
        <div className="p-4 rounded-lg border border-red-800 bg-red-950">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
              CLIFFHANGER
            </span>
            <span className="text-xs text-zinc-500">
              {outline.getCliffhanger().type.label}
            </span>
          </div>
          <p className="text-sm text-zinc-300">
            {outline.getCliffhanger().description}
          </p>
        </div>
      </div>
    </div>
  );
}
