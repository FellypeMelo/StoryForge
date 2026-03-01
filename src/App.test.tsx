import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { expect, test, vi } from "vitest";

// Mock Tauri API
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue({ name: "StoryForge", version: "0.1.0" }),
}));

test("renders StoryForge title", async () => {
  render(<App />);
  await waitFor(() => {
    const linkElement = screen.getByText(/StoryForge/i);
    expect(linkElement).toBeInTheDocument();
  });
});
