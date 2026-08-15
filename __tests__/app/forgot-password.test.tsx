import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordPage from "@/app/forgot-password/page";

const resetPasswordForEmail = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: (...args: unknown[]) => resetPasswordForEmail(...args),
    },
  },
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    resetPasswordForEmail.mockReset();
    window.history.replaceState({}, "", "/forgot-password");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects an invalid email without calling Supabase", async () => {
    const { container } = render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "not-an-email" } });
    // Bypass native <input type="email"> constraint validation (which would otherwise
    // block the submit event before our handler runs) to exercise the app-level check.
    fireEvent.submit(container.querySelector("form")!);

    expect(await screen.findByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("sends a reset link and shows the check-your-email confirmation", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => expect(resetPasswordForEmail).toHaveBeenCalledTimes(1));
    expect(resetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      expect.objectContaining({ redirectTo: expect.stringContaining("/reset-password") }),
    );

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
  });

  it("shows the Supabase error inline and does not show the success state", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: { message: "Email rate limit exceeded" } });
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByText("Email rate limit exceeded")).toBeInTheDocument();
    expect(screen.queryByText("Check your email")).not.toBeInTheDocument();
  });

  it("carries a safe redirect query param through into the reset-password redirectTo URL", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });
    window.history.replaceState({}, "", "/forgot-password?redirect=%2Fplatform");
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => expect(resetPasswordForEmail).toHaveBeenCalledTimes(1));
    const [, options] = resetPasswordForEmail.mock.calls[0];
    expect(options.redirectTo).toContain("/reset-password?redirect=%2Fplatform");
  });
});
