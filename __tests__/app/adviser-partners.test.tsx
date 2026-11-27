import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Stand in for Typeform's popup so we can see which form ID and size the page asks for.
const { popupProps } = vi.hoisted(() => ({ popupProps: vi.fn() }));
vi.mock("@typeform/embed-react", () => ({
  PopupButton: (props: { id: string; className?: string; children: React.ReactNode }) => {
    popupProps(props);
    return <button type="button" className={props.className}>{props.children}</button>;
  },
}));

// The page reads its env vars when the module loads, so each test imports a fresh copy.
async function renderPage(env: { ADVISER_TYPEFORM_ID?: string; FOUNDERS_EMAIL?: string }) {
  vi.resetModules();
  vi.stubEnv("ADVISER_TYPEFORM_ID", env.ADVISER_TYPEFORM_ID ?? "");
  vi.stubEnv("FOUNDERS_EMAIL", env.FOUNDERS_EMAIL ?? "");
  const { default: Page, metadata } = await import("@/app/adviser-partners/page");
  render(<Page />);
  return { metadata };
}

describe("Adviser partners page", () => {
  beforeEach(() => {
    popupProps.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows the headline and every section", async () => {
    await renderPage({ ADVISER_TYPEFORM_ID: "AbC123xy", FOUNDERS_EMAIL: "founders@example.com" });

    expect(screen.getByRole("heading", { level: 1, name: /clients who arrive with their evidence already in order/i })).toBeInTheDocument();
    for (const name of ["What you receive", "What Beginly never does", "Data protection", "Help us build it"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
  });

  it("opens the survey from both buttons using the form ID from a full share link", async () => {
    await renderPage({ ADVISER_TYPEFORM_ID: "https://example.typeform.com/to/AbC123xy", FOUNDERS_EMAIL: "founders@example.com" });

    expect(screen.getByRole("button", { name: "Take the survey" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /take the adviser survey/i })).toBeInTheDocument();
    expect(popupProps).toHaveBeenCalledTimes(2);
    for (const [props] of popupProps.mock.calls) {
      expect(props.id).toBe("AbC123xy");
    }
  });

  it("accepts a bare form ID too", async () => {
    await renderPage({ ADVISER_TYPEFORM_ID: "  AbC123xy  ", FOUNDERS_EMAIL: "founders@example.com" });

    expect(popupProps.mock.calls.every(([props]) => props.id === "AbC123xy")).toBe(true);
  });

  it("shows the email button with the configured address", async () => {
    await renderPage({ ADVISER_TYPEFORM_ID: "AbC123xy", FOUNDERS_EMAIL: " founders@example.com " });

    expect(screen.getByRole("link", { name: /email the founders/i }))
      .toHaveAttribute("href", expect.stringMatching(/^mailto:founders@example\.com\?subject=/));
  });

  it("hides the email button when no address is configured, rather than emailing 'undefined'", async () => {
    await renderPage({ ADVISER_TYPEFORM_ID: "AbC123xy" });

    expect(screen.queryByRole("link", { name: /email the founders/i })).not.toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain("mailto:undefined");
  });

  it("sets its canonical URL", async () => {
    const { metadata } = await renderPage({ ADVISER_TYPEFORM_ID: "AbC123xy" });

    expect(metadata.alternates?.canonical).toBe("/adviser-partners");
  });
});
