import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

const FORM_URL = "https://forms.gle/AbC123xy";

// The page reads its env vars when the module loads, so each test imports a fresh copy.
async function renderPage(env: { ADVISER_GOOGLE_FORM_URL?: string; FOUNDERS_EMAIL?: string }) {
  vi.resetModules();
  vi.stubEnv("ADVISER_GOOGLE_FORM_URL", env.ADVISER_GOOGLE_FORM_URL ?? "");
  vi.stubEnv("FOUNDERS_EMAIL", env.FOUNDERS_EMAIL ?? "");
  const { default: Page, metadata } = await import("@/app/adviser-partners/page");
  render(<Page />);
  return { metadata };
}

describe("Adviser partners page", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows the headline and every section", async () => {
    await renderPage({ ADVISER_GOOGLE_FORM_URL: FORM_URL, FOUNDERS_EMAIL: "founders@example.com" });

    expect(screen.getByRole("heading", { level: 1, name: /clients who arrive with their evidence already in order/i })).toBeInTheDocument();
    for (const name of ["What you receive", "What Beginly never does", "Data protection", "Help us build it"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
  });

  it("links both survey buttons to the Google Form in a new tab", async () => {
    await renderPage({ ADVISER_GOOGLE_FORM_URL: ` ${FORM_URL} `, FOUNDERS_EMAIL: "founders@example.com" });

    for (const name of ["Take the survey", /take the adviser survey/i]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", FORM_URL);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    }
  });

  it("hides the survey buttons when no form link is configured", async () => {
    await renderPage({ FOUNDERS_EMAIL: "founders@example.com" });

    expect(screen.queryByRole("link", { name: /take the (adviser )?survey/i })).not.toBeInTheDocument();
  });

  it("shows the email button with the configured address", async () => {
    await renderPage({ ADVISER_GOOGLE_FORM_URL: FORM_URL, FOUNDERS_EMAIL: " founders@example.com " });

    expect(screen.getByRole("link", { name: /email the founders/i }))
      .toHaveAttribute("href", expect.stringMatching(/^mailto:founders@example\.com\?subject=/));
  });

  it("hides the email button when no address is configured, rather than emailing 'undefined'", async () => {
    await renderPage({ ADVISER_GOOGLE_FORM_URL: FORM_URL });

    expect(screen.queryByRole("link", { name: /email the founders/i })).not.toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain("mailto:undefined");
  });

  it("sets its canonical URL", async () => {
    const { metadata } = await renderPage({ ADVISER_GOOGLE_FORM_URL: FORM_URL });

    expect(metadata.alternates?.canonical).toBe("/adviser-partners");
  });
});
