import "@testing-library/jest-dom";
import { vi, beforeEach } from "vitest";
import { mockDb } from "./mock-db";

// Mock Tauri invoke globally
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn((cmd, args) => mockDb.invoke(cmd, args)),
}));

// Reset mock database before each test to ensure isolation
beforeEach(() => {
  mockDb.reset();
  vi.clearAllMocks();
});
