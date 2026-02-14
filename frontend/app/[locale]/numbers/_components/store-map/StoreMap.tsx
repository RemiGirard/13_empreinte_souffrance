'use client';

import { useCallback, useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import clsx from 'clsx';

import { enseignes as defaultEnseignes, store as defaultStores } from '../../_data/store-data';
import type { EnseigneConfig, MarkerStyle, OutlineMode, Store } from './types';
import { COLORS } from './types';
import { createIconPairForStyle } from './icons';
import { useStoreMapFilters } from './hooks';
import { EggMarker, MapFilterPanel, MapInitializer, MapZoomTracker } from './components';
import { createClusterCustomIcon } from './clusterIcon';
import { MAX_CLUSTER_RADIUS, DISABLE_CLUSTERING_AT_ZOOM } from './clusterConfig';

type StoreMapProps = {
  stores?: Store[];
  enseignes?: EnseigneConfig[];
  /** Override the initial marker style (default: 'illustrated'). */
  initialStyle?: MarkerStyle;
  /** Override the initial marker size in px (default: 30). */
  initialSize?: number;
  /** Override the initial outline mode: 'none' | 'stroke' | 'shadow' (default: 'none'). */
  initialOutlineMode?: OutlineMode;
  /** Override the initial zoom-adaptive scale 0–1 (default: 0.25). */
  initialZoomScale?: number;
  heightClassName?: string;
  className?: string;
};

const REF_ZOOM = 6;

export default function StoreMap({
  stores,
  enseignes,
  initialStyle,
  initialSize,
  initialOutlineMode,
  initialZoomScale,
  heightClassName = 'h-[85dvh] md:h-[560px]',
  className,
}: StoreMapProps) {
  const storeData = stores ?? defaultStores;
  const enseigneData = enseignes ?? defaultEnseignes;

  const {
    cageFilter,
    selectedEnseigne,
    markerStyle,
    markerSize,
    outlineMode,
    strokeWidth,
    zoomScale,
    filteredStores,
    toggleCageFilter,
    toggleEnseigne,
  } = useStoreMapFilters(storeData, {
    style: initialStyle,
    size: initialSize,
    outlineMode: initialOutlineMode,
    zoomScale: initialZoomScale,
  });

  const [currentZoom, setCurrentZoom] = useState(5.5);
  const onZoomChange = useCallback((z: number) => setCurrentZoom(z), []);

  /*
   * NOTE: Bounds-based culling (visibleStores) was removed for cluster stability.
   * Using filteredStores ensures clusters don't recalculate when panning.
   * See STABILITY_FIX.md for details.
   */

  /*
   * CSS scale factor applied via `--marker-zoom-scale` custom property.
   * Icons stay at the base size; the visual scaling is done purely in CSS
   * with a smooth transition — no icon recreation needed.
   */
  const zoomCssScale = useMemo(() => {
    if (zoomScale === 0) return 1;
    const factor = Math.pow(2, (currentZoom - REF_ZOOM) * zoomScale * 0.2);
    return Math.max(0.3, Math.min(2.5, factor));
  }, [currentZoom, zoomScale]);

  const icons = useMemo(
    () => createIconPairForStyle(markerStyle, markerSize, outlineMode, COLORS, strokeWidth),
    [markerStyle, markerSize, outlineMode, strokeWidth]
  );

  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden shadow-lg border border-gray-200/60 rounded-2xl',
        heightClassName,
        className
      )}
      style={{ '--marker-zoom-scale': zoomCssScale, '--marker-stroke-w': `${strokeWidth}px` } as React.CSSProperties}
    >
      <MapContainer
        center={[46.8, 2.5]}
        zoom={6}
        scrollWheelZoom={true}
        zoomSnap={0.5}
        zoomDelta={0.5}
        className="w-full h-full z-0"
        minZoom={4}
        maxZoom={18}
      >
        <MapInitializer />
        <MapZoomTracker onZoomChange={onZoomChange} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap France"
        />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={MAX_CLUSTER_RADIUS}
          disableClusteringAtZoom={DISABLE_CLUSTERING_AT_ZOOM}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          animate={true}
          animateAddingMarkers={false}
          removeOutsideVisibleBounds={false}
        >
          {filteredStores.map((s, i) => (
            <EggMarker
              key={`${s.category}-${i}-${markerStyle}-${markerSize}-${outlineMode}-${strokeWidth}`}
              store={s}
              cageIcon={icons.cage}
              freeIcon={icons.free}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <MapFilterPanel
        cageFilter={cageFilter}
        selectedEnseigne={selectedEnseigne}
        enseigneList={enseigneData}
        onToggleCage={toggleCageFilter}
        onToggleEnseigne={toggleEnseigne}
      />
    </div>
  );
}
