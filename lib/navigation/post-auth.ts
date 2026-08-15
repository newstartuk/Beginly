const PRODUCT_ID_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

export function safeInternalRedirect(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\") || /[\u0000-\u001f]/.test(trimmed)) return undefined;
  try {
    const parsed = new URL(trimmed, "https://beginly.app");
    if (parsed.origin !== "https://beginly.app") return undefined;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return undefined;
  }
}

export function productEntryRedirect(productId: string | null | undefined): string | undefined {
  if (!productId || !PRODUCT_ID_PATTERN.test(productId)) return undefined;
  return `/products/${encodeURIComponent(productId)}`;
}

export function resolvePostAuthRedirect(input: { redirect?: string | null; product?: string | null }): string | undefined {
  return safeInternalRedirect(input.redirect) ?? productEntryRedirect(input.product);
}

export function withPostAuthIntent(pathname: "/login" | "/signup" | "/forgot-password", redirect?: string): string {
  const safe = safeInternalRedirect(redirect);
  return safe ? `${pathname}?redirect=${encodeURIComponent(safe)}` : pathname;
}
