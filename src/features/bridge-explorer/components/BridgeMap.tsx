"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BridgeMapMarkerDto } from "@/features/bridge-explorer/api/bridgeDtos";
import { useBridgeMapQuery } from "@/features/bridge-explorer/api/bridgeQueries";
import { useBridgeExplorerStore } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import { formatNumber } from "@/features/bridge-explorer/utils/formatters";
import { cn } from "@/lib/utils";
import maplibregl, {
  type LngLatBoundsLike,
  type Map,
  type StyleSpecification,
} from "maplibre-gl";
import { LocateFixed, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const INITIAL_CENTER: [number, number] = [-98.5795, 39.8283];
const INITIAL_ZOOM = 3.2;
const NATIONAL_BOUNDS: LngLatBoundsLike = [
  [-125, 24],
  [-66, 50],
];
const STATE_BOUNDS: Record<string, LngLatBoundsLike> = {
  "01": [
    [-88.48, 30.14],
    [-84.89, 35.01],
  ],
  "02": [
    [-170, 51],
    [-129, 72],
  ],
  "04": [
    [-114.82, 31.33],
    [-109.04, 37.0],
  ],
  "05": [
    [-94.62, 33.0],
    [-89.64, 36.5],
  ],
  "06": [
    [-124.48, 32.53],
    [-114.13, 42.01],
  ],
  "08": [
    [-109.06, 36.99],
    [-102.04, 41.0],
  ],
  "09": [
    [-73.73, 40.98],
    [-71.78, 42.05],
  ],
  "10": [
    [-75.79, 38.45],
    [-75.05, 39.84],
  ],
  "11": [
    [-77.12, 38.79],
    [-76.91, 39.0],
  ],
  "12": [
    [-87.64, 24.52],
    [-80.03, 31.0],
  ],
  "13": [
    [-85.61, 30.36],
    [-80.84, 35.0],
  ],
  "15": [
    [-160.25, 18.85],
    [-154.8, 22.24],
  ],
  "16": [
    [-117.24, 42.0],
    [-111.04, 49.0],
  ],
  "17": [
    [-91.51, 36.97],
    [-87.02, 42.51],
  ],
  "18": [
    [-88.1, 37.77],
    [-84.78, 41.76],
  ],
  "19": [
    [-96.64, 40.37],
    [-90.14, 43.5],
  ],
  "20": [
    [-102.05, 36.99],
    [-94.59, 40.0],
  ],
  "21": [
    [-89.57, 36.5],
    [-81.96, 39.15],
  ],
  "22": [
    [-94.05, 28.92],
    [-88.82, 33.02],
  ],
  "23": [
    [-71.08, 42.98],
    [-66.95, 47.46],
  ],
  "24": [
    [-79.49, 37.91],
    [-75.05, 39.72],
  ],
  "25": [
    [-73.51, 41.19],
    [-69.93, 42.89],
  ],
  "26": [
    [-90.42, 41.69],
    [-82.12, 48.31],
  ],
  "27": [
    [-97.24, 43.5],
    [-89.49, 49.38],
  ],
  "28": [
    [-91.65, 30.17],
    [-88.1, 35.01],
  ],
  "29": [
    [-95.77, 35.99],
    [-89.1, 40.61],
  ],
  "30": [
    [-116.05, 44.36],
    [-104.04, 49.0],
  ],
  "31": [
    [-104.05, 39.99],
    [-95.31, 43.0],
  ],
  "32": [
    [-120.01, 35.0],
    [-114.04, 42.0],
  ],
  "33": [
    [-72.56, 42.7],
    [-70.61, 45.31],
  ],
  "34": [
    [-75.56, 38.92],
    [-73.89, 41.36],
  ],
  "35": [
    [-109.05, 31.33],
    [-103.0, 37.0],
  ],
  "36": [
    [-79.77, 40.49],
    [-71.78, 45.02],
  ],
  "37": [
    [-84.32, 33.84],
    [-75.46, 36.59],
  ],
  "38": [
    [-104.05, 45.94],
    [-96.55, 49.0],
  ],
  "39": [
    [-84.82, 38.4],
    [-80.52, 42.33],
  ],
  "40": [
    [-103.0, 33.62],
    [-94.43, 37.0],
  ],
  "41": [
    [-124.57, 41.99],
    [-116.46, 46.29],
  ],
  "42": [
    [-80.55, 39.65],
    [-74.68, 42.27],
  ],
  "44": [
    [-71.89, 41.14],
    [-71.12, 42.02],
  ],
  "45": [
    [-83.35, 32.03],
    [-78.54, 35.22],
  ],
  "46": [
    [-104.06, 42.48],
    [-96.44, 45.95],
  ],
  "47": [
    [-90.31, 34.98],
    [-81.65, 36.68],
  ],
  "48": [
    [-106.65, 25.84],
    [-93.51, 36.5],
  ],
  "49": [
    [-114.05, 36.99],
    [-109.04, 42.0],
  ],
  "50": [
    [-73.44, 42.73],
    [-71.46, 45.02],
  ],
  "51": [
    [-83.68, 36.54],
    [-75.24, 39.47],
  ],
  "53": [
    [-124.85, 45.54],
    [-116.91, 49.0],
  ],
  "54": [
    [-82.64, 37.2],
    [-77.72, 40.64],
  ],
  "55": [
    [-92.89, 42.49],
    [-86.25, 47.08],
  ],
  "56": [
    [-111.06, 40.99],
    [-104.05, 45.01],
  ],
  "72": [
    [-67.95, 17.88],
    [-65.22, 18.52],
  ],
};
const DARK_BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "carto-dark": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: "carto-dark",
      type: "raster",
      source: "carto-dark",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

function markerToneClassName(marker: BridgeMapMarkerDto) {
  if (marker.priorityLevel === "Critical") {
    return "bg-[var(--priority-critical-text)]";
  }
  if (marker.priorityLevel === "High") {
    return "bg-[var(--priority-high-text)]";
  }
  if (marker.priorityLevel === "Medium") {
    return "bg-[var(--priority-medium-text)]";
  }
  if (marker.bridgeCondition === "Poor") {
    return "bg-[var(--condition-poor-text)]";
  }
  if (marker.bridgeCondition === "Fair") {
    return "bg-[var(--condition-fair-text)]";
  }

  return "bg-[var(--condition-good-text)]";
}

function markerButtonClassName(isSelected: boolean) {
  return cn(
    "cursor-pointer group flex h-8 w-8 items-center justify-center rounded-full outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    isSelected && "z-10"
  );
}

function markerDotClassName(marker: BridgeMapMarkerDto, isSelected: boolean) {
  return cn(
    "block rounded-full border-[3px] border-background shadow-[0_2px_10px_rgba(0,0,0,0.5)] ring-1 ring-white/20",
    "transition-[box-shadow,border-color,opacity] duration-150 group-hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ring)_22%,transparent),0_3px_12px_rgba(0,0,0,0.54)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--ring)_36%,transparent)]",
    "group-focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ring)_26%,transparent),0_3px_12px_rgba(0,0,0,0.54)]",
    markerToneClassName(marker),
    isSelected
      ? "h-3.5 w-3.5 ring-4 ring-[color-mix(in_srgb,var(--ring)_42%,transparent)]"
      : "h-3 w-3"
  );
}

function markerLabel(marker: BridgeMapMarkerDto) {
  return `Bridge ${marker.structureNumber}: ${marker.bridgeCondition} condition, ${marker.priorityLevel} priority`;
}

function popupBadgeClassName(kind: "condition" | "priority", value: string) {
  if (kind === "condition") {
    if (value === "Good") {
      return "border-[var(--condition-good-border)] bg-[var(--condition-good-bg)] text-[var(--condition-good-text)]";
    }
    if (value === "Fair") {
      return "border-[var(--condition-fair-border)] bg-[var(--condition-fair-bg)] text-[var(--condition-fair-text)]";
    }
    if (value === "Poor") {
      return "border-[var(--condition-poor-border)] bg-[var(--condition-poor-bg)] text-[var(--condition-poor-text)]";
    }

    return "border-border bg-muted-surface text-muted-foreground";
  }

  if (value === "Critical") {
    return "border-[var(--priority-critical-border)] bg-[var(--priority-critical-bg)] text-[var(--priority-critical-text)]";
  }
  if (value === "High") {
    return "border-[var(--priority-high-border)] bg-[var(--priority-high-bg)] text-[var(--priority-high-text)]";
  }
  if (value === "Medium") {
    return "border-[var(--priority-medium-border)] bg-[var(--priority-medium-bg)] text-[var(--priority-medium-text)]";
  }

  return "border-[var(--priority-low-border)] bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]";
}

function createTextElement(tagName: "div" | "p" | "span", className: string, text: string) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;

  return element;
}

function createPopupBadge(kind: "condition" | "priority", value: string) {
  const badge = document.createElement("span");
  badge.className = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
    popupBadgeClassName(kind, value)
  );
  const dot = document.createElement("span");
  dot.className = "h-1.5 w-1.5 rounded-full bg-current";
  badge.appendChild(dot);
  badge.append(value);

  return badge;
}

function createMarkerPopupContent(
  marker: BridgeMapMarkerDto,
  onViewDetails: () => void
) {
  const container = document.createElement("div");
  container.className = "w-64 p-3 pr-8 text-sm text-foreground";

  const heading = createTextElement(
    "div",
    "truncate text-sm font-semibold tracking-normal",
    marker.structureNumber
  );
  container.appendChild(heading);

  if (marker.facilityCarried) {
    container.appendChild(
      createTextElement(
        "p",
        "mt-0.5 truncate text-xs text-muted-foreground",
        marker.facilityCarried
      )
    );
  }

  container.appendChild(
    createTextElement(
      "p",
      "mt-2 border-t border-border pt-2 text-xs text-muted-foreground",
      `${marker.stateName} / ${marker.countyName}`
    )
  );

  const badgeRow = document.createElement("div");
  badgeRow.className = "mt-3 flex flex-wrap gap-1.5";
  badgeRow.appendChild(createPopupBadge("condition", marker.bridgeCondition));
  badgeRow.appendChild(createPopupBadge("priority", marker.priorityLevel));
  container.appendChild(badgeRow);

  if (marker.averageDailyTraffic !== null) {
    container.appendChild(
      createTextElement(
        "p",
        "mt-3 rounded-md bg-muted-surface px-2.5 py-1.5 text-xs font-medium text-foreground",
        `ADT ${formatNumber(marker.averageDailyTraffic)}`
      )
    );
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "mt-3 inline-flex h-8 w-full items-center justify-center rounded-md border border-border bg-[var(--surface-elevated)] px-3 text-xs font-medium text-foreground transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  button.textContent = "View details";
  button.addEventListener("click", onViewDetails);
  container.appendChild(button);

  return container;
}

function boundsFromMap(map: Map) {
  const bounds = map.getBounds();

  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

function markerBounds(markers: BridgeMapMarkerDto[]): LngLatBoundsLike | null {
  if (markers.length === 0) {
    return null;
  }

  const bounds = new maplibregl.LngLatBounds();
  for (const marker of markers) {
    bounds.extend([marker.longitude, marker.latitude]);
  }

  if (markers.length === 1) {
    const marker = markers[0];
    return [
      [marker.longitude - 0.1, marker.latitude - 0.1],
      [marker.longitude + 0.1, marker.latitude + 0.1],
    ];
  }

  return bounds;
}

export function BridgeMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const lastCountyFitKeyRef = useRef<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const query = useBridgeMapQuery();
  const mapBounds = useBridgeExplorerStore((state) => state.mapBounds);
  const setMapBounds = useBridgeExplorerStore((state) => state.setMapBounds);
  const setSelectedBridgeId = useBridgeExplorerStore(
    (state) => state.setSelectedBridgeId
  );
  const selectedBridgeId = useBridgeExplorerStore((state) => state.selectedBridgeId);
  const filters = useBridgeExplorerStore((state) => state.filters);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      attributionControl: false,
      center: INITIAL_CENTER,
      container: containerRef.current,
      maxZoom: 14,
      minZoom: 2,
      style: DARK_BASEMAP_STYLE,
      zoom: INITIAL_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    const syncBounds = () => setMapBounds(boundsFromMap(map));

    map.on("load", () => {
      setIsMapReady(true);
      map.resize();
      syncBounds();
    });
    map.on("moveend", syncBounds);
    map.on("error", () => setMapError("Map basemap could not be loaded."));
    mapRef.current = map;

    window.requestAnimationFrame(() => {
      map.resize();
      syncBounds();
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [setMapBounds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const bounds = filters.stateCode
      ? STATE_BOUNDS[filters.stateCode]
      : NATIONAL_BOUNDS;
    if (bounds) {
      map.fitBounds(bounds, { padding: 48, duration: 600 });
    }
  }, [filters.stateCode]);

  useEffect(() => {
    const map = mapRef.current;
    const markers = query.data?.markers ?? [];

    // County boundary polygons are intentionally not bundled for this OA.
    // When a county is selected, fit to the returned county-filtered markers.
    if (!map || !filters.stateCode || !filters.countyCode || markers.length === 0) {
      return;
    }

    const fitKey = `${filters.stateCode}-${filters.countyCode}-${markers
      .map((marker) => marker.id)
      .join(",")}`;

    if (lastCountyFitKeyRef.current === fitKey) {
      return;
    }

    const bounds = markerBounds(markers);
    if (!bounds) {
      return;
    }

    lastCountyFitKeyRef.current = fitKey;
    map.fitBounds(bounds, { maxZoom: 11, padding: 72, duration: 600 });
  }, [filters.countyCode, filters.stateCode, query.data?.markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];
    popupRef.current?.remove();
    popupRef.current = null;

    for (const marker of query.data?.markers ?? []) {
      const isSelected = selectedBridgeId === marker.id;
      const element = document.createElement("button");
      const dot = document.createElement("span");

      element.type = "button";
      element.className = markerButtonClassName(isSelected);
      element.title = markerLabel(marker);
      element.setAttribute("aria-label", `Open ${markerLabel(marker)}`);
      element.setAttribute("aria-pressed", String(isSelected));
      dot.className = markerDotClassName(marker, isSelected);
      element.appendChild(dot);
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({
          className: "bridge-map-popup",
          closeButton: true,
          closeOnClick: true,
          maxWidth: "280px",
          offset: 18,
        })
          .setLngLat([marker.longitude, marker.latitude])
          .setDOMContent(
            createMarkerPopupContent(marker, () => {
              setSelectedBridgeId(marker.id);
              popupRef.current?.remove();
              popupRef.current = null;
            })
          )
          .addTo(map);
      });

      const mapMarker = new maplibregl.Marker({ element })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map);

      if (isSelected) {
        mapMarker.getElement().style.zIndex = "10";
      }

      markerRefs.current.push(mapMarker);
    }
  }, [query.data?.markers, selectedBridgeId, setSelectedBridgeId]);

  const shouldPromptForBounds = isMapReady && !mapBounds && !query.isError;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>Map View</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Bounded MapLibre markers from the national-safe map endpoint.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {query.data?.wasLimited ? (
            <Badge tone="high">Limited to {query.data.limit}</Badge>
          ) : null}
          <Badge tone="neutral">
            {query.data ? `${query.data.markers.length} markers` : "Map"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative min-h-0 flex-1 overflow-hidden p-0">
        <div
          ref={containerRef}
          className="absolute inset-0 h-full bg-muted-surface"
          data-testid="bridge-map-container"
        />

        {!isMapReady ? (
          <div className="absolute left-4 top-4 z-10 w-56 rounded-lg border border-border bg-surface p-3 shadow-[0_12px_28px_rgb(0_0_0/0.28)]">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
        ) : null}

        {query.isLoading ? (
          <div className="absolute left-4 top-4 z-10 rounded-lg border border-border bg-surface p-3 text-sm shadow-[0_12px_28px_rgb(0_0_0/0.28)]">
            Loading bounded bridge markers...
          </div>
        ) : null}

        {shouldPromptForBounds || query.data?.requiresBounds ? (
          <div className="absolute inset-x-4 top-4 z-10 rounded-lg border border-border bg-surface p-3 text-sm shadow-[0_12px_28px_rgb(0_0_0/0.28)] md:inset-x-auto md:w-80">
            <div className="flex gap-2">
              <LocateFixed className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Zoom or filter by state to load bridge markers.</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Markers are requested only after map bounds are available.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {query.isError ? (
          <div className="absolute left-4 top-4 z-10 rounded-lg border border-border bg-surface p-3 text-sm shadow-[0_12px_28px_rgb(0_0_0/0.28)]">
            <p className="font-medium">Map markers could not be loaded.</p>
            <Button
              className="mt-3"
              onClick={() => void query.refetch()}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : null}

        {mapError ? (
          <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-border bg-surface p-3 text-sm shadow-[0_12px_28px_rgb(0_0_0/0.28)]">
            <p className="font-medium">{mapError}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check network access to Carto raster tiles.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
