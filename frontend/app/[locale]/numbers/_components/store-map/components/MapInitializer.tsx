'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { MapViewConfig } from '../types';
import { DEFAULT_VIEW } from '../types';

/* ═══════════════════════════════════════════════════════════════════════════
   MapInitializer — fits the map to France on first render
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Bounding box of metropolitan France (approximate).
 * SW corner = bottom-left, NE corner = top-right.
 */
const FRANCE_BOUNDS: [[number, number], [number, number]] = [
  [41.3, -5.2],  // SW — south of Pyrénées, west of Brittany
  [51.1, 9.6],   // NE — north of Dunkerque, east of Alsace
];

/**
 * Tighter bounds for small screens — focuses on mainland store density
 * (cuts some empty edges to allow more zoom).
 */
const FRANCE_BOUNDS_TIGHT: [[number, number], [number, number]] = [
  [42.3, -3.5],  // SW — tighter
  [50.5, 8.5],   // NE — tighter
];

/** Below this width (px) we use the tighter bounds. */
const SMALL_SCREEN = 480;

type MapInitializerProps = {
  view?: MapViewConfig;
};

/**
 * Headless child of `<MapContainer>` that adjusts the viewport on mount
 * so that metropolitan France fits inside the container, regardless
 * of its width and height.
 *
 * On small screens (< 480px) uses tighter bounds so stores appear bigger.
 *
 * Renders nothing — it only talks to the Leaflet map instance.
 */
export default function MapInitializer({ view = DEFAULT_VIEW }: MapInitializerProps) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    const isSmall = window.innerWidth < SMALL_SCREEN;
    const bounds = isSmall ? FRANCE_BOUNDS_TIGHT : FRANCE_BOUNDS;
    const padding: [number, number] = isSmall ? [10, 5] : [20, 20];

    map.fitBounds(bounds, {
      animate: false,
      padding,
      maxZoom: view.maxZoom,
    });
  }, [map, view]);

  return null;
}
