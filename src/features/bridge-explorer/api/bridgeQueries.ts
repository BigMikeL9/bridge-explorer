"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  BridgeDetailDto,
  BridgeGridResponse,
  BridgeMapResponse,
  RiskHotspotsResponse,
} from "./bridgeDtos";
import { useBridgeExplorerStore } from "../state/useBridgeExplorerStore";
import { toApiSearchParams } from "../state/urlState";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function appendParams(path: string, params: URLSearchParams): string {
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function useBridgeGridQuery() {
  const state = useBridgeExplorerStore();
  const params = toApiSearchParams(state);
  const queryString = params.toString();

  return useQuery({
    queryKey: ["bridges", "grid", queryString],
    queryFn: () =>
      fetchJson<BridgeGridResponse>(appendParams("/api/bridges", params)),
  });
}

export function useBridgeMapQuery() {
  const state = useBridgeExplorerStore();
  const params = toApiSearchParams(state, { includeBounds: true });
  const queryString = params.toString();
  const hasBounds = Boolean(state.mapBounds);

  return useQuery({
    enabled: hasBounds,
    queryKey: ["bridges", "map", queryString],
    queryFn: () =>
      fetchJson<BridgeMapResponse>(appendParams("/api/bridges/map", params)),
  });
}

export function useRiskHotspotsQuery() {
  const state = useBridgeExplorerStore();
  const params = toApiSearchParams(state);
  const queryString = params.toString();

  return useQuery({
    queryKey: ["bridges", "hotspots", queryString],
    queryFn: () =>
      fetchJson<RiskHotspotsResponse>(
        appendParams("/api/bridges/hotspots", params)
      ),
  });
}

export function useBridgeDetailsQuery() {
  const selectedBridgeId = useBridgeExplorerStore(
    (state) => state.selectedBridgeId
  );

  return useQuery({
    enabled: Boolean(selectedBridgeId),
    queryKey: ["bridges", "detail", selectedBridgeId],
    queryFn: () => {
      if (!selectedBridgeId) {
        throw new Error("Bridge details query requires a selected bridge id.");
      }

      return fetchJson<BridgeDetailDto>(`/api/bridges/${selectedBridgeId}`);
    },
  });
}
