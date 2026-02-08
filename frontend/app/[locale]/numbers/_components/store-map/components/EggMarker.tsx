'use client';

import { Marker, Popup } from 'react-leaflet';
import type { ReactNode } from 'react';
import type { DivIcon } from 'leaflet';
import type { Store, MapColorPalette, PopupConfig } from '../types';
import { DEFAULT_COLORS, DEFAULT_POPUP } from '../types';
import MapPopup from './MapPopup';

/* ═══════════════════════════════════════════════════════════════════════════
   EggMarker — a single store marker (egg icon + popup)
   ═══════════════════════════════════════════════════════════════════════════ */

type EggMarkerProps = {
  store: Store;
  cageIcon: DivIcon;
  freeIcon: DivIcon;
  colors?: MapColorPalette;
  popupConfig?: PopupConfig;
  /** Fully replace the default popup renderer. */
  // eslint-disable-next-line no-unused-vars
  renderPopup?: (store: Store) => ReactNode;
};

export default function EggMarker({
  store,
  cageIcon,
  freeIcon,
  colors = DEFAULT_COLORS,
  popupConfig = DEFAULT_POPUP,
  renderPopup,
}: EggMarkerProps) {
  return (
    <Marker
      position={store.coords}
      icon={store.hasCageEggs ? cageIcon : freeIcon}
    >
      <Popup>
        {renderPopup
          ? renderPopup(store)
          : <MapPopup store={store} colors={colors} config={popupConfig} />
        }
      </Popup>
    </Marker>
  );
}
