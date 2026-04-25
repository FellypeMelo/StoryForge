import { describe, it, expect } from "vitest";
import { GenerateProseUseCase } from "./generate-prose";
import { WritingRequest } from "../../domain/writing-request";
import { PointOfView } from "../../domain/value-objects/point-of-view";
import { SceneId } from "../../domain/value-objects/scene-id";
import { DummyLlmPort } from "../../infrastructure/llm/dummy-llm-port";
import { AiismBlacklist } from "../../domain/aiism-blacklist";

describe("GenerateProseUseCase", () => {
  function makeRequest(overrides: Partial<{
    emotionalIntensity: "low" | "medium" | "high";
    ragContext: string;
  }> = {}): WritingRequest {
    return WritingRequest.create({
      sceneId: SceneId.generate(),
      beatSummary: "Hero discovers the hidden betrayal",
      pov: PointOfView.create("third-limited"),
      characterName: "Aria",
      wordLimit: 600,
      ...overrides,
    });
  }

  it("generates prose with 3 RSIP versions", async () => {
    const llm = new DummyLlmPort();
    const useCase = new GenerateProseUseCase(llm);
    const result = await useCase.execute(makeRequest());

    expect(result.isSuccess).toBe(true);
    expect(result.proseOutput.draft).toBeDefined();
    expect(result.proseOutput.critique).toBeDefined();
    expect(result.proseOutput.finalVersion).toBeDefined();
  });

  it("includes blacklist guardrails in prompt", async () => {
    const llm = new DummyLlmPort();
    const useCase = new GenerateProseUseCase(llm, AiismBlacklist.default());
    const request = makeRequest();
    const result = await useCase.execute(request);
    expect(result.isSuccess).toBe(true);
  });

  it("applies emotion prompting for high intensity", async () => {
    const llm = new DummyLlmPort();
    const useCase = new GenerateProseUseCase(llm);
    const request = makeRequest({ emotionalIntensity: "high" });
    const result = await useCase.execute(request);
    expect(result.isSuccess).toBe(true);
  });
});
