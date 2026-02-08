import { useCallback, useMemo, useState } from 'react';
import type { CageFilterValue, FilterState, Store, EnseigneConfig } from './types';

/* ═══════════════════════════════════════════════════════════════════════════
   useStoreMapFilters — all filter logic in a single, testable hook
   ═══════════════════════════════════════════════════════════════════════════ */

export type UseStoreMapFiltersReturn = {
  /* state */
  cageFilter: CageFilterValue;
  selectedEnseigne: string | null;
  filterState: FilterState;

  /* derived data */
  filteredStores: Store[];
  stats: { total: number; withCage: number };

  /* actions */
  toggleCageFilter: (value: CageFilterValue) => void;
  toggleEnseigne: (enseigneId: string) => void;
  resetFilters: () => void;
};

/**
 * Encapsulates every piece of filter state + derived data for StoreMap.
 *
 * ```tsx
 * const { filteredStores, stats, toggleCageFilter, toggleEnseigne } =
 *   useStoreMapFilters(stores, enseignes);
 * ```
 */
export function useStoreMapFilters(
  stores: Store[],
  enseigneList: EnseigneConfig[],
): UseStoreMapFiltersReturn {
  const [cageFilter, setCageFilter] = useState<CageFilterValue>('all');
  const [selectedEnseigne, setSelectedEnseigne] = useState<string | null>(null);

  /* ── actions ─────────────────────────────────────────────────────────── */

  const toggleCageFilter = useCallback((value: CageFilterValue) => {
    setCageFilter((prev) => (prev === value ? 'all' : value));
  }, []);

  const toggleEnseigne = useCallback((enseigneId: string) => {
    setSelectedEnseigne((prev) => (prev === enseigneId ? null : enseigneId));
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
    const pool = selectedEnseigne
      ? stores.filter((s) => s.category === selectedEnseigne)
      : stores;
    return {
      total: pool.length,
      withCage: pool.filter((s) => s.hasCageEggs).length,
    };
  }, [stores, selectedEnseigne]);

  /* ── snapshot ────────────────────────────────────────────────────────── */

  const filterState: FilterState = useMemo(
    () => ({ cageFilter, selectedEnseigne }),
    [cageFilter, selectedEnseigne],
  );

  return {
    cageFilter,
    selectedEnseigne,
    filterState,
    filteredStores,
    stats,
    toggleCageFilter,
    toggleEnseigne,
    resetFilters,
  };
}
