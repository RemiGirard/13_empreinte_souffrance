import { useCallback, useMemo, useState } from 'react';
import type { CageFilterValue, MarkerStyle, FilterState, Store, EnseigneConfig } from './types';
import { DEFAULT_MARKER_SIZE, DEFAULT_MARKER_OPACITY, DEFAULT_SHOW_OUTLINE } from './types';

/* ═══════════════════════════════════════════════════════════════════════════
   useStoreMapFilters — all filter + settings logic in a single hook
   ═══════════════════════════════════════════════════════════════════════════ */

export type UseStoreMapFiltersReturn = {
  /* state */
  cageFilter: CageFilterValue;
  selectedEnseigne: string | null;
  markerStyle: MarkerStyle;
  markerSize: number;
  markerOpacity: number;
  showOutline: boolean;
  filterState: FilterState;

  /* derived data */
  filteredStores: Store[];
  stats: { total: number; withCage: number };

  /* actions */
  // eslint-disable-next-line no-unused-vars
  toggleCageFilter: (value: CageFilterValue) => void;
  // eslint-disable-next-line no-unused-vars
  toggleEnseigne: (enseigneId: string) => void;
  // eslint-disable-next-line no-unused-vars
  setMarkerStyle: (style: MarkerStyle) => void;
  // eslint-disable-next-line no-unused-vars
  setMarkerSize: (size: number) => void;
  // eslint-disable-next-line no-unused-vars
  setMarkerOpacity: (opacity: number) => void;
  // eslint-disable-next-line no-unused-vars
  setShowOutline: (show: boolean) => void;
  resetFilters: () => void;
};

/**
 * Encapsulates every piece of filter / settings state + derived data.
 */
export function useStoreMapFilters(
  stores: Store[],
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  enseigneList: EnseigneConfig[]
): UseStoreMapFiltersReturn {
  /* ── filter state ───────────────────────────────────────────────────── */
  const [cageFilter, setCageFilter] = useState<CageFilterValue>('all');
  const [selectedEnseigne, setSelectedEnseigne] = useState<string | null>(null);

  /* ── settings state ─────────────────────────────────────────────────── */
  const [markerStyle, setMarkerStyleState] = useState<MarkerStyle>('illustrated');
  const [markerSize, setMarkerSizeState] = useState<number>(DEFAULT_MARKER_SIZE);
  const [markerOpacity, setMarkerOpacityState] = useState<number>(DEFAULT_MARKER_OPACITY);
  const [showOutline, setShowOutlineState] = useState<boolean>(DEFAULT_SHOW_OUTLINE);

  /* ── actions ─────────────────────────────────────────────────────────── */

  const toggleCageFilter = useCallback((value: CageFilterValue) => {
    setCageFilter((prev) => (prev === value ? 'all' : value));
  }, []);

  const toggleEnseigne = useCallback((enseigneId: string) => {
    setSelectedEnseigne((prev) => (prev === enseigneId ? null : enseigneId));
  }, []);

  const setMarkerStyle = useCallback((style: MarkerStyle) => {
    setMarkerStyleState(style);
  }, []);

  const setMarkerSize = useCallback((size: number) => {
    setMarkerSizeState(size);
  }, []);

  const setMarkerOpacity = useCallback((opacity: number) => {
    setMarkerOpacityState(opacity);
  }, []);

  const setShowOutline = useCallback((show: boolean) => {
    setShowOutlineState(show);
  }, []);

  const resetFilters = useCallback(() => {
    setCageFilter('all');
    setSelectedEnseigne(null);
  }, []);

  /* ── derived: filtered stores ────────────────────────────────────────── */

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      if (cageFilter === 'cage' && !s.hasCageEggs) return false;
      if (cageFilter === 'noCage' && s.hasCageEggs) return false;
      if (selectedEnseigne && s.category !== selectedEnseigne) return false;
      return true;
    });
  }, [stores, cageFilter, selectedEnseigne]);

  /* ── derived: stats (based on enseigne only, ignoring cage filter) ──── */

  const stats = useMemo(() => {
    const pool = selectedEnseigne ? stores.filter((s) => s.category === selectedEnseigne) : stores;
    return {
      total: pool.length,
      withCage: pool.filter((s) => s.hasCageEggs).length,
    };
  }, [stores, selectedEnseigne]);

  /* ── snapshot ────────────────────────────────────────────────────────── */

  const filterState: FilterState = useMemo(
    () => ({ cageFilter, selectedEnseigne, markerStyle, markerSize, markerOpacity, showOutline }),
    [cageFilter, selectedEnseigne, markerStyle, markerSize, markerOpacity, showOutline]
  );

  return {
    cageFilter,
    selectedEnseigne,
    markerStyle,
    markerSize,
    markerOpacity,
    showOutline,
    filterState,
    filteredStores,
    stats,
    toggleCageFilter,
    toggleEnseigne,
    setMarkerStyle,
    setMarkerSize,
    setMarkerOpacity,
    setShowOutline,
    resetFilters,
  };
}
