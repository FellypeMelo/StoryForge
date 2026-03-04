import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExtractClichesUseCase } from "./extract-cliches";
import { Genre } from "../../domain/value-objects/genre";
import { LlmPort } from "../../domain/ideation/ports/llm-port";
import { BlacklistRepository } from "../../domain/ports/blacklist-repository";
import { ProjectId } from "../../domain/value-objects/project-id";

describe("ExtractClichesUseCase", () => {
  let llmPort: LlmPort;
  let blacklistRepository: BlacklistRepository;
  let useCase: ExtractClichesUseCase;
  const projectId = ProjectId.create("123e4567-e89b-12d3-a456-426614174000");

  beforeEach(() => {
    llmPort = {
      complete: vi.fn(),
    };
    blacklistRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByProject: vi.fn(),
      delete: vi.fn(),
    } as any;
    useCase = new ExtractClichesUseCase(llmPort, blacklistRepository);
  });

  it("should extract cliches from LLM and save to repository", async () => {
    const genre = Genre.create("Fantasy");
    const mockLlmResponse = {
      text: "Chosen One, Dark Lord, , Magic Sword", // Test with empty element in split
    };
    (llmPort.complete as any).mockResolvedValue(mockLlmResponse);
    (blacklistRepository.save as any).mockResolvedValue({ isSuccess: true });

    const result = await useCase.execute(genre, projectId);

    expect(llmPort.complete).toHaveBeenCalledWith(
      expect.stringContaining("Fantasy"),
      expect.anything(),
    );
    expect(blacklistRepository.save).toHaveBeenCalledTimes(3);
    expect(result.bannedTerms).toEqual(["Chosen One", "Dark Lord", "Magic Sword"]);
  });

  it("should throw error if LLM returns null or undefined response", async () => {
    const genre = Genre.create("Noir");
    (llmPort.complete as any).mockResolvedValue(null as any);
    await expect(useCase.execute(genre, projectId)).rejects.toThrow();

    (llmPort.complete as any).mockResolvedValue({ text: null as any });
    await expect(useCase.execute(genre, projectId)).rejects.toThrow(
      "No cliches extracted from LLM",
    );
  });

  it("should handle empty LLM response", async () => {
    const genre = Genre.create("Noir");
    (llmPort.complete as any).mockResolvedValue({ text: "" });
    await expect(useCase.execute(genre, projectId)).rejects.toThrow(
      "No cliches extracted from LLM",
    );

    (llmPort.complete as any).mockResolvedValue({ text: "   " });
    await expect(useCase.execute(genre, projectId)).rejects.toThrow(
      "No cliches extracted from LLM",
    );
  });
});
