import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RoadmapPreviewCard from "@/components/RoadmapPreviewCard";

describe("RoadmapPreviewCard", () => {
  it("shows the general arrival checklist when no tasks are given", () => {
    render(<RoadmapPreviewCard location="Manchester · Student" />);

    for (const task of ["Open a UK bank account", "Get a UK SIM card", "Register with a local GP", "Apply for National Insurance number"]) {
      expect(screen.getByText(task)).toBeInTheDocument();
    }
  });

  it("shows the tasks it is given, with their days", () => {
    render(
      <RoadmapPreviewCard
        location="London · Founder visa"
        tasks={[
          { task: "Task one", day: "Day 1" },
          { task: "Task two", day: "Day 3" },
          { task: "Task three", day: "Day 7" },
          { task: "Task four", day: "Day 60" },
        ]}
      />,
    );

    for (const task of ["Task one", "Task two", "Task three", "Task four"]) {
      expect(screen.getByText(task)).toBeInTheDocument();
    }
    expect(screen.getByText("Day 60")).toBeInTheDocument();
    expect(screen.queryByText("Get a UK SIM card")).not.toBeInTheDocument();
  });
});
