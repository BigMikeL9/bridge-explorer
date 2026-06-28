"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import type { ActiveBridgeExplorerView } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import { useBridgeExplorerStore } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import { Grid2X2, Map, RotateCcw, Search } from "lucide-react";

const states = [
  { code: "01", name: "Alabama" },
  { code: "02", name: "Alaska" },
  { code: "04", name: "Arizona" },
  { code: "05", name: "Arkansas" },
  { code: "06", name: "California" },
  { code: "08", name: "Colorado" },
  { code: "09", name: "Connecticut" },
  { code: "10", name: "Delaware" },
  { code: "11", name: "District of Columbia" },
  { code: "12", name: "Florida" },
  { code: "13", name: "Georgia" },
  { code: "15", name: "Hawaii" },
  { code: "16", name: "Idaho" },
  { code: "17", name: "Illinois" },
  { code: "18", name: "Indiana" },
  { code: "19", name: "Iowa" },
  { code: "20", name: "Kansas" },
  { code: "21", name: "Kentucky" },
  { code: "22", name: "Louisiana" },
  { code: "23", name: "Maine" },
  { code: "24", name: "Maryland" },
  { code: "25", name: "Massachusetts" },
  { code: "26", name: "Michigan" },
  { code: "27", name: "Minnesota" },
  { code: "28", name: "Mississippi" },
  { code: "29", name: "Missouri" },
  { code: "30", name: "Montana" },
  { code: "31", name: "Nebraska" },
  { code: "32", name: "Nevada" },
  { code: "33", name: "New Hampshire" },
  { code: "34", name: "New Jersey" },
  { code: "35", name: "New Mexico" },
  { code: "36", name: "New York" },
  { code: "37", name: "North Carolina" },
  { code: "38", name: "North Dakota" },
  { code: "39", name: "Ohio" },
  { code: "40", name: "Oklahoma" },
  { code: "41", name: "Oregon" },
  { code: "42", name: "Pennsylvania" },
  { code: "44", name: "Rhode Island" },
  { code: "45", name: "South Carolina" },
  { code: "46", name: "South Dakota" },
  { code: "47", name: "Tennessee" },
  { code: "48", name: "Texas" },
  { code: "49", name: "Utah" },
  { code: "50", name: "Vermont" },
  { code: "51", name: "Virginia" },
  { code: "53", name: "Washington" },
  { code: "54", name: "West Virginia" },
  { code: "55", name: "Wisconsin" },
  { code: "56", name: "Wyoming" },
  { code: "72", name: "Puerto Rico" },
];

const countiesByState: Record<string, Array<{ code: string; name: string }>> = {
  "42": [
    { code: "003", name: "Allegheny" },
    { code: "101", name: "Philadelphia" },
    { code: "029", name: "Chester" },
    { code: "091", name: "Montgomery" },
  ],
  "36": [
    { code: "061", name: "New York" },
    { code: "047", name: "Kings" },
  ],
  "39": [
    { code: "035", name: "Cuyahoga" },
    { code: "049", name: "Franklin" },
  ],
  "34": [
    { code: "013", name: "Essex" },
    { code: "017", name: "Hudson" },
  ],
};

function ViewButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip label={label}>
      <Button
        aria-pressed={active}
        aria-label={label}
        className={active ? "bg-primary text-primary-foreground hover:bg-primary" : ""}
        onClick={onClick}
        size="icon"
        variant={active ? "default" : "ghost"}
      >
        {icon}
      </Button>
    </Tooltip>
  );
}

export function BridgeToolbar() {
  const search = useBridgeExplorerStore((state) => state.search);
  const filters = useBridgeExplorerStore((state) => state.filters);
  const activeView = useBridgeExplorerStore((state) => state.activeView);
  const setSearch = useBridgeExplorerStore((state) => state.setSearch);
  const setStateCode = useBridgeExplorerStore((state) => state.setStateCode);
  const setCountyCode = useBridgeExplorerStore((state) => state.setCountyCode);
  const setFilter = useBridgeExplorerStore((state) => state.setFilter);
  const setActiveView = useBridgeExplorerStore((state) => state.setActiveView);
  const resetFilters = useBridgeExplorerStore((state) => state.resetFilters);
  const availableCounties = filters.stateCode
    ? (countiesByState[filters.stateCode] ?? [])
    : [];

  const selectView = (view: ActiveBridgeExplorerView) => {
    setActiveView(view);
  };

  return (
    <section
      aria-label="Bridge explorer filters"
      className="border-y border-border bg-surface px-4 py-3"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.45fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(140px,0.75fr)_minmax(140px,0.75fr)]">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search bridges"
                className="pl-8"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Structure, route, feature"
                value={search}
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">State</span>
            <Select
              aria-label="Filter by state"
              onChange={(event) => setStateCode(event.target.value || null)}
              value={filters.stateCode ?? ""}
            >
              <option value="">All states</option>
              {states.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">County</span>
            <Select
              aria-label="Filter by county"
              disabled={!filters.stateCode}
              onChange={(event) => setCountyCode(event.target.value || null)}
              value={filters.countyCode ?? ""}
            >
              <option value="">
                {filters.stateCode ? "All counties" : "Select state first"}
              </option>
              {availableCounties.map((county) => (
                <option key={county.code} value={county.code}>
                  {county.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Condition</span>
            <Select
              aria-label="Filter by condition"
              onChange={(event) =>
                setFilter(
                  "bridgeCondition",
                  event.target.value
                    ? (event.target.value as typeof filters.bridgeCondition)
                    : null
                )
              }
              value={filters.bridgeCondition ?? ""}
            >
              <option value="">Any condition</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Unknown">Unknown</option>
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Priority</span>
            <Select
              aria-label="Filter by priority"
              onChange={(event) =>
                setFilter(
                  "priorityLevel",
                  event.target.value
                    ? (event.target.value as typeof filters.priorityLevel)
                    : null
                )
              }
              value={filters.priorityLevel ?? ""}
            >
              <option value="">Any priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
          </label>
        </div>

        <div className="flex items-center justify-between gap-2 xl:justify-end">
          <div className="flex items-center rounded-md border border-border bg-muted-surface p-0.5">
            <ViewButton
              active={activeView === "grid"}
              icon={<Grid2X2 className="h-4 w-4" />}
              label="Show grid view"
              onClick={() => selectView("grid")}
            />
            <ViewButton
              active={activeView === "map"}
              icon={<Map className="h-4 w-4" />}
              label="Show map view"
              onClick={() => selectView("map")}
            />
          </div>
          <Button onClick={resetFilters} variant="outline">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Badge tone="neutral">URL-backed</Badge>
        </div>
      </div>
    </section>
  );
}
