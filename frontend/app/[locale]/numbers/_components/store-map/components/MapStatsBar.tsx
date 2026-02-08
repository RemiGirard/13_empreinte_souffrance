'use client';

import type { ReactNode } from 'react';
import type { MapColorPalette, StatsBarConfig, EnseigneConfig } from '../types';
import { DEFAULT_COLORS, DEFAULT_STATS_BAR } from '../types';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════════════════════════════════
   MapStatsBar — floating stats overlay
   ═══════════════════════════════════════════════════════════════════════════ */

/** Position → Tailwind classes mapping. */
const POSITION_CLASSES: Record<StatsBarConfig['position'], string> = {
  'top-left': 'top-3 left-3 sm:right-auto sm:left-3',
  'top-right': 'top-3 left-3 right-3 sm:left-auto sm:right-3',
  'bottom-left': 'bottom-3 left-3 sm:right-auto sm:left-3',
  'bottom-right': 'bottom-3 left-3 right-3 sm:left-auto sm:right-3',
};

type MapStatsBarProps = {
  total: number;
  withCage: number;
  selectedEnseigne: string | null;
  enseigneList: EnseigneConfig[];
  colors?: MapColorPalette;
  config?: StatsBarConfig;
  /** Completely replace the default rendering. */
  renderOverride?: (stats: { total: number; withCage: number; label: string }) => ReactNode;
};

export default function MapStatsBar({
  total,
  withCage,
  selectedEnseigne,
  enseigneList,
  colors = DEFAULT_COLORS,
  config = DEFAULT_STATS_BAR,
  renderOverride,
}: MapStatsBarProps) {
  if (!config.visible) return null;

  const pct = total > 0 ? Math.round((withCage / total) * 100) : 0;
  const label = selectedEnseigne
    ? enseigneList.find((e) => e.id === selectedEnseigne)?.name ?? ''
    : 'Tous les magasins';

  /* ── Custom renderer ──────────────────────────────────────────────────── */
  if (renderOverride) {
    return (
      <div
        className={clsx(
          'absolute sm:w-[260px] z-[2] pointer-events-none',
          POSITION_CLASSES[config.position],
        )}
      >
        <div className="pointer-events-auto">
          {renderOverride({ total, withCage, label })}
        </div>
      </div>
    );
  }

  /* ── Default renderer ─────────────────────────────────────────────────── */
  return (
    <div
      className={clsx(
        'absolute sm:w-[260px] z-[2] pointer-events-none',
        POSITION_CLASSES[config.position],
      )}
    >
      <div className="pointer-events-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 px-3 py-2.5">
        {/* Label */}
        <p className="text-[11px] text-gray-500 font-medium truncate">{label}</p>

        {/* Count */}
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span
            className="text-xl font-black tabular-nums"
            style={{ color: colors.cage }}
          >
            {withCage}
          </span>
          <span className="text-[11px] text-gray-400">
            / {total} magasins avec œufs cage
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: colors.cage }}
          />
        </div>
        <p className="text-right text-[10px] text-gray-400 mt-0.5">{pct} %</p>
      </div>
    </div>
  );
}
