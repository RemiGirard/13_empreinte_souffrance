'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { MapViewConfig } from '../types';
import { DEFAULT_VIEW } from '../types';

/* ═══════════════════════════════════════════════════════════════════════════
   MapInitializer — sets the correct zoom on first render
   ═══════════════════════════════════════════════════════════════════════════ */

type MapInitializerProps = {
  view?: MapViewConfig;
};

/**
 * Headless child of `<MapContainer>` that adjusts the viewport on mount
 * based on the current window width (mobile vs. desktop zoom).
 *
 * Renders nothing — it only talks to the Leaflet map instance.
 */
export default function MapInitializer({ view = DEFAULT_VIEW }: MapInitializerProps) {
  const map = useMap();

  useEffect(() => {
    const isMobile = window.innerWidth < view.mobileBreakpoint;
    map.setView(view.center, isMobile ? view.mobileZoom : view.desktopZoom, {
      animate: false,
    });
  }, [map, view]);

  return null;
}
