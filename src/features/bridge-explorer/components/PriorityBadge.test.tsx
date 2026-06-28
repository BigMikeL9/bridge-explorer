import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriorityBadge } from "./PriorityBadge";

describe("PriorityBadge", () => {
  it("renders priority text with an icon", () => {
    render(<PriorityBadge priority="Critical" />);

    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("Critical").querySelector("svg")).toBeInTheDocument();
  });
});
