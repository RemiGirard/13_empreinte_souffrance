/* ═══════════════════════════════════════════════════════════════════════════
   store-map — public barrel export
   ═══════════════════════════════════════════════════════════════════════════

   Usage (default):
     import StoreMap from '.../store-map';
     <StoreMap />

   Usage (customised):
     import StoreMap from '.../store-map';
     <StoreMap
       colors={{ cage: '#E11D48', cageStroke: '#BE123C', noCage: '#16A34A', noCageStroke: '#15803D' }}
       view={{ center: [48.85, 2.35], desktopZoom: 12, mobileZoom: 10 }}
       filterPanel={{ enseigneGridCols: 3 }}
       statsBar={{ position: 'top-left' }}
       heightClassName="h-[400px]"
     />

   Usage (sub-components):
     import { MapPopup, MapFilterPanel, MapStatsBar } from '.../store-map';

   Usage (utilities):
     import { createEggIcon, createEggIconPair } from '.../store-map';
     import { useStoreMapFilters } from '.../store-map';
   ═══════════════════════════════════════════════════════════════════════════ */

/* Default export = the full map component */
export { default } from './StoreMap';

/* Sub-components for advanced composition */
export { EggMarker, MapFilterPanel, MapInitializer, MapSettingsPanel, MapPopup, MapStatsBar } from './components';

/* Hook */
export { useStoreMapFilters } from './hooks';

/* Icon utilities */
export { createEggIcon, createEggIconPair, createCageEggIcon, createFreeEggIcon, createIconPairForStyle, eggSvg } from './icons';

/* Types */
export type {
  CageFilterValue,
  EnseigneConfig,
  FilterPanelConfig,
  FilterState,
  MapColorPalette,
  MapViewConfig,
  MarkerConfig,
  MarkerStyle,
  PopupConfig,
  StatsBarConfig,
  Store,
  StoreMapProps,
  TileConfig,
} from './types';

/* Defaults */
export {
  DEFAULT_COLORS,
  DEFAULT_FILTER_PANEL,
  DEFAULT_MARKER,
  DEFAULT_MARKER_OPACITY,
  DEFAULT_MARKER_SIZE,
  DEFAULT_POPUP,
  DEFAULT_STATS_BAR,
  DEFAULT_TILE,
  DEFAULT_VIEW,
} from './types';
