// @vitest-environment node
//
// End-to-end review against a LIVE llama.cpp turboquant server + real GGUF model.
// Gated by E2E_LLM=1 so the normal suite never makes network/model calls.
// Run: E2E_LLM=1 LLAMA_URL=http://127.0.0.1:8080 npx vitest run src/__e2e__
//
import { describe, it, expect, beforeAll } from "vitest";
import { LlamaCppAdapter } from "../infrastructure/llm/llama-cpp-adapter";
import { OpenAiAdapter } from "../infrastructure/llm/openai-adapter";
import { LlamaCppEmbeddingAdapter } from "../infrastructure/llm/llamacpp-embedding-adapter";
import { LlmRouter } from "../infrastructure/llm/llm-router";
import { CircuitBreakerDecorator } from "../infrastructure/llm/circuit-breaker-decorator";
import { ExtractClichesUseCase } from "../application/ideation/extract-cliches";
import { GeneratePremisesUseCase } from "../application/ideation/generate-premises";
import { ValidatePremiseUseCase } from "../application/ideation/validate-premise";
import { GenerateCharacterUseCase } from "../application/character/generate-character";
import { GenerateProseUseCase } from "../application/writing/generate-prose";
import { GenerateBeatSheetUseCase } from "../application/structure/generate-beat-sheet";
import { Genre } from "../domain/value-objects/genre";
import { AcademicDiscipline } from "../domain/value-objects/academic-discipline";
import { ProjectId } from "../domain/value-objects/project-id";
import { CrossPollinationSeed } from "../domain/ideation/cross-pollination-seed";
import { ClicheBlacklist } from "../domain/ideation/cliche-blacklist";
import { Premise } from "../domain/ideation/premise";
import { WritingRequest } from "../domain/writing-request";
import { PointOfView } from "../domain/value-objects/point-of-view";
import { SceneId } from "../domain/value-objects/scene-id";
import { ChapterId } from "../domain/value-objects/chapter-id";
import { NarrativeFramework } from "../domain/narrative-framework";
import { BlacklistRepository } from "../domain/ports/blacklist-repository";
import { CharacterRepository } from "../domain/ports/character-repository";

declare const process: { env: Record<string, string | undefined> };

const URL = process.env.LLAMA_URL ?? "http://127.0.0.1:8080";
const TIMEOUT = 200_000;

// Live 4B inference varies in latency and output shape; retry absorbs transient
// stalls and format drift so the mandatory gate reflects real capability, not luck.
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

const okSave = async () => ({ success: true as const, data: undefined });
const fakeBlacklistRepo = { save: okSave } as unknown as BlacklistRepository;
const fakeCharacterRepo = { save: okSave } as unknown as CharacterRepository;

const PREMISE = new Premise(
  "Uma cartógrafa cega que enxerga através do tato das marés",
  "Ela descobre uma ilha que só existe quando ninguém a observa",
  "Um cartógrafo imperial que apaga lugares do mapa para controlá-los",
  "A existência de povos inteiros que dependem de permanecerem no mapa",
);

describe.skipIf(!process.env.E2E_LLM)("E2E — StoryForge contra llama.cpp vivo", () => {
  let adapter: LlamaCppAdapter;

  beforeAll(async () => {
    const res = await fetch(`${URL}/health`).catch(() => null);
    if (!res || !res.ok) throw new Error(`Servidor llama.cpp indisponível em ${URL}`);
    adapter = new LlamaCppAdapter(URL);
  }, TIMEOUT);

  it(
    "adapter: complete() retorna texto e uso de tokens",
    async () => {
      const r = await adapter.complete("Diga 'ola' e nada mais.", { maxTokens: 16 });
      expect(typeof r.text).toBe("string");
      expect(r.text.length).toBeGreaterThan(0);
      expect(r.usage?.totalTokens ?? 0).toBeGreaterThan(0);
    },
    TIMEOUT,
  );

  it(
    "circuit breaker: envolve o adapter e deixa passar quando fechado",
    async () => {
      const cb = new CircuitBreakerDecorator(adapter, {
        failureThreshold: 3,
        resetTimeout: 30_000,
      });
      const r = await cb.complete("Responda apenas: OK", { maxTokens: 8 });
      expect(r.text.length).toBeGreaterThan(0);
    },
    TIMEOUT,
  );

  it(
    "ExtractCliches: extrai termos do gênero",
    async () => {
      const uc = new ExtractClichesUseCase(adapter, fakeBlacklistRepo);
      const result = await withRetry(() =>
        uc.execute(Genre.create("Fantasia"), ProjectId.generate()),
      );
      expect(result.bannedTerms.length).toBeGreaterThan(0);
    },
    TIMEOUT,
  );

  it(
    "GeneratePremises: parseia array JSON de premissas do modelo real",
    async () => {
      const uc = new GeneratePremisesUseCase(adapter);
      const seed = new CrossPollinationSeed(
        Genre.create("Fantasia"),
        AcademicDiscipline.create("Biologia Marinha"),
      );
      const blacklist = new ClicheBlacklist(Genre.create("Fantasia"), ["O Escolhido"]);
      const premises = await withRetry(() => uc.execute(seed, blacklist));
      expect(Array.isArray(premises)).toBe(true);
      expect(premises.length).toBeGreaterThan(0);
      expect(premises[0].protagonist.length).toBeGreaterThan(0);
    },
    TIMEOUT,
  );

  it(
    "ValidatePremise: parseia objeto JSON de validação do modelo real",
    async () => {
      const uc = new ValidatePremiseUseCase(adapter);
      const result = await withRetry(() => uc.execute(PREMISE));
      expect(typeof result.isValid).toBe("boolean");
      expect(result.reason.length).toBeGreaterThan(0);
    },
    TIMEOUT,
  );

  it(
    "GenerateCharacter: parseia ficha OCEAN/Hauge/Voice do modelo real",
    async () => {
      const uc = new GenerateCharacterUseCase(adapter, fakeCharacterRepo);
      const sheet = await withRetry(() =>
        uc.execute(ProjectId.generate(), "Nara", PREMISE, "Protagonista"),
      );
      expect(sheet.name).toBe("Nara");
    },
    TIMEOUT,
  );

  it(
    "GenerateProse: parseia draft/critique/finalVersion do modelo real",
    async () => {
      const uc = new GenerateProseUseCase(adapter);
      const request = WritingRequest.create({
        sceneId: SceneId.generate(),
        beatSummary: "A cartógrafa toca a maré e sente a ilha aparecer sob seus dedos.",
        pov: PointOfView.create("third-limited"),
        characterName: "Nara",
        wordLimit: 600,
      });
      const result = await withRetry(() => uc.execute(request));
      expect(result.isSuccess).toBe(true);
      expect(result.proseOutput.finalVersion.length).toBeGreaterThan(0);
    },
    TIMEOUT,
  );

  it(
    "GenerateBeatSheet: parseia beats Cena/Sequela do modelo real",
    async () => {
      const uc = new GenerateBeatSheetUseCase(adapter);
      const result = await withRetry(() =>
        uc.execute({
          chapterId: ChapterId.generate(),
          chapterNumber: 1,
          context: {
            framework: NarrativeFramework.SaveTheCat(),
            previousChapterSummary: "Nara chega ao porto sem saber ler o mapa imperial.",
            protagonistName: "Nara",
            protagonistGoal: "Provar que a ilha existe",
          },
        }),
      );
      expect(result.outline.beatCount()).toBeGreaterThan(0);
    },
    TIMEOUT,
  );

  it(
    "OpenAiAdapter: fala com o endpoint compatível /v1/chat/completions do llama.cpp",
    async () => {
      const openai = new OpenAiAdapter({
        apiKey: "not-needed",
        model: "local",
        baseUrl: `${URL}/v1`,
      });
      const r = await withRetry(() =>
        openai.complete("Responda apenas: OK", { maxTokens: 16 }),
      );
      expect(typeof r.text).toBe("string");
      expect(r.text.length).toBeGreaterThan(0);
    },
    TIMEOUT,
  );

  it(
    "LlamaCppEmbeddingAdapter: embed() retorna vetor não vazio e de tamanho consistente",
    async () => {
      const embedder = new LlamaCppEmbeddingAdapter({ baseUrl: URL });

      const first = await withRetry(() => embedder.embed("A cartógrafa toca a maré."));
      const second = await withRetry(() =>
        embedder.embed("Uma ilha que só existe quando ninguém a observa."),
      );

      expect(Array.isArray(first)).toBe(true);
      expect(first.length).toBeGreaterThan(0);
      expect(Array.isArray(second)).toBe(true);
      expect(second.length).toBe(first.length);
    },
    TIMEOUT,
  );

  it(
    "LlmRouter: cai do provedor quebrado para o llama.cpp real",
    async () => {
      const broken: CircuitBreakerDecorator = new CircuitBreakerDecorator(
        new OpenAiAdapter({
          apiKey: "x",
          model: "local",
          baseUrl: "http://127.0.0.1:1/v1",
        }),
        { failureThreshold: 3, resetTimeout: 30_000 },
      );
      const router = new LlmRouter([broken, new CircuitBreakerDecorator(adapter)]);
      const r = await withRetry(() => router.complete("Responda apenas: OK", { maxTokens: 8 }));
      expect(r.text.length).toBeGreaterThan(0);
    },
    TIMEOUT,
  );
});
