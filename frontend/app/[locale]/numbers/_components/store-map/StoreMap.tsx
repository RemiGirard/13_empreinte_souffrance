'use client';

import { useCallback, useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import clsx from 'clsx';

import { enseignes as defaultEnseignes, store as defaultStores } from '../../_data/store-data';

import type {
  FilterPanelConfig,
  MapColorPalette,
  MapViewConfig,
  MarkerConfig,
  PopupConfig,
  StatsBarConfig,
  StoreMapProps,
  TileConfig,
} from './types';
import {
  DEFAULT_COLORS,
  DEFAULT_FILTER_PANEL,
  DEFAULT_MARKER,
  DEFAULT_POPUP,
  DEFAULT_STATS_BAR,
  DEFAULT_TILE,
  DEFAULT_VIEW,
} from './types';

import { createIconPairForStyle } from './icons';
import { useStoreMapFilters } from './hooks';

import { EggMarker, MapFilterPanel, MapInitializer, MapSettingsPanel, MapStatsBar, MapZoomTracker } from './components';

/* ═══════════════════════════════════════════════════════════════════════════
   StoreMap — highly customisable Leaflet map component
   ═══════════════════════════════════════════════════════════════════════════ */

/** Aspect ratio (width / height) of the illustrated egg marker. */
const MARKER_ASPECT = 22 / 28;

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

  const colors: MapColorPalette = useMemo(() => ({ ...DEFAULT_COLORS, ...colorsProp }), [colorsProp]);
  const view: MapViewConfig = useMemo(() => ({ ...DEFAULT_VIEW, ...viewProp }), [viewProp]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const _baseMarkerCfg: MarkerConfig = useMemo(() => ({ ...DEFAULT_MARKER, ...markerProp }), [markerProp]);
  const tile: TileConfig = useMemo(() => ({ ...DEFAULT_TILE, ...tileProp }), [tileProp]);
  const statsBarCfg: StatsBarConfig = useMemo(() => ({ ...DEFAULT_STATS_BAR, ...statsBarProp }), [statsBarProp]);
  const filterPanelCfg: FilterPanelConfig = useMemo(
    () => ({ ...DEFAULT_FILTER_PANEL, ...filterPanelProp }),
    [filterPanelProp]
  );
  const popupCfg: PopupConfig = useMemo(() => ({ ...DEFAULT_POPUP, ...popupProp }), [popupProp]);

  /* ── Filter + settings hook ──────────────────────────────────────────── */

  const {
    cageFilter,
    selectedEnseigne,
    markerStyle,
    markerSize,
    markerOpacity,
    showOutline,
    zoomScale,
    filteredStores,
    stats,
    toggleCageFilter,
    toggleEnseigne,
    setMarkerStyle,
    setMarkerSize,
    setMarkerOpacity,
    setShowOutline,
    setZoomScale,
  } = useStoreMapFilters(storeData, enseigneData);

  /* ── Zoom tracking ────────────────────────────────────────────────────── */

  /** Reference zoom level — the size slider value corresponds to this zoom. */
  const REF_ZOOM = 6;
  const [currentZoom, setCurrentZoom] = useState(view.desktopZoom);

  const onZoomChange = useCallback((z: number) => setCurrentZoom(z), []);

  /**
   * CSS scale factor applied via `--marker-zoom-scale` custom property.
   * Icons stay at the base size; the visual scaling is done purely in CSS
   * with a smooth transition — no icon recreation needed.
   */
  const zoomCssScale = useMemo(() => {
    if (zoomScale === 0) return 1;
    return Math.max(0.2, Math.min(4, Math.pow(2, (currentZoom - REF_ZOOM) * zoomScale * 0.5)));
  }, [currentZoom, zoomScale]);

  /* ── Marker size (from numeric slider — independent of zoom) ──────────── */

  const markerCfg: MarkerConfig = useMemo(
    () => ({
      width: Math.round(markerSize * MARKER_ASPECT),
      height: markerSize,
    }),
    [markerSize]
  );

  /* ── Icons (rebuild when style / size / opacity / outline change) ─────── */

  const icons = useMemo(
    () => createIconPairForStyle(markerStyle, colors, markerCfg, markerOpacity, showOutline),
    [markerStyle, colors, markerCfg, markerOpacity, showOutline]
  );

  /* ── Enseigne label for stats bar ────────────────────────────────────── */

  const enseigneLabel = selectedEnseigne
    ? (enseigneData.find((e) => e.id === selectedEnseigne)?.name ?? '')
    : 'Tous les magasins';

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden shadow-lg border border-gray-200/60 rounded-2xl',
        heightClassName,
        className
      )}
      style={{ '--marker-zoom-scale': zoomCssScale } as React.CSSProperties}
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
        <MapZoomTracker onZoomChange={onZoomChange} />

        <TileLayer key={tile.url} url={tile.url} attribution={tile.attribution} />

        {filteredStores.map((s, i) => (
          <EggMarker
            key={`${s.category}-${i}-${markerStyle}-${markerSize}-${markerOpacity}-${showOutline}`}
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

      {/* ─── Settings panel (top-right) ─── */}
      <MapSettingsPanel
        currentStyle={markerStyle}
        onChangeStyle={setMarkerStyle}
        markerSize={markerSize}
        onChangeMarkerSize={setMarkerSize}
        markerOpacity={markerOpacity}
        onChangeMarkerOpacity={setMarkerOpacity}
        showOutline={showOutline}
        onToggleOutline={setShowOutline}
        zoomScale={zoomScale}
        onChangeZoomScale={setZoomScale}
        storeCount={filteredStores.length}
        colors={colors}
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
