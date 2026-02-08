'use client';

import type { Store, MapColorPalette, PopupConfig } from '../types';
import { DEFAULT_COLORS, DEFAULT_POPUP } from '../types';

/* ═══════════════════════════════════════════════════════════════════════════
   MapPopup — compact popup content for a single store
   ═══════════════════════════════════════════════════════════════════════════ */

type MapPopupProps = {
  store: Store;
  colors?: MapColorPalette;
  config?: PopupConfig;
};

/**
 * Renders the inner HTML of a Leaflet `<Popup>`.
 *
 * Every visual section can be toggled via `config`.
 *
 * ```tsx
 * <Popup><MapPopup store={s} /></Popup>
 * ```
 */
export default function MapPopup({
  store: s,
  colors = DEFAULT_COLORS,
  config = DEFAULT_POPUP,
}: MapPopupProps) {
  const color = s.hasCageEggs ? colors.cage : colors.noCage;
  const status = s.hasCageEggs ? "Présence d'œufs cage" : "Pas d'œufs cage";

  return (
    <div className="store-popup flex flex-col gap-[3px] min-w-[140px] max-w-[220px]">
      {/* Store name */}
      <p className="font-bold text-[13px] leading-tight !m-0">{s.name}</p>

      {/* Address */}
      <p className="text-[11px] text-gray-500 leading-snug !m-0">{s.address}</p>

      {/* Cage status */}
      {config.showCageStatus && (
        <p
          className="text-[11px] font-semibold text-center leading-tight !m-0 mt-0.5"
          style={{ color }}
        >
          {status}
        </p>
      )}

      {/* Reference count + photo link */}
      {(config.showRefCount || config.showPhotoLink) &&
        (s.nbRef > 0 || s.urlImg) && (
          <div className="flex items-center justify-between gap-2 text-[11px] !m-0 mt-0.5">
            {config.showRefCount && s.nbRef > 0 && (
              <span className="text-gray-600">
                Nombre de référence(s)&nbsp;: {s.nbRef}
              </span>
            )}
            {config.showPhotoLink && s.urlImg && (
              <a
                href={s.urlImg}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 shrink-0"
              >
                Photo
              </a>
            )}
          </div>
        )}
    </div>
  );
}
