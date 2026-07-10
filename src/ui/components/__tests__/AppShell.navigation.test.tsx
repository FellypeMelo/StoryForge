import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppShell } from "../layout/AppShell";

describe("AppShell Navigation", () => {
  it("should call onNavigate with 'codex' when Codex is clicked", () => {
    const onNavigate = vi.fn();
    render(
      <AppShell onNavigate={onNavigate}>
        <div>Content</div>
      </AppShell>,
    );

    const codexButton = screen.getByRole("button", { name: /^Codex$/i });
    fireEvent.click(codexButton);

    expect(onNavigate).toHaveBeenCalledWith("codex");
  });
});
