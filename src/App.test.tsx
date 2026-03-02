import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

// Mock Tauri API
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockImplementation(async (cmd) => {
    if (cmd === "get_app_info") return { name: "StoryForge", version: "0.1.0" };
    if (cmd === "health_check") return { database: true };
    if (cmd === "list_characters_by_book") return [];
    if (cmd === "list_projects") return [];
    if (cmd === "list_books") return [];
    return [];
  }),
}));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("storyforge_last_project", "123e4567-e89b-12d3-a456-426614174000");
  localStorage.setItem("storyforge_last_book", "123e4567-e89b-12d3-a456-426614174001");
});

test("renders Bem-vindo à Forja title", async () => {
  render(<App />);
  await waitFor(() => {
    const linkElement = screen.getByText(/Bem-vindo à Forja/i);
    expect(linkElement).toBeInTheDocument();
  });
});


