import { useState, useEffect, useCallback } from "react";
import { AiismBlacklist } from "../../../domain/aiism-blacklist";
import { AiismDetector } from "../../../domain/aiism-detector";
import { MruValidator } from "../../../domain/mru-validator";
import { LlmPort } from "../../../domain/ideation/ports/llm-port";

interface WritingPageProps {
  llmPort: LlmPort;
  onBack: () => void;
}

interface Highlight {
  start: number;
  end: number;
  text: string;
  category: string;
  tooltip: string;
  type: "aiism" | "mru";
}

function parseLlmResponse(text: string): { draft: string; critique: string; finalVersion: string } {
  try {
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) ||
      text.match(/```\s*([\s\S]*?)\s*```/);
    const cleanJson = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(cleanJson);
  } catch {
    return { draft: text, critique: "Could not parse", finalVersion: text };
  }
}

export function WritingPage({ llmPort, onBack }: WritingPageProps) {
  const [content, setContent] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState("");
  const [critique, setCritique] = useState("");
  const [finalVersion, setFinalVersion] = useState("");

  function runAnalysis(text: string) {
    const blacklist = AiismBlacklist.default();
    const aiismResult = AiismDetector.scan(text, blacklist);
    const mruResult = MruValidator.scan(text);

    const newHighlights: Highlight[] = [];

    for (const finding of aiismResult.findings) {
      const idx = text.toLowerCase().indexOf(finding.term.toLowerCase());
      if (idx !== -1) {
        newHighlights.push({
          start: idx,
          end: idx + finding.term.length,
          text: finding.term,
          category: finding.category,
          tooltip: finding.reason,
          type: "aiism",
        });
      }
    }

    for (const violation of mruResult.violations) {
      const idx = text.toLowerCase().indexOf(violation.snippet.toLowerCase());
      if (idx !== -1) {
        newHighlights.push({
          start: idx,
          end: idx + violation.snippet.length,
          text: violation.snippet,
          category: "tell",
          tooltip: violation.suggestion,
          type: "mru",
        });
      }
    }

    setHighlights(newHighlights);
  }

  const handleContentChange = (value: string) => {
    setContent(value);
    runAnalysis(value);
  };

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim()) {
        localStorage.setItem("storyforge_draft_", content);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);

  // Handle text selection for contextual actions
  const handleTextSelect = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      setSelectedText(sel.toString().trim());
    }
  }, []);

  async function handleRewrite() {
    if (!selectedText) return;
    console.log("Rewrite selection:", selectedText);
  }

  async function handleExpand() {
    if (!selectedText) return;
    console.log("Expand selection:", selectedText);
  }

  async function handleRefine() {
    if (!selectedText) return;
    console.log("Refine selection:", selectedText);
  }

  async function handleGenerateProse() {
    setIsGenerating(true);
    try {
      const response = await llmPort.complete(
        `You are writing prose for: "Hero discovers the hidden betrayal". POV: third-limited. Character: Aria.
three-step RSIP process.

Passo 1: Write the visceral draft.
Passo 2: Critique the draft.
Passo 3: Provide the VERSÃO FINAL.

Respond as JSON: {"draft": "...", "critique": "...", "finalVersion": "..."}`,
        { temperature: 0.9, maxTokens: 2500 },
      );
      const parsed = parseLlmResponse(response.text);
      setDraft(parsed.draft);
      setCritique(parsed.critique);
      setFinalVersion(parsed.finalVersion);
      handleContentChange(parsed.finalVersion);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-200">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-sm border border-zinc-700 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          &larr; Voltar
        </button>
        <h1 className="text-lg font-bold">Editor de Escrita</h1>
        <div className="flex-1" />
        {selectedText && (
          <div className="flex gap-2">
            <button
              onClick={handleRewrite}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded transition-colors"
            >
              Reescrever com EPRL
            </button>
            <button
              onClick={handleExpand}
              className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded transition-colors"
            >
              Expandir
            </button>
            <button
              onClick={handleRefine}
              className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
            >
              Refinar
            </button>
          </div>
        )}
        <button
          onClick={handleGenerateProse}
          disabled={isGenerating}
          className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 rounded transition-colors disabled:opacity-50"
        >
          {isGenerating ? "Gerando..." : "Gerar Prosa"}
        </button>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Beat Sheet / Context + Alerts */}
        <div className="w-64 border-r border-zinc-800 p-4 space-y-4 overflow-y-auto">
          <h2 className="text-sm font-bold text-zinc-400 uppercase">Beats</h2>
          <div className="space-y-2">
            <div className="p-2 bg-blue-950 border border-blue-800 rounded text-xs">
              <div className="font-bold text-blue-300">CENA</div>
              <div className="text-zinc-400 mt-1">Hero discovers the hidden betrayal</div>
            </div>
            <div className="p-2 bg-amber-950 border border-amber-800 rounded text-xs">
              <div className="font-bold text-amber-300">SEQUELA</div>
              <div className="text-zinc-400 mt-1">Processes the shock, decides how to respond</div>
            </div>
          </div>

          {/* AI-ism / MRU alerts */}
          {highlights.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-yellow-400 uppercase">Alertas</h3>
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className={`p-2 rounded text-xs border ${
                    h.type === "aiism"
                      ? "bg-yellow-950 border-yellow-800 text-yellow-300"
                      : "bg-orange-950 border-orange-800 text-orange-300"
                  }`}
                  title={h.tooltip}
                >
                  <span className="font-bold">{h.text}</span>
                  <div className="text-zinc-500 mt-0.5">{h.category}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center: Editor */}
        <div className="flex-1 p-4 overflow-y-auto">
          <textarea
            className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-200 resize-none font-serif leading-relaxed text-sm focus:outline-none focus:border-blue-600"
            placeholder="Comece a escrever..."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onMouseUp={handleTextSelect}
            onKeyUp={handleTextSelect}
          />
        </div>

        {/* Right: RSIP Output Panel */}
        {(draft || critique || finalVersion) && (
          <div className="w-80 border-l border-zinc-800 p-4 space-y-4 overflow-y-auto">
            <h2 className="text-sm font-bold text-zinc-400 uppercase">RSIP Output</h2>

            {draft && (
              <div className="p-3 bg-zinc-900 rounded border border-zinc-700">
                <h3 className="text-xs font-bold text-zinc-500 mb-1">RASCUNHO</h3>
                <p className="text-xs text-zinc-300 font-serif leading-relaxed">{draft}</p>
              </div>
            )}

            {critique && (
              <div className="p-3 bg-red-950 rounded border border-red-900">
                <h3 className="text-xs font-bold text-red-400 mb-1">CRÍTICA</h3>
                <p className="text-xs text-red-300 font-serif leading-relaxed">{critique}</p>
              </div>
            )}

            {finalVersion && (
              <div className="p-3 bg-green-950 rounded border border-green-900">
                <h3 className="text-xs font-bold text-green-400 mb-1">VERSÃO FINAL</h3>
                <p className="text-xs text-green-300 font-serif leading-relaxed">{finalVersion}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WritingPage;
