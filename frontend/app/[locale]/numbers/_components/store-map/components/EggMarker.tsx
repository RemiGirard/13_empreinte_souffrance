'use client';

import { memo, useRef, useLayoutEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { DivIcon, Marker as LeafletMarker } from 'leaflet';
import type { MapColors, Store } from '../types';
import { COLORS } from '../types';
import MapPopup from './MapPopup';

type EggMarkerProps = {
  store: Store;
  cageIcon: DivIcon;
  freeIcon: DivIcon;
  colors?: MapColors;
};

export default memo(function EggMarker({ store, cageIcon, freeIcon, colors = COLORS }: EggMarkerProps) {
  const markerRef = useRef<LeafletMarker>(null);

  // Use useLayoutEffect to attach store data before paint
  // This runs synchronously after DOM mutations but before paint
  useLayoutEffect(() => {
    if (markerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (markerRef.current.options as any).store = store;
    }
  }, [store]);

  return (
    <Marker
      ref={markerRef}
      position={store.coords}
      icon={store.hasCageEggs ? cageIcon : freeIcon}
      // Pass store in eventHandlers context as backup
      eventHandlers={{
        add: (e) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (e.target.options as any).store = store;
        },
      }}
    >
      <Popup>
        <MapPopup store={store} colors={colors} />
      </Popup>
    </Marker>
  );
});
