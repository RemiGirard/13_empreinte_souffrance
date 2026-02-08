'use client';

import type { CageFilterValue, MapColorPalette, FilterPanelConfig, EnseigneConfig } from '../types';
import { DEFAULT_COLORS, DEFAULT_FILTER_PANEL } from '../types';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════════════════════════════════
   MapFilterPanel — cage toggles + enseigne grid
   ═══════════════════════════════════════════════════════════════════════════ */

/** Position → Tailwind classes mapping. */
const POSITION_CLASSES: Record<FilterPanelConfig['position'], string> = {
  'top-left': 'top-3 left-3',
  'top-right': 'top-3 right-3',
  'bottom-left': 'bottom-3 left-3',
  'bottom-right': 'bottom-3 right-3',
};

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function CageFilterButton({
  active,
  color,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  color: string;
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-pressed={active}
      className={clsx(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        'border transition-all cursor-pointer select-none whitespace-nowrap',
        active ? 'shadow-sm border-current' : 'border-gray-200 hover:border-gray-400',
      )}
      style={active ? { color, borderColor: color, backgroundColor: `${color}18` } : {}}
    >
      <img alt="" src={icon} className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function EnseigneButton({
  enseigne,
  isSelected,
  onClick,
}: {
  enseigne: EnseigneConfig;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={enseigne.name}
      aria-pressed={isSelected}
      className={clsx(
        'flex items-center justify-center rounded-lg p-1 border-2',
        'transition-all cursor-pointer select-none',
        isSelected
          ? 'border-blue-600 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-blue-300',
      )}
    >
      <img
        alt={enseigne.name}
        src={enseigne.logo}
        className="w-7 h-5 object-contain"
      />
    </button>
  );
}

/* ─── Main panel ──────────────────────────────────────────────────────────── */

type MapFilterPanelProps = {
  cageFilter: CageFilterValue;
  selectedEnseigne: string | null;
  enseigneList: EnseigneConfig[];
  onToggleCage: (value: CageFilterValue) => void;
  onToggleEnseigne: (id: string) => void;
  colors?: MapColorPalette;
  config?: FilterPanelConfig;
};

export default function MapFilterPanel({
  cageFilter,
  selectedEnseigne,
  enseigneList,
  onToggleCage,
  onToggleEnseigne,
  colors = DEFAULT_COLORS,
  config = DEFAULT_FILTER_PANEL,
}: MapFilterPanelProps) {
  if (!config.visible) return null;

  return (
    <div className={clsx('absolute z-[2]', POSITION_CLASSES[config.position])}>
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-2.5 max-w-[340px]">
        {/* ── Cage filter pills ──────────────────────────────────────────── */}
        {config.showCageFilter && (
          <div className="flex items-center gap-1.5 mb-2">
            <CageFilterButton
              active={cageFilter === 'cage'}
              color={colors.cage}
              label="Œufs cage"
              icon="/logo/egg_marker_cage.svg"
              onClick={() => onToggleCage('cage')}
            />
            <CageFilterButton
              active={cageFilter === 'noCage'}
              color={colors.noCage}
              label="Pas d'œufs cage"
              icon="/logo/egg_marker_free.svg"
              onClick={() => onToggleCage('noCage')}
            />
          </div>
        )}

        {/* ── Divider ────────────────────────────────────────────────────── */}
        {config.showCageFilter && config.showEnseigneFilter && (
          <div className="h-px bg-gray-200 mb-2" />
        )}

        {/* ── Enseigne grid ──────────────────────────────────────────────── */}
        {config.showEnseigneFilter && (
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${config.enseigneGridCols}, minmax(0, 1fr))` }}
          >
            {enseigneList.map((enseigne) => (
              <EnseigneButton
                key={enseigne.id}
                enseigne={enseigne}
                isSelected={selectedEnseigne === enseigne.id}
                onClick={() => onToggleEnseigne(enseigne.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
