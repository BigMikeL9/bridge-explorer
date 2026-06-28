"use client";

import { BridgeDetailsDrawer } from "@/features/bridge-explorer/components/BridgeDetailsDrawer";
import { ConditionBadge } from "@/features/bridge-explorer/components/ConditionBadge";
import { BridgeGrid } from "@/features/bridge-explorer/components/BridgeGrid";
import { BridgeMap } from "@/features/bridge-explorer/components/BridgeMap";
import { BridgeToolbar } from "@/features/bridge-explorer/components/BridgeToolbar";
import { PriorityBadge } from "@/features/bridge-explorer/components/PriorityBadge";
import { RiskHotspotPanel } from "@/features/bridge-explorer/components/RiskHotspotPanel";
import { useBridgeExplorerStore } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import {
  hydrateBridgeExplorerState,
  serializeBridgeExplorerState,
} from "@/features/bridge-explorer/state/urlState";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Database, MapPinned } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const summaryItems = [
  { label: "Dataset", value: "National NBI" },
  { label: "Coverage", value: "All states ready" },
  { label: "Mode", value: "Grid + map" },
  { label: "Telemetry", value: "Details views" },
];

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
      <main className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-surface">
          <div className="flex flex-col gap-4 px-4 py-4 lg:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted-surface text-primary">
                    <MapPinned className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h1 className="text-xl font-semibold tracking-normal">
                    Bridge Explorer
                  </h1>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  National Bridge Inventory workspace for bridge screening and
                  infrastructure planning.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ConditionBadge condition="Good" />
                <ConditionBadge condition="Fair" />
                <PriorityBadge priority="Critical" />
              </div>
            </div>

            <section
              aria-label="Bridge Explorer summary"
              className="grid gap-2 md:grid-cols-4"
            >
              {summaryItems.map((item) => (
                <div
                  className="flex min-h-14 items-center justify-between rounded-md border border-border bg-muted-surface px-3"
                  key={item.label}
                >
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                  <Database
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </section>
          </div>
        </header>

        <BridgeToolbar />

        <div className="flex">
          <section
            className="min-w-0 flex-1 px-4 py-4 lg:px-6"
            aria-label="Main view"
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
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
