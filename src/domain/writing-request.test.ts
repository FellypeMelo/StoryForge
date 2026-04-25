import { describe, it, expect } from "vitest";
import { WritingRequest } from "./writing-request";
import { PointOfView } from "./value-objects/point-of-view";
import { SceneId } from "./value-objects/scene-id";

describe("WritingRequest", () => {
  it("creates valid writing request", () => {
    const pov = PointOfView.create("third-limited");
    const sceneId = SceneId.generate();
    const request = WritingRequest.create({
      sceneId,
      beatSummary: "Hero discovers the hidden betrayal",
      pov,
      characterName: "Aria",
      wordLimit: 600,
    });
    expect(request).toBeDefined();
    expect(request.beatSummary).toBe("Hero discovers the hidden betrayal");
    expect(request.wordLimit).toBe(600);
  });

  it("throws on empty beatSummary", () => {
    const pov = PointOfView.create("first-person");
    expect(() =>
      WritingRequest.create({
        sceneId: SceneId.generate(),
        beatSummary: "",
        pov,
        characterName: "Aria",
        wordLimit: 600,
      }),
    ).toThrow("Beat summary");
  });

  it("throws on wordLimit below 500", () => {
    const pov = PointOfView.create("first-person");
    expect(() =>
      WritingRequest.create({
        sceneId: SceneId.generate(),
        beatSummary: "Some beat",
        pov,
        characterName: "Aria",
        wordLimit: 400,
      }),
    ).toThrow();
  });

  it("throws on wordLimit above 800", () => {
    const pov = PointOfView.create("first-person");
    expect(() =>
      WritingRequest.create({
        sceneId: SceneId.generate(),
        beatSummary: "Some beat",
        pov,
        characterName: "Aria",
        wordLimit: 1000,
      }),
    ).toThrow();
  });
});
