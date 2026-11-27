import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import LandingHero from "@/components/landing/LandingHero";
import { getCardTasks } from "@/lib/landing-card-tasks";

const ROUTES = ["Student", "Skilled Worker", "Family and Dependant", "Graduate", "Founder", "Health & Care"];

describe("LandingHero", () => {
  it("offers all six visa routes, with Student selected by default", () => {
    render(<LandingHero />);
    const picker = screen.getByRole("group", { name: "Choose your visa route" });
    const buttons = within(picker).getAllByRole("button");

    expect(buttons.map((b) => b.textContent)).toEqual(ROUTES);
    expect(within(picker).getByRole("button", { name: "Student" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your student visa journey, mapped from day one.");
  });

  it("switches the headline, stats and roadmap card to the chosen route", async () => {
    render(<LandingHero />);
    const picker = screen.getByRole("group", { name: "Choose your visa route" });

    fireEvent.click(within(picker).getByRole("button", { name: "Founder" }));

    expect(within(picker).getByRole("button", { name: "Founder" })).toHaveAttribute("aria-pressed", "true");
    expect(within(picker).getByRole("button", { name: "Student" })).toHaveAttribute("aria-pressed", "false");
    expect(await screen.findByRole("heading", { level: 1, name: /innovator founder visa/i })).toBeInTheDocument();
    expect(screen.getByText("Founder tasks")).toBeInTheDocument();
    expect(await screen.findByText("London · Founder visa · Endorsed")).toBeInTheDocument();
  });

  it("keeps the general arrival checklist on the Student card", () => {
    render(<LandingHero />);

    expect(screen.getByText("Get a UK SIM card")).toBeInTheDocument();
    expect(screen.getByText("Register with a local GP")).toBeInTheDocument();
  });

  it.each([
    ["Skilled Worker", "Complete your right-to-work check with your employer"],
    ["Family and Dependant", "Apply for school places through your local council"],
    ["Graduate", "Check you have a National Insurance number"],
    ["Founder", "Plan for your 12-month meeting with your endorsing body"],
    ["Health & Care", "Complete or confirm your professional registration"],
  ])("gives the %s card its own tasks from the checklist", async (route, task) => {
    render(<LandingHero cardTasks={getCardTasks()} />);
    const picker = screen.getByRole("group", { name: "Choose your visa route" });

    fireEvent.click(within(picker).getByRole("button", { name: route }));

    expect(await screen.findByText(task)).toBeInTheDocument();
    expect(screen.queryByText("Get a UK SIM card")).not.toBeInTheDocument();
  });

  it("links the main buttons to sign-up and the guidance library", () => {
    render(<LandingHero />);

    expect(screen.getByRole("link", { name: /create your free roadmap/i })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: /browse guidance articles/i })).toHaveAttribute("href", "/routes");
  });
});
