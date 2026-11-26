"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { HeroRoute } from "@/components/landing/hero-routes";

type HeroRouteState = { route: HeroRoute; setRoute: (route: HeroRoute) => void };

const HeroRouteContext = createContext<HeroRouteState | null>(null);

/** Shares the chosen visa route between the hero and the timeline. */
export function HeroRouteProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<HeroRoute>("student");
  return <HeroRouteContext.Provider value={{ route, setRoute }}>{children}</HeroRouteContext.Provider>;
}

/**
 * The chosen route and a way to change it. Inside a HeroRouteProvider the
 * choice is shared; on its own (e.g. in a test) a component keeps its own.
 */
export function useHeroRoute(): HeroRouteState {
  const shared = useContext(HeroRouteContext);
  const [route, setRoute] = useState<HeroRoute>("student");
  return shared ?? { route, setRoute };
}
