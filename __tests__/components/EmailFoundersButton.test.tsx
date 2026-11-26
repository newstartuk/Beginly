import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import EmailFoundersButton from "@/components/EmailFoundersButton";

const writeText = vi.fn();

describe("EmailFoundersButton", () => {
  beforeEach(() => {
    writeText.mockReset();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("links to a pre-filled email with the subject encoded", () => {
    render(<EmailFoundersButton email="founders@example.com" subject="Beginly adviser design partner" />);

    expect(screen.getByRole("link", { name: /email the founders/i })).toHaveAttribute(
      "href",
      "mailto:founders@example.com?subject=Beginly%20adviser%20design%20partner",
    );
  });

  it("copies the address and confirms it, then resets after two seconds", async () => {
    vi.useFakeTimers();
    writeText.mockResolvedValue(undefined);
    render(<EmailFoundersButton email="founders@example.com" subject="Hi" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy founders email" }));
    });

    expect(writeText).toHaveBeenCalledWith("founders@example.com");
    expect(screen.getByRole("button", { name: "Email address copied" })).toHaveTextContent("Copied");
    // The live region announces the copy to screen readers
    expect(screen.getByText("Email address copied", { selector: ".sr-only" })).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(2000); });

    expect(screen.getByRole("button", { name: "Copy founders email" })).not.toHaveTextContent("Copied");
  });

  it("stays usable without confirming when the browser blocks the clipboard", async () => {
    writeText.mockRejectedValue(new Error("NotAllowedError"));
    render(<EmailFoundersButton email="founders@example.com" subject="Hi" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy founders email" }));
    });

    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email the founders/i })).toBeInTheDocument();
  });
});
