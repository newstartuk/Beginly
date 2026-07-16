import { redirect } from "next/navigation";
import PlatformShell from "@/components/platform/PlatformShell";
import NiaConversation from "@/components/platform/NiaConversation";
import StatusPill from "@/components/platform/StatusPill";
import { loadCurrentPlatformContext } from "@/lib/platform/server-context";
import { loadStandaloneProductAccess } from "@/lib/platform/product-entry";

export const dynamic = "force-dynamic";

export default async function NiaPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product: productId } = await searchParams;
  if (productId) {
    const access = await loadStandaloneProductAccess(productId);
    if (!access) redirect(`/login?redirect=${encodeURIComponent(`/nia?product=${productId}`)}`);
    if (!access.owned) redirect(`/products/${productId}`);
    if (!access.entry || access.entry.state !== "active") redirect(`/products/${productId}/workspace`);
    return <PlatformShell title={`Nia for ${access.product.name}`} eyebrow="Product-specific context · governed actions" action={<StatusPill tone="positive">Standalone context connected</StatusPill>}><NiaConversation productId={productId}/></PlatformShell>;
  }
  await loadCurrentPlatformContext();
  return <PlatformShell title="Nia, your adaptive navigator" eyebrow="Journey · opportunity · capability · value" action={<StatusPill tone="positive">Context connected</StatusPill>}><NiaConversation /></PlatformShell>;
}
