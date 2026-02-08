'use client';

import type { Store, MapColorPalette, PopupConfig } from '../types';
import { DEFAULT_COLORS, DEFAULT_POPUP } from '../types';
import { eggSvg } from '../icons';

/* ═══════════════════════════════════════════════════════════════════════════
   MapPopup — rich, compact popup card for a single store
   ═══════════════════════════════════════════════════════════════════════════ */

type MapPopupProps = {
  store: Store;
  colors?: MapColorPalette;
  config?: PopupConfig;
};

export default function MapPopup({
  store: s,
  colors = DEFAULT_COLORS,
  config = DEFAULT_POPUP,
}: MapPopupProps) {
  const isCage = s.hasCageEggs;
  const accentColor = isCage ? colors.cage : colors.noCage;
  const bgTint = isCage ? 'rgba(255,88,75,0.07)' : 'rgba(34,197,94,0.07)';
  const statusLabel = isCage ? "Œufs cage" : "Hors cage";
  const statusIcon = eggSvg(accentColor, isCage ? colors.cageStroke : colors.noCageStroke, 12, 16);

  return (
    <div className="store-popup" style={{ minWidth: 180, maxWidth: 240 }}>
      {/* ── Header: colored accent bar + store name ──────────────────────── */}
      <div
        className="!m-0 -mx-3 -mt-2.5 px-3 pt-2 pb-1.5 rounded-t-lg"
        style={{ backgroundColor: bgTint, borderBottom: `2px solid ${accentColor}` }}
      >
        <p
          className="!m-0 font-extrabold text-[13px] leading-snug tracking-tight"
          style={{ color: '#242233' }}
        >
          {s.name}
        </p>
        <p className="!m-0 text-[10.5px] text-gray-400 leading-snug mt-px">
          {s.address}
        </p>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="pt-2 flex flex-col gap-1.5">

        {/* Status badge */}
        {config.showCageStatus && (
          <div
            className="flex items-center gap-1.5 rounded-full px-2 py-[3px] w-fit"
            style={{ backgroundColor: bgTint }}
          >
            <span
              className="inline-flex shrink-0"
              dangerouslySetInnerHTML={{ __html: statusIcon }}
            />
            <span
              className="text-[11px] font-bold leading-none"
              style={{ color: accentColor }}
            >
              {statusLabel}
            </span>
          </div>
        )}

        {/* Reference count */}
        {config.showRefCount && s.nbRef > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>
              <span className="font-semibold text-gray-700">{s.nbRef}</span> référence(s)
            </span>
          </div>
        )}

        {/* Photo link */}
        {config.showPhotoLink && s.urlImg && (
          <a
            href={s.urlImg}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-medium hover:underline transition-colors"
            style={{ color: accentColor }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="5.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1" />
              <path d="M1 11l4-3 3 2 2.5-2L15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voir la photo
          </a>
        )}
      </div>
    </div>
  );
}
