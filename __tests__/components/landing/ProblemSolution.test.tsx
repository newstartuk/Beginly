import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ProblemSolution from "@/components/landing/ProblemSolution";

describe("ProblemSolution", () => {
  it("is a labelled section, so it shows up in the page outline", () => {
    render(<ProblemSolution />);

    expect(screen.getByRole("region", { name: "Why Beginly" })).toBeInTheDocument();
  });

  it("pairs every problem with an answer", () => {
    render(<ProblemSolution />);
    const [problems, solutions] = screen.getAllByRole("list");

    const problemItems = within(problems).getAllByRole("listitem");
    const solutionItems = within(solutions).getAllByRole("listitem");
    expect(problemItems).toHaveLength(4);
    expect(solutionItems).toHaveLength(problemItems.length);

    // Spot-check that a pair sits at the same position in both lists
    expect(problemItems[1]).toHaveTextContent(/scattered across dozens of government websites/i);
    expect(solutionItems[1]).toHaveTextContent(/links to the official source for every task/i);
  });

  it("shows the problem first, then what we built", () => {
    render(<ProblemSolution />);
    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

    expect(headings).toEqual([
      "Arriving in the UK is overwhelming.",
      "One personalised checklist for your first 90 days.",
    ]);
  });
});
