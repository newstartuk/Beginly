import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, CircleAlert, Clock3, Compass, House, Sparkles, Target, Timer, WandSparkles } from "lucide-react";
import type { DashboardModule } from "@/lib/platform/types";
import StatusPill from "./StatusPill";

const icons = {
  safety: CircleAlert,
  mandatory_action: Clock3,
  next_best_action: Compass,
  future_horizon: Target,
  opportunity: BriefcaseBusiness,
  owned_product: BadgeCheck,
  household: House,
  value_recommendation: WandSparkles,
  readiness: Sparkles,
  nia: Sparkles,
  notification: Clock3,
  work_hours: Timer,
};

export default function ModuleCard({ module }: { module: DashboardModule }) {
  const Icon = icons[module.type];
  const tone = module.commercialClass === "sponsored" ? "sponsored" : module.type === "safety" ? "warning" : module.type === "next_best_action" ? "positive" : "info";
  const card = (
    <article className={`platform-module ${module.type}`}>
      <div className="platform-module-top"><span className="platform-module-icon"><Icon size={19} /></span><StatusPill tone={tone}>{module.commercialClass === "none" ? module.type.replaceAll("_", " ") : module.commercialClass}</StatusPill></div>
      <h2>{module.title}</h2><p>{module.summary}</p>
      <div className="platform-module-bottom"><span>{module.reasonCodes[0]?.replaceAll("_", " ")}</span>{module.href && <ArrowUpRight size={17} />}</div>
    </article>
  );
  return module.href ? <Link href={module.href} className="platform-module-link">{card}</Link> : card;
}
