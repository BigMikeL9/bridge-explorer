"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { formatNumber } from "@/features/bridge-explorer/utils/formatters";
import type {
  DashboardDistributionItem,
  DashboardSummary,
  HotspotRow,
} from "@/lib/bridgeRepository";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Database,
  Gauge,
  Info,
  Route,
  Sparkles,
  TrafficCone,
} from "lucide-react";
import Link from "next/link";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useState } from "react";

const conditionOrder = ["Good", "Fair", "Poor", "Unknown"];
const priorityOrder = ["Critical", "High", "Medium", "Low"];

const sparklinePaths = [
  "M0 42 L18 50 L36 38 L54 41 L72 29 L90 32 L108 25 L126 18 L144 20 L162 12 L180 8",
  "M0 18 L18 26 L36 22 L54 30 L72 34 L90 28 L108 39 L126 31 L144 36 L162 34 L180 41",
  "M0 33 L18 29 L36 31 L54 27 L72 30 L90 25 L108 32 L126 28 L144 34 L162 29 L180 30",
];

const summaryCards = [
  {
    accent: "text-primary",
    change: "+ national",
    icon: Database,
    key: "totalBridges",
    label: "Total bridges",
    sparkline: sparklinePaths[0],
    tooltip: "Count of bridge records currently imported from the FHWA National Bridge Inventory.",
  },
  {
    accent: "text-[var(--condition-poor-text)]",
    change: "condition",
    icon: AlertTriangle,
    key: "poorConditionCount",
    label: "Poor condition bridges",
    sparkline: sparklinePaths[1],
    tooltip: "Count of bridges normalized to Poor condition from FHWA/NBI condition values.",
  },
  {
    accent: "text-[var(--priority-critical-text)]",
    change: "priority",
    icon: Activity,
    key: "criticalPriorityCount",
    label: "Critical priority bridges",
    sparkline: sparklinePaths[1],
    tooltip:
      "Count of bridges assigned Critical by the app's rule-based priority logic.",
  },
  {
    accent: "text-muted-foreground",
    change: "inventory",
    icon: Gauge,
    key: "averageBridgeAge",
    label: "Average bridge age",
    sparkline: sparklinePaths[2],
    tooltip: "Average calculated bridge age, derived from yearBuilt.",
  },
  {
    accent: "text-[var(--priority-high-text)]",
    change: "oldest",
    icon: CalendarClock,
    key: "oldestBridge",
    label: "Oldest bridge",
    sparkline: sparklinePaths[1],
    tooltip: "Maximum calculated bridge age in the imported dataset.",
  },
  {
    accent: "text-primary",
    change: "traffic",
    icon: TrafficCone,
    key: "averageDailyTraffic",
    label: "Average Daily Traffic",
    sparkline: sparklinePaths[0],
    tooltip: "Average Daily Traffic: average vehicles per day across imported bridge records.",
  },
] as const;

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch("/api/dashboard/summary");

  if (!response.ok) {
    throw new Error(`Dashboard summary failed with status ${response.status}`);
  }

  return response.json() as Promise<DashboardSummary>;
}

function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 5 * 60 * 1000,
  });
}

function summaryValue(summary: DashboardSummary, key: (typeof summaryCards)[number]["key"]) {
  if (key === "averageBridgeAge" || key === "oldestBridge") {
    return summary[key] === null
      ? "Unknown"
      : `${Math.round(summary[key])} yrs`;
  }

  if (key === "averageDailyTraffic") {
    return summary.averageDailyTraffic === null
      ? "Unknown"
      : formatNumber(Math.round(summary.averageDailyTraffic));
  }

  return formatNumber(summary[key]);
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--surface-elevated)] ${className}`}
    />
  );
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="mt-4 h-8 w-28" />
          </div>
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
        <div className="mt-5 flex items-end gap-3">
          <SkeletonBlock className="h-4 w-4 shrink-0 rounded-full" />
          <SkeletonBlock className="h-12 min-w-0 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  card,
  summary,
}: {
  card: (typeof summaryCards)[number];
  summary: DashboardSummary;
}) {
  const Icon = card.icon;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground">{card.label}</p>
              <Tooltip label={card.tooltip}>
                <span
                  aria-label={`About ${card.label}`}
                  className="inline-flex rounded-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  tabIndex={0}
                >
                  <Info className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Tooltip>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tracking-tight ">
              {summaryValue(summary, card.key)}
            </p>
          </div>
          <span className="mt-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {card.change}
          </span>
        </div>
        <div className="mt-5 flex items-end gap-3">
          <Icon className={`h-4 w-4 shrink-0 ${card.accent}`} aria-hidden />
          <svg
            aria-hidden="true"
            className="h-12 min-w-0 flex-1"
            preserveAspectRatio="none"
            viewBox="0 0 180 58"
          >
            <path
              d={`${card.sparkline} L180 58 L0 58 Z`}
              fill="currentColor"
              className={card.accent}
              opacity="0.12"
            />
            <path
              d={card.sparkline}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className={card.accent}
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

function getItemCount(items: DashboardDistributionItem[], label: string) {
  return items.find((item) => item.label === label)?.count ?? 0;
}

function conditionColorClassName(label: string) {
  if (label === "Good") {
    return "bg-[var(--condition-good-text)]";
  }
  if (label === "Fair") {
    return "bg-[var(--condition-fair-text)]";
  }
  if (label === "Poor") {
    return "bg-[var(--condition-poor-text)]";
  }

  return "bg-[var(--condition-unknown-text)]";
}

function priorityColor(label: string) {
  if (label === "Critical") {
    return "var(--priority-critical-text)";
  }
  if (label === "High") {
    return "var(--priority-high-text)";
  }
  if (label === "Medium") {
    return "var(--priority-medium-text)";
  }

  return "var(--priority-low-text)";
}

function ConditionDistributionPanel({
  items,
  total,
}: {
  items: DashboardDistributionItem[];
  total: number;
}) {
  const rows = conditionOrder
    .map((label) => ({ label, count: getItemCount(items, label) }))
    .filter((item) => item.count > 0 || item.label !== "Unknown");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Condition distribution</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Share of records in the imported bridge inventory.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((item) => {
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

          return (
            <div key={item.label}>
              <div className="mb-2 grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatNumber(item.count)}
                </span>
                <span className="w-10 text-right font-mono text-xs text-muted-foreground">
                  {percentage}%
                </span>
              </div>
              <div
                aria-label={`${item.label}: ${formatNumber(item.count)} bridges, ${percentage}%`}
                className="h-2 overflow-hidden rounded-full bg-[var(--surface-elevated)]"
                role="img"
              >
                <div
                  className={`dashboard-progress-fill h-full rounded-full ${conditionColorClassName(item.label)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ConditionDistributionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Condition distribution</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Share of records in the imported bridge inventory.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditionOrder.map((label, index) => (
          <div key={label}>
            <div className="mb-2 grid grid-cols-[1fr_auto_auto] items-center gap-3">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className={`h-3 ${index === 0 ? "w-16" : "w-12"}`} />
              <SkeletonBlock className="h-3 w-8" />
            </div>
            <SkeletonBlock className="h-2 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PriorityDistributionPanel({
  items,
  total,
}: {
  items: DashboardDistributionItem[];
  total: number;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const rows = priorityOrder.map((label) => ({
    label,
    count: getItemCount(items, label),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority distribution</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Mix of bridge priority levels across the imported inventory.
        </p>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[240px_1fr] lg:items-center">
        <div className="relative mx-auto h-48 w-48">
          <svg
            aria-label={`Priority mix for ${formatNumber(total)} bridges`}
            className="h-full w-full -rotate-90"
            role="img"
            viewBox="0 0 120 120"
          >
            <circle
              cx="60"
              cy="60"
              fill="none"
              r={radius}
              stroke="var(--surface-elevated)"
              strokeWidth="16"
            />
            {rows.map((item) => {
              const segmentLength = total > 0 ? (item.count / total) * circumference : 0;
              const segmentOffset = offset;
              offset += segmentLength;

              return (
                <circle
                  className="dashboard-donut-segment"
                  cx="60"
                  cy="60"
                  fill="none"
                  key={item.label}
                  r={radius}
                  stroke={priorityColor(item.label)}
                  strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                  strokeDashoffset={-segmentOffset}
                  strokeLinecap="round"
                  strokeWidth="16"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-muted-foreground">Priority mix</span>
            <span className="font-mono text-md font-semibold">{formatNumber(total)}</span>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="pb-2 text-left font-medium">Priority</th>
              <th className="pb-2 text-left font-medium">Bridges</th>
              <th className="pb-2 text-left font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

              return (
                <tr className="border-t border-[var(--border-subtle)]" key={item.label}>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: priorityColor(item.label) }}
                      />
                      <span className="font-medium">{item.label}</span>
                    </span>
                  </td>
                  <td className="font-mono text-xs text-muted-foreground">
                    {formatNumber(item.count)}
                  </td>
                  <td className="font-mono text-xs text-muted-foreground">{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function PriorityDistributionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority distribution</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Mix of bridge priority levels across the imported inventory.
        </p>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[240px_1fr] lg:items-center">
        <div className="relative mx-auto h-48 w-48">
          <SkeletonBlock className="h-48 w-48 rounded-full" />
          <div className="absolute inset-9 rounded-full bg-background" />
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_80px_40px] gap-3">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-3 w-14" />
            <SkeletonBlock className="h-3 w-5" />
          </div>
          {priorityOrder.map((label) => (
            <div
              className="grid grid-cols-[1fr_80px_40px] items-center gap-3 border-t border-[var(--border-subtle)] pt-3"
              key={label}
            >
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-2.5 w-2.5 rounded-full" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
              <SkeletonBlock className="h-3 w-14" />
              <SkeletonBlock className="h-3 w-7" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TopRiskStatesTable({ states }: { states: HotspotRow[] }) {
  return (
    <Card className="min-h-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Highest Risk States</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Ranked by composite risk score (condition, priority, age, and traffic).
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-center text-sm">
          <thead className="border-y border-border bg-[var(--surface-elevated)] text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left font-medium">State</th>
              <th className="px-4 py-2 text-center font-medium">Risk score</th>
              <th className="px-4 py-2 text-center font-medium">Poor</th>
              <th className="px-4 py-2 text-center font-medium">Critical</th>
              <th className="w-10 px-3 py-2" aria-label="Open state" />
            </tr>
          </thead>
          <tbody>
            {states.map((state) => (
              <tr
                className="group border-b border-[var(--border-subtle)] transition-colors last:border-b-0 hover:bg-[var(--surface-hover)]"
                key={state.stateCode}
              >
                <td className="px-4 py-2.5">
                  <Link
                    className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={`/explorer?stateCode=${state.stateCode}`}
                  >
                    <span className="font-medium">{state.stateName}</span>
                    <span className="rounded-md bg-[var(--surface-elevated)] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {state.stateCode}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">
                  {formatNumber(state.riskScore)}
                </td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">
                  {formatNumber(state.poorConditionCount)}
                </td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">
                  {formatNumber(state.criticalCount)}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <Link
                    aria-label={`Open ${state.stateName} in Explorer`}
                    className="inline-flex rounded-sm text-muted-foreground transition-colors group-hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={`/explorer?stateCode=${state.stateCode}`}
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function TopRiskStatesSkeleton() {
  return (
    <Card className="min-h-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Highest Risk States</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Ranked by composite risk score (condition, priority, age, and traffic).
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[1fr_120px_90px_90px_40px] border-y border-border bg-[var(--surface-elevated)] px-4 py-2">
          <SkeletonBlock className="h-3 w-14" />
          <SkeletonBlock className="mx-auto h-3 w-16" />
          <SkeletonBlock className="mx-auto h-3 w-10" />
          <SkeletonBlock className="mx-auto h-3 w-14" />
          <span />
        </div>
        <div>
          {Array.from({ length: 8 }, (_, index) => (
            <div
              className="grid grid-cols-[1fr_120px_90px_90px_40px] items-center border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0"
              key={index}
            >
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-5 w-8" />
              </div>
              <SkeletonBlock className="mx-auto h-4 w-14" />
              <SkeletonBlock className="mx-auto h-4 w-12" />
              <SkeletonBlock className="mx-auto h-4 w-12" />
              <SkeletonBlock className="mx-auto h-4 w-4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryTree({ summary }: { summary: DashboardSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Tree</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="rounded-lg bg-[var(--surface-selected)] px-3 py-2 font-medium">
          National NBI
        </div>
        <div className="space-y-2 pl-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {formatNumber(summary.statesCovered)} states covered
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--condition-poor-text)]" />
            {formatNumber(summary.poorConditionCount)} poor bridges
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--priority-critical-text)]" />
            {formatNumber(summary.criticalPriorityCount)} critical priority
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryTreeSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Tree</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <SkeletonBlock className="h-9 w-full" />
        <div className="space-y-3 pl-4 pt-1">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-4 w-40" />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden />
        <p className="mt-4 text-sm font-semibold">Explore bridge risk</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Open the Explorer workspace to filter by state, county, condition,
          priority, traffic, age, and map bounds.
        </p>
        <div className="mt-4 border-t border-[var(--border-subtle)] pt-3">
          <p className="text-xs font-medium text-muted-foreground">
            What you can do
          </p>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            {[
              "Filter and sort the full bridge inventory",
              "Visualize risk on the map",
              "Inspect bridge details",
              "Identify and prioritize needs",
            ].map((item) => (
              <li className="flex items-center gap-2" key={item}>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link
          className="mt-4 inline-flex h-8 items-center gap-2 rounded-md border border-border bg-[var(--surface-elevated)] px-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/explorer"
        >
          Launch workspace
          <Route className="h-4 w-4" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-[var(--priority-high-border)]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle
            className="h-4 w-4 text-[var(--priority-high-text)]"
            aria-hidden
          />
          <CardTitle>Dashboard data unavailable</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>The dashboard summary could not be loaded. The rest of the app is still available.</p>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex h-8 items-center rounded-md border border-border bg-[var(--surface-elevated)] px-3 text-sm font-medium text-foreground hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onRetry}
            type="button"
          >
            Try again
          </button>
          <Link
            className="inline-flex h-8 items-center rounded-md border border-border bg-[var(--surface-elevated)] px-3 text-sm font-medium text-foreground hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/explorer"
          >
            Open Explorer
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardLoadingContent() {
  return (
    <>
      <section
        aria-label="Dashboard summary loading"
        className="grid gap-4 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3"
      >
        {summaryCards.map((card) => (
          <MetricCardSkeleton key={card.key} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ConditionDistributionSkeleton />
        <PriorityDistributionSkeleton />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_392px]">
        <TopRiskStatesSkeleton />
        <div className="space-y-4">
          <QuickActionCard />
          <InventoryTreeSkeleton />
        </div>
      </section>
    </>
  );
}

function DashboardContent() {
  const query = useDashboardSummaryQuery();

  if (query.isLoading) {
    return <DashboardLoadingContent />;
  }

  if (query.isError || !query.data) {
    return <DashboardError onRetry={() => void query.refetch()} />;
  }

  const summary = query.data;

  return (
    <>
      <section
        aria-label="Dashboard summary"
        className="grid gap-4 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3"
      >
        {summaryCards.map((card) => (
          <MetricCard card={card} key={card.key} summary={summary} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ConditionDistributionPanel
          items={summary.conditionDistribution}
          total={summary.totalBridges}
        />
        <PriorityDistributionPanel
          items={summary.priorityDistribution}
          total={summary.totalBridges}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_392px]">
        <TopRiskStatesTable states={summary.highestRiskStates} />
        <div className="space-y-4">
          <QuickActionCard />
          <InventoryTree summary={summary} />
        </div>
      </section>
    </>
  );
}

export function DashboardPage() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <main className="h-full overflow-auto bg-background text-foreground">
        <div className="mx-auto flex max-w-[1640px] flex-col gap-4 px-4 py-5 lg:px-6">
          <section className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold tracking-normal">Overview</h1>
            <Link
              className="inline-flex h-8 items-center gap-2 rounded-md border border-[var(--brand-border)] bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-[var(--brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              href="/explorer"
            >
              Open Explorer
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>

          <DashboardContent />
        </div>
      </main>
    </QueryClientProvider>
  );
}
