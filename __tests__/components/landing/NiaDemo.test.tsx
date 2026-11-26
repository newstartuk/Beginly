import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import NiaDemo from "@/components/landing/NiaDemo";

describe("NiaDemo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts on the first topic", () => {
    render(<NiaDemo />);

    expect(screen.getByRole("button", { name: "Immigration" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("What is an eVisa?")).toBeInTheDocument();
  });

  it("shows the conversation for the topic the visitor picks", async () => {
    render(<NiaDemo />);

    fireEvent.click(screen.getByRole("button", { name: "Housing" }));

    expect(screen.getByRole("button", { name: "Housing" })).toHaveAttribute("aria-pressed", "true");
    expect(await screen.findByText("My landlord sent a Section 21 notice. What does it mean?")).toBeInTheDocument();
  });

  it("moves on to the next topic by itself", () => {
    vi.useFakeTimers();
    render(<NiaDemo />);

    act(() => { vi.advanceTimersByTime(5200); });

    expect(screen.getByRole("button", { name: "Housing" })).toHaveAttribute("aria-pressed", "true");
  });

  it("gives a full read after a manual pick before moving on", () => {
    vi.useFakeTimers();
    render(<NiaDemo />);

    act(() => { vi.advanceTimersByTime(4000); });
    fireEvent.click(screen.getByRole("button", { name: "NHS" }));
    act(() => { vi.advanceTimersByTime(4000); });

    // 8 seconds in, but only 4 since the pick, so NHS is still showing
    expect(screen.getByRole("button", { name: "NHS" })).toHaveAttribute("aria-pressed", "true");
  });
});
