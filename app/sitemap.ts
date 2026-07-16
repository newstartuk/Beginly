import type { MetadataRoute } from "next";
import { PUBLIC_PATHS } from "@/lib/seo/public-content";
import { PRODUCTS } from "@/lib/platform/catalog";
export default function sitemap(): MetadataRoute.Sitemap {
  const reviewed = new Date("2026-07-12T00:00:00.000Z");
  const paths = [...PUBLIC_PATHS, ...PRODUCTS.map((product) => `/products/${product.id}`)];
  return paths.map((path, index) => ({
    url: `https://beginly.app${path}`,
    lastModified: reviewed,
    changeFrequency: path.startsWith("/routes/") || path.startsWith("/products/") ? "monthly" : path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : index < 4 ? 0.8 : 0.6,
  }));
}
