"use client";

import type { BridgeCondition, PriorityLevel } from "@/domain/bridge";
import type { BridgeSortField, SortDirection } from "@/lib/queryParams";
import { create } from "zustand";
import { defaultBridgeExplorerState } from "./urlState";

export type ActiveBridgeExplorerView = "grid" | "map";

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface BridgeExplorerFilters {
  stateCode: string | null;
  countyCode: string | null;
  bridgeCondition: BridgeCondition | null;
  priorityLevel: PriorityLevel | null;
  minAge: number | null;
  maxAge: number | null;
  minAdt: number | null;
  maxAdt: number | null;
}

export interface BridgeExplorerSort {
  sortBy: BridgeSortField;
  sortDirection: SortDirection;
}

export interface BridgeExplorerPagination {
  page: number;
  pageSize: number;
}

export interface BridgeExplorerDataState {
  search: string;
  filters: BridgeExplorerFilters;
  sort: BridgeExplorerSort;
  pagination: BridgeExplorerPagination;
  mapBounds: MapBounds | null;
  selectedBridgeId: string | null;
  activeView: ActiveBridgeExplorerView;
}

export interface BridgeExplorerState extends BridgeExplorerDataState {
  hydrate: (state: BridgeExplorerDataState) => void;
  setSearch: (search: string) => void;
  setStateCode: (stateCode: string | null) => void;
  setCountyCode: (countyCode: string | null) => void;
  setFilter: <K extends keyof Omit<BridgeExplorerFilters, "stateCode" | "countyCode">>(
    key: K,
    value: BridgeExplorerFilters[K]
  ) => void;
  setSort: (sort: BridgeExplorerSort) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setMapBounds: (mapBounds: MapBounds | null) => void;
  setSelectedBridgeId: (selectedBridgeId: string | null) => void;
  setActiveView: (activeView: ActiveBridgeExplorerView) => void;
  resetFilters: () => void;
}

function resetToFirstPage(
  pagination: BridgeExplorerPagination
): BridgeExplorerPagination {
  return { ...pagination, page: 1 };
}

export const useBridgeExplorerStore = create<BridgeExplorerState>((set) => ({
  ...defaultBridgeExplorerState,
  hydrate: (state) => set(state),
  setSearch: (search) =>
    set((state) => ({
      search,
      pagination: resetToFirstPage(state.pagination),
    })),
  setStateCode: (stateCode) =>
    set((state) => ({
      filters: {
        ...state.filters,
        stateCode,
        countyCode: null,
      },
      pagination: resetToFirstPage(state.pagination),
    })),
  setCountyCode: (countyCode) =>
    set((state) => ({
      filters: {
        ...state.filters,
        countyCode: state.filters.stateCode ? countyCode : null,
      },
      pagination: resetToFirstPage(state.pagination),
    })),
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
      pagination: resetToFirstPage(state.pagination),
    })),
  setSort: (sort) =>
    set((state) => ({
      sort,
      pagination: resetToFirstPage(state.pagination),
    })),
  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),
  setPageSize: (pageSize) =>
    set((state) => ({
      pagination: { ...state.pagination, page: 1, pageSize },
    })),
  setMapBounds: (mapBounds) => set({ mapBounds }),
  setSelectedBridgeId: (selectedBridgeId) => set({ selectedBridgeId }),
  setActiveView: (activeView) => set({ activeView }),
  resetFilters: () =>
    set((state) => ({
      search: "",
      filters: defaultBridgeExplorerState.filters,
      pagination: resetToFirstPage(state.pagination),
    })),
}));
