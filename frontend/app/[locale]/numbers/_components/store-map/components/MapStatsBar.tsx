'use client';

import type { ReactNode } from 'react';
import type { MapColorPalette, StatsBarConfig, EnseigneConfig } from '../types';
import { DEFAULT_COLORS, DEFAULT_STATS_BAR } from '../types';
import clsx from 'clsx';

/** Illustrated egg icons used in stats display */
const STATS_ICONS = {
  cage: '/logo/marker_cage_egg.svg',
  free: '/logo/marker_free_egg.svg',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   MapStatsBar — floating stats overlay with dual-egg visual
   ═══════════════════════════════════════════════════════════════════════════ */

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
  // eslint-disable-next-line no-unused-vars
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

  const withoutCage = total - withCage;
  const pct = total > 0 ? Math.round((withCage / total) * 100) : 0;
  const label = selectedEnseigne
    ? enseigneList.find((e) => e.id === selectedEnseigne)?.name ?? ''
    : 'Tous les magasins';

  /* ── Custom renderer ────────────────────────────────────────────────── */
  if (renderOverride) {
    return (
      <div className={clsx('absolute sm:w-[280px] z-[2] pointer-events-none', POSITION_CLASSES[config.position])}>
        <div className="pointer-events-auto">
          {renderOverride({ total, withCage, label })}
        </div>
      </div>
    );
  }

  /* ── Default renderer ───────────────────────────────────────────────── */
  return (
    <div className={clsx('absolute sm:w-[280px] z-[2] pointer-events-none', POSITION_CLASSES[config.position])}>
      <div className="pointer-events-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="px-3.5 pt-2.5 pb-1.5">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{label}</p>
          <p className="text-[10px] text-gray-300 font-medium">{total} magasins inspectés</p>
        </div>

        {/* ── Two stat rows ─────────────────────────────────────────────── */}
        <div className="px-3.5 pb-1">
          {/* Cage row */}
          <div className="flex items-center gap-2 py-1">
            <img src={STATS_ICONS.cage} alt="" className="w-[14px] h-[18px] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="text-[18px] font-black tabular-nums leading-none" style={{ color: colors.cage }}>
                  {withCage}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">{pct}%</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">avec œufs cage</p>
            </div>
          </div>

          {/* Free row */}
          <div className="flex items-center gap-2 py-1">
            <img src={STATS_ICONS.free} alt="" className="w-[14px] h-[18px] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="text-[18px] font-black tabular-nums leading-none" style={{ color: colors.noCage }}>
                  {withoutCage}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">{100 - pct}%</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">sans œufs cage</p>
            </div>
          </div>
        </div>

        {/* ── Stacked progress bar ──────────────────────────────────────── */}
        <div className="px-3.5 pb-3">
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-gray-100 gap-px">
            <div
              className="h-full rounded-l-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: colors.cage }}
            />
            <div
              className="h-full rounded-r-full transition-all duration-500"
              style={{ width: `${100 - pct}%`, backgroundColor: colors.noCage }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
