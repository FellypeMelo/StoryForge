import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorldRuleList } from "../world-rule/WorldRuleList";
import { WorldRule } from "../../../domain/world-rule";
import { WorldRuleId } from "../../../domain/value-objects/bible-ids";
import { ProjectId } from "../../../domain/value-objects/project-id";

const pId = ProjectId.generate();

const mockRules: WorldRule[] = [
  WorldRule.create({
    id: WorldRuleId.generate(),
    projectId: pId,
    category: "Magic",
    content: "Magic costs life energy",
  }),
  WorldRule.create({
    id: WorldRuleId.generate(),
    projectId: pId,
    category: "Politics",
    content: "The King is absolute",
  }),
];

describe("WorldRuleList", () => {
  it("should render a list of world rules", () => {
    render(<WorldRuleList rules={mockRules} />);

    expect(screen.getByText("Magic costs life energy")).toBeInTheDocument();
    expect(screen.getByText("The King is absolute")).toBeInTheDocument();
  });

  it("should show empty state", () => {
    render(<WorldRuleList rules={[]} />);
    expect(screen.getByText(/Nenhuma regra encontrada/i)).toBeInTheDocument();
  });
});
