'use client';

import { useEffect, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

/* ═══════════════════════════════════════════════════════════════════════════
   MapZoomTracker — reports current zoom level to parent via callback
   ═══════════════════════════════════════════════════════════════════════════ */

type MapZoomTrackerProps = {
  // eslint-disable-next-line no-unused-vars
  onZoomChange: (zoom: number) => void;
};

/**
 * Headless child of `<MapContainer>` that tracks the current zoom level
 * and calls `onZoomChange` whenever it changes.
 * Renders nothing.
 */
export default function MapZoomTracker({ onZoomChange }: MapZoomTrackerProps) {
  const map = useMap();
  const [, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => {
      const z = map.getZoom();
      setZoom(z);
      onZoomChange(z);
    },
  });

  /* Report initial zoom on mount */
  useEffect(() => {
    onZoomChange(map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
