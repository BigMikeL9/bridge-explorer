import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConditionBadge } from "./ConditionBadge";

describe("ConditionBadge", () => {
  it("renders condition text with an icon", () => {
    render(<ConditionBadge condition="Poor" />);

    expect(screen.getByText("Poor")).toBeInTheDocument();
    expect(screen.getByText("Poor").querySelector("svg")).toBeInTheDocument();
  });
});
