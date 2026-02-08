import type { ReactNode } from 'react';
import type { EnseigneConfig } from '../../_data/store-data';

/* ═══════════════════════════════════════════════════════════════════════════
   Store Map — shared types & configuration
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Data types ──────────────────────────────────────────────────────────── */

/** A single store entry displayed on the map. */
export type Store = {
  name: string;
  coords: [number, number];
  category: string;
  address: string;
  hasCageEggs: boolean;
  nbRef: number;
  urlImg: string | null;
};

/** Re-export for convenience. */
export type { EnseigneConfig };

/* ─── Filter state ────────────────────────────────────────────────────────── */

/** The three possible cage-filter states. */
export type CageFilterValue = 'all' | 'cage' | 'noCage';

/** Snapshot of all active filters (returned by the hook). */
export type FilterState = {
  cageFilter: CageFilterValue;
  selectedEnseigne: string | null;
};

/* ─── Color palette ───────────────────────────────────────────────────────── */

export type MapColorPalette = {
  /** Marker & accent for stores with cage eggs. */
  cage: string;
  /** Darker stroke around cage markers. */
  cageStroke: string;
  /** Marker & accent for cage-free stores. */
  noCage: string;
  /** Darker stroke around cage-free markers. */
  noCageStroke: string;
};

/* ─── Map view settings ───────────────────────────────────────────────────── */

export type MapViewConfig = {
  /** Latitude/longitude center for initial view. */
  center: [number, number];
  /** Zoom level on ≥ md screens. */
  desktopZoom: number;
  /** Zoom level on < md screens. */
  mobileZoom: number;
  /** Min allowed zoom. */
  minZoom: number;
  /** Max allowed zoom. */
  maxZoom: number;
  /** Breakpoint (px) below which `mobileZoom` is used. */
  mobileBreakpoint: number;
};

/* ─── Marker settings ─────────────────────────────────────────────────────── */

export type MarkerConfig = {
  /** Width of the egg SVG marker (px). */
  width: number;
  /** Height of the egg SVG marker (px). */
  height: number;
};

/* ─── Stats overlay ───────────────────────────────────────────────────────── */

export type StatsBarConfig = {
  /** Whether to show the stats overlay at all. */
  visible: boolean;
  /** Position of the overlay. */
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

/* ─── Filter panel ────────────────────────────────────────────────────────── */

export type FilterPanelConfig = {
  /** Whether to show the filter panel at all. */
  visible: boolean;
  /** Position of the panel. */
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Show cage-filter pills. */
  showCageFilter: boolean;
  /** Show enseigne logo grid. */
  showEnseigneFilter: boolean;
  /** Number of columns in enseigne grid. */
  enseigneGridCols: number;
};

/* ─── Popup ───────────────────────────────────────────────────────────────── */

export type PopupConfig = {
  /** Show the cage-status line (colored text). */
  showCageStatus: boolean;
  /** Show the reference count. */
  showRefCount: boolean;
  /** Show the photo link. */
  showPhotoLink: boolean;
};

/* ─── Tile layer ──────────────────────────────────────────────────────────── */

export type TileConfig = {
  url: string;
  attribution: string;
};

/* ═══════════════════════════════════════════════════════════════════════════
   Top-level component props
   ═══════════════════════════════════════════════════════════════════════════ */

export type StoreMapProps = {
  /* ── Data ──────────────────────────────────────────────────────────────── */
  /** Store entries to display. Falls back to built-in dataset. */
  stores?: Store[];
  /** Enseigne definitions (id, name, logo). Falls back to built-in list. */
  enseignes?: EnseigneConfig[];

  /* ── Appearance ────────────────────────────────────────────────────────── */
  /** Color palette override. */
  colors?: Partial<MapColorPalette>;
  /** Map view/zoom override. */
  view?: Partial<MapViewConfig>;
  /** Marker size override. */
  marker?: Partial<MarkerConfig>;
  /** Tile provider override. */
  tile?: Partial<TileConfig>;

  /* ── Overlay configuration ────────────────────────────────────────────── */
  /** Stats bar overlay settings. */
  statsBar?: Partial<StatsBarConfig>;
  /** Filter panel settings. */
  filterPanel?: Partial<FilterPanelConfig>;
  /** Popup content settings. */
  popup?: Partial<PopupConfig>;

  /* ── Layout ───────────────────────────────────────────────────────────── */
  /** Height CSS class (e.g. "h-[500px]"). Defaults to "h-[70dvh] md:h-[560px]". */
  heightClassName?: string;
  /** Additional CSS classes on the root container. */
  className?: string;

  /* ── Render overrides ─────────────────────────────────────────────────── */
  /** Replace the default popup content with a fully custom renderer. */
  renderPopup?: (store: Store) => ReactNode;
  /** Replace the default stats bar with a fully custom renderer. */
  renderStatsBar?: (stats: { total: number; withCage: number; label: string }) => ReactNode;
  /** Slot for extra content rendered inside the root container. */
  children?: ReactNode;
};

/* ═══════════════════════════════════════════════════════════════════════════
   Defaults — single source of truth
   ═══════════════════════════════════════════════════════════════════════════ */

export const DEFAULT_COLORS: MapColorPalette = {
  cage: '#ff584b',
  cageStroke: '#d43d30',
  noCage: '#22C55E',
  noCageStroke: '#1a9e48',
};

export const DEFAULT_VIEW: MapViewConfig = {
  center: [46.8, 2.5],
  desktopZoom: 6,
  mobileZoom: 5,
  minZoom: 4,
  maxZoom: 18,
  mobileBreakpoint: 768,
};

export const DEFAULT_MARKER: MarkerConfig = {
  width: 18,
  height: 24,
};

export const DEFAULT_TILE: TileConfig = {
  url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap France',
};

export const DEFAULT_STATS_BAR: StatsBarConfig = {
  visible: false,
  position: 'top-right',
};

export const DEFAULT_FILTER_PANEL: FilterPanelConfig = {
  visible: true,
  position: 'bottom-left',
  showCageFilter: true,
  showEnseigneFilter: true,
  enseigneGridCols: 4,
};

export const DEFAULT_POPUP: PopupConfig = {
  showCageStatus: true,
  showRefCount: true,
  showPhotoLink: true,
};
