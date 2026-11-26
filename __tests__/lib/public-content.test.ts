import { describe, it, expect } from "vitest";
import { PUBLIC_PATHS } from "@/lib/seo/public-content";

describe("PUBLIC_PATHS", () => {
  it("lists the adviser partners page so it appears in the sitemap", () => {
    expect(PUBLIC_PATHS).toContain("/adviser-partners");
  });

  it("has no duplicate paths", () => {
    expect(new Set(PUBLIC_PATHS).size).toBe(PUBLIC_PATHS.length);
  });
});
