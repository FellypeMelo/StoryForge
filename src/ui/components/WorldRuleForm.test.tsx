import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorldRuleForm } from "./WorldRuleForm";
import { WorldRule } from "../../domain/world-rule";
import { WorldRuleId } from "../../domain/value-objects/bible-ids";
import { ProjectId } from "../../domain/value-objects/project-id";

const ruleId = WorldRuleId.generate();
const projId = ProjectId.generate();

const mockRule = WorldRule.create({
  id: ruleId,
  projectId: projId,
  category: "Magic",
  content: "Fire burns",
});

describe("WorldRuleForm", () => {
  it("should render form with data", () => {
    render(<WorldRuleForm rule={mockRule} onSave={() => {}} onCancel={() => {}} />);
    expect(screen.getByDisplayValue("Magic")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fire burns")).toBeInTheDocument();
  });

  it("should call onSave with new data", () => {
    const onSave = vi.fn();
    render(<WorldRuleForm rule={mockRule} onSave={onSave} onCancel={() => {}} />);
    
    const contentInput = screen.getByLabelText(/Rule Content/i);
    fireEvent.change(contentInput, { target: { value: "Water douses fire" } });
    
    fireEvent.click(screen.getByText(/Save Rule/i));
    
    expect(onSave).toHaveBeenCalled();
    const saved = onSave.mock.calls[0][0] as WorldRule;
    expect(saved.content).toBe("Water douses fire");
  });
});
