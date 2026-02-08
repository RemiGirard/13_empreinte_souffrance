'use client';

import type { CageFilterValue, MapColorPalette, FilterPanelConfig, EnseigneConfig } from '../types';
import { DEFAULT_COLORS, DEFAULT_FILTER_PANEL } from '../types';
import { eggSvg } from '../icons';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════════════════════════════════
   MapFilterPanel — cage toggles + enseigne logo grid
   ═══════════════════════════════════════════════════════════════════════════ */

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
  stroke,
  label,
  onClick,
}: {
  active: boolean;
  color: string;
  stroke: string;
  label: string;
  onClick: () => void;
}) {
  const egg = eggSvg(color, stroke, 14, 18);

  return (
    <button
      onClick={onClick}
      title={label}
      aria-pressed={active}
      className={clsx(
        'flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1 text-[11px] font-bold',
        'border-2 transition-all duration-200 cursor-pointer select-none whitespace-nowrap',
        active
          ? 'shadow-md scale-[1.02]'
          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:shadow-sm',
      )}
      style={
        active
          ? { color, borderColor: color, backgroundColor: `${color}12` }
          : {}
      }
    >
      <span className="inline-flex shrink-0" dangerouslySetInnerHTML={{ __html: egg }} />
      <span>{label}</span>
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
        'group flex items-center justify-center',
        'bg-transparent border-none p-0',
        'transition-all duration-200 cursor-pointer select-none',
        isSelected ? 'scale-[1.15]' : 'hover:scale-[1.1]',
      )}
    >
      <img
        alt={enseigne.name}
        src={enseigne.logo}
        className={clsx(
          'w-full h-full object-contain transition-all duration-200',
          isSelected
            ? 'brightness-110 saturate-110 drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]'
            : 'opacity-40 grayscale-[50%] group-hover:opacity-90 group-hover:grayscale-0 group-hover:drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]',
        )}
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
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 px-3 py-2.5">
        {/* ── Cage filter pills ──────────────────────────────────────────── */}
        {config.showCageFilter && (
          <div className="flex items-center gap-1.5 mb-2">
            <CageFilterButton
              active={cageFilter === 'cage'}
              color={colors.cage}
              stroke={colors.cageStroke}
              label="Œufs cage"
              onClick={() => onToggleCage('cage')}
            />
            <CageFilterButton
              active={cageFilter === 'noCage'}
              color={colors.noCage}
              stroke={colors.noCageStroke}
              label="Hors cage"
              onClick={() => onToggleCage('noCage')}
            />
          </div>
        )}

        {/* ── Divider ────────────────────────────────────────────────────── */}
        {config.showCageFilter && config.showEnseigneFilter && (
          <div className="h-px bg-gray-200/60 mb-2" />
        )}

        {/* ── Enseigne logo grid ─────────────────────────────────────────── */}
        {config.showEnseigneFilter && (
          <div
            className="grid items-center justify-items-center"
            style={{
              gridTemplateColumns: `repeat(${config.enseigneGridCols}, 48px)`,
              gap: '8px 12px',
            }}
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
