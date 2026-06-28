"use client";

import { BridgeDetailsDrawer } from "@/features/bridge-explorer/components/BridgeDetailsDrawer";
import { BridgeGrid } from "@/features/bridge-explorer/components/BridgeGrid";
import { BridgeMap } from "@/features/bridge-explorer/components/BridgeMap";
import { BridgeToolbar } from "@/features/bridge-explorer/components/BridgeToolbar";
import { RiskHotspotPanel } from "@/features/bridge-explorer/components/RiskHotspotPanel";
import { useBridgeExplorerStore } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import {
  hydrateBridgeExplorerState,
  serializeBridgeExplorerState,
} from "@/features/bridge-explorer/state/urlState";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

function UrlStateSync() {
  const state = useBridgeExplorerStore();
  const hydrate = useBridgeExplorerStore((store) => store.hydrate);
  const hasHydrated = useRef(false);

  useEffect(() => {
    hydrate(hydrateBridgeExplorerState(new URLSearchParams(window.location.search)));
    hasHydrated.current = true;

    const onPopState = () => {
      hydrate(hydrateBridgeExplorerState(new URLSearchParams(window.location.search)));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [hydrate]);

  useEffect(() => {
    if (!hasHydrated.current) {
      return;
    }

    const params = serializeBridgeExplorerState(state);
    const queryString = params.toString();
    const nextUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [state]);

  return null;
}

export function BridgeExplorerPage() {
  const [queryClient] = useState(() => new QueryClient());
  const activeView = useBridgeExplorerStore((state) => state.activeView);

  return (
    <QueryClientProvider client={queryClient}>
      <UrlStateSync />
      <main className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
        <BridgeToolbar />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <section
            className="min-h-0 min-w-0 flex-1 overflow-hidden px-4 py-3 lg:px-6"
            aria-label="Main view"
          >
            <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              {activeView === "grid" ? <BridgeGrid /> : <BridgeMap />}
              <RiskHotspotPanel />
            </div>
          </section>
          <BridgeDetailsDrawer />
        </div>
      </main>
    </QueryClientProvider>
  );
}
