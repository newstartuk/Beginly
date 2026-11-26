import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import RouteTimeline from "@/components/landing/RouteTimeline";
import LandingHero from "@/components/landing/LandingHero";
import { HeroRouteProvider } from "@/components/landing/HeroRouteContext";
import { getTimelines } from "@/lib/landing-timeline";

const timelines = getTimelines();

describe("RouteTimeline", () => {
  it("starts on the Student timeline, stage by stage", () => {
    render(<RouteTimeline timelines={timelines} />);
    const list = screen.getByRole("list", { name: "Student timeline" });

    const stages = within(list).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(stages).toEqual(["Getting ready", "Day 1", "First week", "First month", "By day 90"]);
    expect(within(list).getByText("Check in with your university international student office")).toBeInTheDocument();
  });

  it("switches route from its own buttons", async () => {
    render(<RouteTimeline timelines={timelines} />);
    const picker = screen.getByRole("group", { name: "Show the timeline for" });

    fireEvent.click(within(picker).getByRole("button", { name: "Founder" }));

    expect(within(picker).getByRole("button", { name: "Founder" })).toHaveAttribute("aria-pressed", "true");
    const list = await screen.findByRole("list", { name: "Founder timeline" });
    expect(within(list).getByText("Register your company at Companies House")).toBeInTheDocument();
  });

  it("shows four stages for Graduate, with no Day 1", async () => {
    render(<RouteTimeline timelines={timelines} />);

    fireEvent.click(within(screen.getByRole("group", { name: "Show the timeline for" })).getByRole("button", { name: "Graduate" }));

    const list = await screen.findByRole("list", { name: "Graduate timeline" });
    expect(within(list).getAllByRole("heading", { level: 3 }).map((h) => h.textContent))
      .toEqual(["Getting ready", "First week", "First month", "By day 90"]);
  });

  it("links to sign-up", () => {
    render(<RouteTimeline timelines={timelines} />);

    expect(screen.getByRole("link", { name: /build my roadmap/i })).toHaveAttribute("href", "/signup");
  });
});

describe("hero and timeline together", () => {
  it("follows the route picked in the hero, and the hero follows the timeline", async () => {
    render(
      <HeroRouteProvider>
        <LandingHero />
        <RouteTimeline timelines={timelines} />
      </HeroRouteProvider>,
    );
    const heroPicker = screen.getByRole("group", { name: "Choose your visa route" });
    const timelinePicker = screen.getByRole("group", { name: "Show the timeline for" });

    fireEvent.click(within(heroPicker).getByRole("button", { name: "Health & Care" }));
    expect(await screen.findByRole("list", { name: "Health & Care timeline" })).toBeInTheDocument();
    expect(within(timelinePicker).getByRole("button", { name: "Health & Care" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(within(timelinePicker).getByRole("button", { name: "Skilled Worker" }));
    expect(within(heroPicker).getByRole("button", { name: "Skilled Worker" })).toHaveAttribute("aria-pressed", "true");
    expect(await screen.findByRole("heading", { level: 1, name: /skilled worker route/i })).toBeInTheDocument();
  });
});
