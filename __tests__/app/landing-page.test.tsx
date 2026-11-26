import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/page";

describe("Landing page", () => {
  it("has exactly one main heading", () => {
    render(<LandingPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("includes every section of the page", () => {
    render(<LandingPage />);

    for (const name of [
      "Why Beginly",
      "Three steps to your UK roadmap",
      "Everything, in the right order.",
      "Everything you need to settle, in one place.",
      "Meet Nia: plain English for every UK document.",
      "Think like a newcomer: spot the scam.",
      "How we work, and how we don't",
      "Your first 90 days start now.",
    ]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
  });

  it("points advisers to the adviser partners page from the bar, header and footer", () => {
    render(<LandingPage />);

    expect(screen.getByRole("link", { name: /help us build beginly/i })).toHaveAttribute("href", "/adviser-partners");
    const forAdvisers = screen.getAllByRole("link", { name: "For advisers" });
    expect(forAdvisers).toHaveLength(2);
    for (const link of forAdvisers) expect(link).toHaveAttribute("href", "/adviser-partners");
  });

  it("sends the sign-up buttons to /signup", () => {
    render(<LandingPage />);

    for (const name of ["Get started free", /create your free roadmap/i, /create your roadmap now/i]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", "/signup");
    }
  });
});
