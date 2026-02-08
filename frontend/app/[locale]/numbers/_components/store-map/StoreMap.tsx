'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import clsx from 'clsx';

import {
  store as defaultStores,
  enseignes as defaultEnseignes,
} from '../../_data/store-data';

import type {
  StoreMapProps,
  MapColorPalette,
  MapViewConfig,
  MarkerConfig,
  TileConfig,
  StatsBarConfig,
  FilterPanelConfig,
  PopupConfig,
} from './types';
import {
  DEFAULT_COLORS,
  DEFAULT_VIEW,
  DEFAULT_MARKER,
  DEFAULT_TILE,
  DEFAULT_STATS_BAR,
  DEFAULT_FILTER_PANEL,
  DEFAULT_POPUP,
} from './types';

import { createEggIconPair } from './icons';
import { useStoreMapFilters } from './hooks';

import { EggMarker, MapFilterPanel, MapInitializer, MapStatsBar } from './components';

/* ═══════════════════════════════════════════════════════════════════════════
   StoreMap — highly customisable Leaflet map component
   ═══════════════════════════════════════════════════════════════════════════

   Zero-config:   <StoreMap />                         uses built-in data
   Customised:    <StoreMap colors={…} view={…} />     override any slice
   Fully custom:  <StoreMap renderPopup={…} />         own popup renderer

   ═══════════════════════════════════════════════════════════════════════════ */

export default function StoreMap({
  /* data */
  stores,
  enseignes,
  /* appearance */
  colors: colorsProp,
  view: viewProp,
  marker: markerProp,
  tile: tileProp,
  /* overlays */
  statsBar: statsBarProp,
  filterPanel: filterPanelProp,
  popup: popupProp,
  /* layout */
  heightClassName = 'h-[70dvh] md:h-[560px]',
  className,
  /* render overrides */
  renderPopup,
  renderStatsBar,
  children,
}: StoreMapProps) {
  /* ── Resolve config (merge user partial → defaults) ──────────────────── */

  const storeData = stores ?? defaultStores;
  const enseigneData = enseignes ?? defaultEnseignes;

  const colors: MapColorPalette = useMemo(
    () => ({ ...DEFAULT_COLORS, ...colorsProp }),
    [colorsProp],
  );
  const view: MapViewConfig = useMemo(
    () => ({ ...DEFAULT_VIEW, ...viewProp }),
    [viewProp],
  );
  const markerCfg: MarkerConfig = useMemo(
    () => ({ ...DEFAULT_MARKER, ...markerProp }),
    [markerProp],
  );
  const tile: TileConfig = useMemo(
    () => ({ ...DEFAULT_TILE, ...tileProp }),
    [tileProp],
  );
  const statsBarCfg: StatsBarConfig = useMemo(
    () => ({ ...DEFAULT_STATS_BAR, ...statsBarProp }),
    [statsBarProp],
  );
  const filterPanelCfg: FilterPanelConfig = useMemo(
    () => ({ ...DEFAULT_FILTER_PANEL, ...filterPanelProp }),
    [filterPanelProp],
  );
  const popupCfg: PopupConfig = useMemo(
    () => ({ ...DEFAULT_POPUP, ...popupProp }),
    [popupProp],
  );

  /* ── Icons (cached internally) ───────────────────────────────────────── */

  const icons = useMemo(
    () => createEggIconPair(colors, markerCfg),
    [colors, markerCfg],
  );

  /* ── Filter hook ─────────────────────────────────────────────────────── */

  const {
    cageFilter,
    selectedEnseigne,
    filteredStores,
    stats,
    toggleCageFilter,
    toggleEnseigne,
  } = useStoreMapFilters(storeData, enseigneData);

  /* ── Enseigne label for stats bar ────────────────────────────────────── */

  const enseigneLabel = selectedEnseigne
    ? enseigneData.find((e) => e.id === selectedEnseigne)?.name ?? ''
    : 'Tous les magasins';

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div
      className={clsx(
        'relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200/60',
        heightClassName,
        className,
      )}
    >
      {/* ─── Leaflet Map ─── */}
      <MapContainer
        center={view.center}
        zoom={view.desktopZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        minZoom={view.minZoom}
        maxZoom={view.maxZoom}
      >
        <MapInitializer view={view} />

        <TileLayer url={tile.url} attribution={tile.attribution} />

        {filteredStores.map((s, i) => (
          <EggMarker
            key={`${s.category}-${i}`}
            store={s}
            cageIcon={icons.cage}
            freeIcon={icons.free}
            colors={colors}
            popupConfig={popupCfg}
            renderPopup={renderPopup}
          />
        ))}
      </MapContainer>

      {/* ─── Stats overlay ─── */}
      <MapStatsBar
        total={stats.total}
        withCage={stats.withCage}
        selectedEnseigne={selectedEnseigne}
        enseigneList={enseigneData}
        colors={colors}
        config={statsBarCfg}
        renderOverride={
          renderStatsBar
            ? () => renderStatsBar({ total: stats.total, withCage: stats.withCage, label: enseigneLabel })
            : undefined
        }
      />

      {/* ─── Filter panel ─── */}
      <MapFilterPanel
        cageFilter={cageFilter}
        selectedEnseigne={selectedEnseigne}
        enseigneList={enseigneData}
        onToggleCage={toggleCageFilter}
        onToggleEnseigne={toggleEnseigne}
        colors={colors}
        config={filterPanelCfg}
      />

      {/* ─── User-provided children ─── */}
      {children}
    </div>
  );
}
