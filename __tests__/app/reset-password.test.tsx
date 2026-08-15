import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ResetPasswordPage from "@/app/reset-password/page";

const updateUser = vi.fn();
const signOut = vi.fn();
const onAuthStateChange = vi.fn();
const getSession = vi.fn();
const push = vi.fn();

let authStateCallback: ((event: string) => void) | undefined;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      updateUser: (...args: unknown[]) => updateUser(...args),
      signOut: (...args: unknown[]) => signOut(...args),
      getSession: (...args: unknown[]) => getSession(...args),
      onAuthStateChange: (cb: (event: string) => void) => {
        authStateCallback = cb;
        return onAuthStateChange(cb);
      },
    },
  },
}));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    updateUser.mockReset();
    signOut.mockReset();
    push.mockReset();
    getSession.mockReset().mockResolvedValue({ data: { session: null } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    authStateCallback = undefined;
    onAuthStateChange.mockReset().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows an invalid-link state when the URL carries no recovery code", async () => {
    window.history.replaceState({}, "", "/reset-password");
    render(<ResetPasswordPage />);

    expect(await screen.findByText("Link expired or invalid")).toBeInTheDocument();
    expect(onAuthStateChange).not.toHaveBeenCalled();
  });

  it("shows the Supabase error_description when the recovery link already expired", async () => {
    window.history.replaceState({}, "", "/reset-password?error_description=Email+link+is+invalid+or+has+expired");
    render(<ResetPasswordPage />);

    expect(await screen.findByText("Link expired or invalid")).toBeInTheDocument();
    expect(screen.getByText("Email link is invalid or has expired")).toBeInTheDocument();
  });

  it("shows the password form once Supabase fires the PASSWORD_RECOVERY event", async () => {
    window.history.replaceState({}, "", "/reset-password?code=abc123");
    render(<ResetPasswordPage />);

    expect(onAuthStateChange).toHaveBeenCalledTimes(1);
    act(() => authStateCallback?.("PASSWORD_RECOVERY"));

    expect(await screen.findByRole("button", { name: "Update password" })).toBeInTheDocument();
  });

  it("validates password length and confirmation match before calling Supabase", async () => {
    window.history.replaceState({}, "", "/reset-password?code=abc123");
    const { container } = render(<ResetPasswordPage />);
    act(() => authStateCallback?.("PASSWORD_RECOVERY"));
    await screen.findByRole("button", { name: "Update password" });

    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), { target: { value: "short" } });
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), { target: { value: "short" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(await screen.findByText("Password must be at least 8 characters.")).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), { target: { value: "longenough1" } });
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), { target: { value: "different1" } });
    fireEvent.submit(container.querySelector("form")!);
    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("updates the password, notifies the user, signs out, and redirects to login with a reset banner", async () => {
    window.history.replaceState({}, "", "/reset-password?code=abc123");
    updateUser.mockResolvedValue({ error: null });
    signOut.mockResolvedValue({ error: null });
    getSession.mockResolvedValue({ data: { session: { access_token: "tok-abc" } } });

    const { container } = render(<ResetPasswordPage />);
    act(() => authStateCallback?.("PASSWORD_RECOVERY"));
    await screen.findByRole("button", { name: "Update password" });

    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), { target: { value: "longenough1" } });
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), { target: { value: "longenough1" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(updateUser).toHaveBeenCalledWith({ password: "longenough1" }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/auth/password-changed", {
        method: "POST",
        headers: { Authorization: "Bearer tok-abc" },
      }),
    );
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith("/login?reset=true");
  });

  it("still completes the reset if the password-changed notification fails", async () => {
    window.history.replaceState({}, "", "/reset-password?code=abc123");
    updateUser.mockResolvedValue({ error: null });
    signOut.mockResolvedValue({ error: null });
    getSession.mockResolvedValue({ data: { session: { access_token: "tok-abc" } } });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const { container } = render(<ResetPasswordPage />);
    act(() => authStateCallback?.("PASSWORD_RECOVERY"));
    await screen.findByRole("button", { name: "Update password" });

    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), { target: { value: "longenough1" } });
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), { target: { value: "longenough1" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith("/login?reset=true");
  });

  it("preserves a safe post-auth redirect through to the login success URL", async () => {
    window.history.replaceState({}, "", "/reset-password?code=abc123&redirect=%2Fplatform");
    updateUser.mockResolvedValue({ error: null });
    signOut.mockResolvedValue({ error: null });

    const { container } = render(<ResetPasswordPage />);
    act(() => authStateCallback?.("PASSWORD_RECOVERY"));
    await screen.findByRole("button", { name: "Update password" });

    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), { target: { value: "longenough1" } });
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), { target: { value: "longenough1" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/login?redirect=%2Fplatform&reset=true"));
  });

  it("surfaces the Supabase error when updateUser fails", async () => {
    window.history.replaceState({}, "", "/reset-password?code=abc123");
    updateUser.mockResolvedValue({ error: { message: "New password should be different from the old password." } });

    const { container } = render(<ResetPasswordPage />);
    act(() => authStateCallback?.("PASSWORD_RECOVERY"));
    await screen.findByRole("button", { name: "Update password" });

    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), { target: { value: "longenough1" } });
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), { target: { value: "longenough1" } });
    fireEvent.submit(container.querySelector("form")!);

    expect(await screen.findByText("New password should be different from the old password.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });
});
