import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ScamGame from "@/components/landing/ScamGame";

const listing = (title: RegExp) => screen.getByRole("button", { name: title });

describe("ScamGame", () => {
  it("congratulates the visitor when they pick the fake listing", async () => {
    render(<ScamGame />);

    fireEvent.click(listing(/stunning 1-bed, central london/i));

    expect(await screen.findByText("You spotted it.")).toBeInTheDocument();
    expect(screen.getByText(/three red flags/i)).toBeInTheDocument();
  });

  it("explains which listing was the scam after a wrong pick", async () => {
    render(<ScamGame />);

    fireEvent.click(listing(/2-bed flat, stratford/i));

    expect(await screen.findByText("Not quite. Listing 2 is the scam.")).toBeInTheDocument();
  });

  it("locks the listings once revealed, and 'Try again' resets the game", async () => {
    render(<ScamGame />);

    fireEvent.click(listing(/room in shared house/i));
    for (const title of [/2-bed flat/i, /stunning 1-bed/i, /room in shared house/i]) {
      expect(listing(title)).toBeDisabled();
    }

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Click the listing you think is a scam.")).toBeInTheDocument();
    expect(listing(/stunning 1-bed/i)).toBeEnabled();
  });

  it("uses a made-up letting agent rather than a real firm", () => {
    render(<ScamGame />);

    expect(screen.getByText("Agent: Harbour & Co Lettings")).toBeInTheDocument();
  });
});
