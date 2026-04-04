import { describe, it, expect } from "vitest";
import { ChapterOutline } from "./chapter-outline";
import { SceneBeat, DisasterType } from "./scene-beat";
import { SequelBeat } from "./sequel-beat";
import { Cliffhanger, CliffhangerType } from "./cliffhanger";
import { ChapterId } from "./value-objects/chapter-id";
import { ScenePolarity } from "./scene-grid";

describe("ChapterOutline", () => {
  it("assembles a valid outline with 4+ beats", () => {
    const scene = SceneBeat.create(
      "Find evidence",
      "Witness refuses to talk",
      DisasterType.No(),
    );
    const sequel = SequelBeat.create(
      "Frustrated",
      ["Drop the case (abandon client, lose everything)", "Threaten witness (risk losing face, sacrifice career)", "Sacrifice weekend to investigate harder (lose time)"],
      "Decides to investigate harder",
    );
    const scene2 = SceneBeat.create(
      "Find the map",
      "Library guard blocks the way",
      DisasterType.NoAndWorse(),
    );
    const cliff = Cliffhanger.create(
      CliffhangerType.PrePoint(),
      "Discovers someone is watching",
    );

    const outline = ChapterOutline.create(
      ChapterId.generate(),
      1,
      [scene, sequel, scene2],
      cliff,
      ScenePolarity.create("positive"),
      ScenePolarity.create("negative"),
    );

    expect(outline.getBeats()).toHaveLength(3);
    expect(outline.hasCliffhanger()).toBe(true);
  });

  it("returns total beat count including cliffhanger", () => {
    const scene1 = SceneBeat.create("A", "B", DisasterType.No());
    const sequel1 = SequelBeat.create(
      "R",
      ["Option A (bad, sacrifice)", "Option B (worse, lose everything)", "Option C (tragic, risk death)"],
      "D",
    );
    const sequel2 = SequelBeat.create(
      "R2",
      ["Option A (terrible, worst)", "Option B (impossible, suffer)", "Option C (sacrifice honor)"],
      "D2",
    );
    const cliff = Cliffhanger.create(CliffhangerType.PrePoint(), "C");

    const outline = ChapterOutline.create(
      ChapterId.generate(),
      1,
      [scene1, sequel1, sequel2],
      cliff,
      ScenePolarity.create("positive"),
      ScenePolarity.create("negative"),
    );

    expect(outline.beatCount()).toBe(4); // 3 beats + cliffhanger
  });

  it("validates Story Grid polarity inversion and flags warning", () => {
    const scene = SceneBeat.create("A", "B", DisasterType.No());
    const sequel = SequelBeat.create(
      "R",
      ["Option A (bad, sacrifice)", "Option B (worse, lose everything)", "Option C (tragic, risk)"],
      "D",
    );
    const scene2 = SceneBeat.create("A2", "B2", DisasterType.NoAndWorse());
    const cliff = Cliffhanger.create(CliffhangerType.PrePoint(), "C");

    // Same start/end polarity — should create but flag as warning
    const outline = ChapterOutline.create(
      ChapterId.generate(),
      1,
      [scene, sequel, scene2],
      cliff,
      ScenePolarity.create("positive"),
      ScenePolarity.create("positive"),
    );

    expect(outline.hasPolarityWarning()).toBe(true);
    expect(outline.getPolarityWarning()).toContain("inútil");
  });

  it("returns chapter number", () => {
    const scene = SceneBeat.create("A", "B", DisasterType.No());
    const scene2 = SceneBeat.create("A2", "B2", DisasterType.NoAndWorse());
    const sequel = SequelBeat.create(
      "R",
      ["bad option (worst)", "bad option (terrible, suffer)", "bad option (sacrifice)"],
      "D",
    );
    const cliff = Cliffhanger.create(CliffhangerType.PrePoint(), "C");

    const outline = ChapterOutline.create(
      ChapterId.generate(),
      5,
      [scene, scene2, sequel],
      cliff,
      ScenePolarity.create("positive"),
      ScenePolarity.create("negative"),
    );

    expect(outline.getChapterNumber()).toBe(5);
  });

  it("returns scene start and end polarity strings", () => {
    const scene = SceneBeat.create("A", "B", DisasterType.No());
    const scene2 = SceneBeat.create("A2", "B2", DisasterType.No());
    const sequel = SequelBeat.create(
      "R",
      ["bad option (worst)", "bad option (terrible)", "bad option (sacrifice)"],
      "D",
    );
    const cliff = Cliffhanger.create(CliffhangerType.PrePoint(), "C");

    const outline = ChapterOutline.create(
      ChapterId.generate(),
      1,
      [scene, sequel, scene2],
      cliff,
      ScenePolarity.create("positive"),
      ScenePolarity.create("negative"),
    );

    expect(outline.getStartPolarity()).toBe("+");
    expect(outline.getEndPolarity()).toBe("-");
  });

  it("returns id", () => {
    const scene = SceneBeat.create("A", "B", DisasterType.No());
    const sequel = SequelBeat.create(
      "R",
      ["bad option (worst)", "bad option (terrible)", "bad option (sacrifice)"],
      "D",
    );
    const scene2 = SceneBeat.create("A2", "B2", DisasterType.NoAndWorse());
    const cliff = Cliffhanger.create(CliffhangerType.PrePoint(), "C");

    const id = ChapterId.generate();
    const outline = ChapterOutline.create(
      id,
      1,
      [scene, sequel, scene2],
      cliff,
      ScenePolarity.create("positive"),
      ScenePolarity.create("negative"),
    );

    expect(outline.getId().value).toBe(id.value);
  });
});

describe("ChapterOutline - minimum beats", () => {
  it("rejects outline with fewer than 4 beats total", () => {
    const scene = SceneBeat.create("Open door", "Locked", DisasterType.No());
    const cliff = Cliffhanger.create(CliffhangerType.PrePoint(), "Someone screams outside");

    // Only 2 beats (1 scene + 1 cliffhanger), needs 4+
    expect(() =>
      ChapterOutline.create(
        ChapterId.generate(),
        1,
        [scene],
        cliff,
        ScenePolarity.create("positive"),
        ScenePolarity.create("negative"),
      )
    ).toThrow("minimum of 4 beats");
  });
});
