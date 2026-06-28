import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPage } from "@/features/bridge-explorer/components/DashboardPage";
import { getDashboardSummary } from "@/lib/bridgeRepository";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardRoute() {
  try {
    const summary = await getDashboardSummary();
    return <DashboardPage summary={summary} />;
  } catch {
    return (
      <main className="h-full overflow-auto bg-background p-4 text-foreground lg:p-6">
        <Card className="mx-auto max-w-2xl">
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
            <p>
              The dashboard could not read the local bridge database. Configure
              PostgreSQL/PostGIS and import data, then refresh this route.
            </p>
            <Link
              className="inline-flex h-8 items-center rounded-md border border-border bg-[var(--surface-elevated)] px-3 text-sm font-medium text-foreground hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/explorer"
            >
              Open Explorer
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }
}
