'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { store, enseignes, type EnseigneConfig } from '../_data/store-data';
import type { Map as LeafletMap } from 'leaflet';

/* ────────────────────────────── constants ────────────────────────────── */

const COLORS = {
  cage: '#ff584b',
  noCage: '#22C55E',
} as const;

const FRANCE_CENTER: [number, number] = [46.8, 2.5];
const DESKTOP_ZOOM = 6;
const MOBILE_ZOOM = 5;
const BREAKPOINT_MD = 768;

/* ────────────────────── egg-shaped marker icons ──────────────────────── */

/** Inline SVG egg path — avoids extra HTTP requests and allows dynamic fill */
function eggSvg(fill: string, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 20 26">` +
    `<path d="M10 0.5C15.52 0.5 19.5 9.07 19.5 15.77C19.5 22.47 15.52 25.5 10 25.5` +
    `C4.48 25.5 0.5 22.47 0.5 15.77C0.5 9.07 4.48 0.5 10 0.5Z" ` +
    `fill="${fill}" stroke="${stroke}" stroke-width="1"/>` +
    `</svg>`;
}

const eggIconCage = L.divIcon({
  html: eggSvg(COLORS.cage, '#d43d30'),
  className: 'egg-marker',
  iconSize: [18, 24],
  iconAnchor: [9, 24],
  popupAnchor: [0, -22],
});

const eggIconFree = L.divIcon({
  html: eggSvg(COLORS.noCage, '#1a9e48'),
  className: 'egg-marker',
  iconSize: [18, 24],
  iconAnchor: [9, 24],
  popupAnchor: [0, -22],
});

/* ─────────────────────── responsive zoom helper ──────────────────────── */

function ResponsiveZoom() {
  const map = useMap();

  useEffect(() => {
    const isMobile = window.innerWidth < BREAKPOINT_MD;
    map.setView(FRANCE_CENTER, isMobile ? MOBILE_ZOOM : DESKTOP_ZOOM, { animate: false });
  }, [map]);

  return null;
}

/* ─────────────────────── filter-pill components ──────────────────────── */

type CageFilterValue = 'all' | 'cage' | 'noCage';

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
      className={`
        flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold
        border transition-all cursor-pointer select-none whitespace-nowrap
        ${active ? 'shadow-sm border-current' : 'border-gray-200 hover:border-gray-400'}
      `}
      style={active ? { color, borderColor: color, backgroundColor: `${color}18` } : {}}
    >
      <img alt="" src={icon} className="w-3.5 h-3.5" />
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
      className={`
        flex items-center justify-center rounded-lg p-1 border-2
        transition-all cursor-pointer select-none
        ${isSelected ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300'}
      `}
    >
      <img
        alt={enseigne.name}
        src={enseigne.logo}
        className="w-7 h-5 object-contain"
      />
    </button>
  );
}

/* ───────────────────── compact popup inner content ───────────────────── */

function StorePopup({
  name,
  address,
  hasCageEggs,
  nbRef,
  urlImg,
}: {
  name: string;
  address: string;
  hasCageEggs: boolean;
  nbRef: number;
  urlImg: string | null;
}) {
  const color = hasCageEggs ? COLORS.cage : COLORS.noCage;
  const status = hasCageEggs ? "Présence d'œufs cage" : "Pas d'œufs cage";

  return (
    <div className="store-popup flex flex-col gap-[3px] min-w-[140px] max-w-[220px]">
      <p className="font-bold text-[13px] leading-tight !m-0">{name}</p>
      <p className="text-[11px] text-gray-500 leading-snug !m-0">{address}</p>
      <p
        className="text-[11px] font-semibold text-center leading-tight !m-0 mt-0.5"
        style={{ color }}
      >
        {status}
      </p>
      {(nbRef > 0 || urlImg) && (
        <div className="flex items-center justify-between gap-2 text-[11px] !m-0 mt-0.5">
          {nbRef > 0 && (
            <span className="text-gray-600">
              Nombre de référence(s)&nbsp;: {nbRef}
            </span>
          )}
          {urlImg && (
            <a
              href={urlImg}
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

/* ─────────────────────────── stats bar ────────────────────────────────── */

function StatsBar({
  total,
  withCage,
  selectedEnseigne,
}: {
  total: number;
  withCage: number;
  selectedEnseigne: string | null;
}) {
  const pct = total > 0 ? Math.round((withCage / total) * 100) : 0;
  const label = selectedEnseigne
    ? enseignes.find((e) => e.id === selectedEnseigne)?.name ?? ''
    : 'Tous les magasins';

  return (
    <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-[260px] z-[2] pointer-events-none">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 px-3 py-2.5">
        <p className="text-[11px] text-gray-500 font-medium truncate">{label}</p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-xl font-black tabular-nums" style={{ color: COLORS.cage }}>
            {withCage}
          </span>
          <span className="text-[11px] text-gray-400">/ {total} magasins avec œufs cage</span>
        </div>
        {/* mini bar */}
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: COLORS.cage,
            }}
          />
        </div>
        <p className="text-right text-[10px] text-gray-400 mt-0.5">{pct} %</p>
      </div>
    </div>
  );
}

/* ════════════════════════════ MAIN COMPONENT ═════════════════════════════ */

export default function StoreMap() {
  /* ── state ───────────────────────────────────────────────────────────── */
  const [cageFilter, setCageFilter] = useState<CageFilterValue>('all');
  const [selectedEnseigne, setSelectedEnseigne] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  /* ── handlers ────────────────────────────────────────────────────────── */
  const toggleCageFilter = useCallback((value: CageFilterValue) => {
    setCageFilter((prev) => (prev === value ? 'all' : value));
  }, []);

  const toggleEnseigne = useCallback((enseigneId: string) => {
    setSelectedEnseigne((prev) => (prev === enseigneId ? null : enseigneId));
  }, []);

  /* ── filtering ───────────────────────────────────────────────────────── */
  const filteredStores = useMemo(() => {
    return store.filter((s) => {
      if (cageFilter === 'cage' && !s.hasCageEggs) return false;
      if (cageFilter === 'noCage' && s.hasCageEggs) return false;
      if (selectedEnseigne && s.category !== selectedEnseigne) return false;
      return true;
    });
  }, [cageFilter, selectedEnseigne]);

  /* ── stats (from filtered by enseigne only, ignoring cage filter) ──── */
  const stats = useMemo(() => {
    const pool = selectedEnseigne
      ? store.filter((s) => s.category === selectedEnseigne)
      : store;
    return {
      total: pool.length,
      withCage: pool.filter((s) => s.hasCageEggs).length,
    };
  }, [selectedEnseigne]);

  /* ── render ──────────────────────────────────────────────────────────── */
  return (
    <div className="relative w-full h-[70dvh] md:h-[560px] rounded-xl overflow-hidden shadow-md border border-gray-100">
      {/* ─── MAP ─── */}
      <MapContainer
        center={FRANCE_CENTER}
        zoom={DESKTOP_ZOOM}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        minZoom={4}
        maxZoom={18}
        ref={mapRef}
      >
        <ResponsiveZoom />
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap France"
        />

        {filteredStores.map((s, i) => (
          <Marker
            key={`${s.category}-${i}`}
            position={s.coords}
            icon={s.hasCageEggs ? eggIconCage : eggIconFree}
          >
            <Popup>
              <StorePopup
                name={s.name}
                address={s.address}
                hasCageEggs={s.hasCageEggs}
                nbRef={s.nbRef}
                urlImg={s.urlImg}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ─── STATS BAR (top-right) ─── */}
      <StatsBar
        total={stats.total}
        withCage={stats.withCage}
        selectedEnseigne={selectedEnseigne}
      />

      {/* ─── FILTER PANEL (bottom-left) ─── */}
      <div className="absolute bottom-3 left-3 z-[2]">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-2.5 max-w-[340px]">
          {/* Cage / no-cage toggles */}
          <div className="flex items-center gap-1.5 mb-2">
            <CageFilterButton
              active={cageFilter === 'cage'}
              color={COLORS.cage}
              label="Œufs cage"
              icon="/logo/egg_marker_cage.svg"
              onClick={() => toggleCageFilter('cage')}
            />
            <CageFilterButton
              active={cageFilter === 'noCage'}
              color={COLORS.noCage}
              label="Pas d'œufs cage"
              icon="/logo/egg_marker_free.svg"
              onClick={() => toggleCageFilter('noCage')}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-2" />

          {/* Enseigne grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {enseignes.map((enseigne) => (
              <EnseigneButton
                key={enseigne.id}
                enseigne={enseigne}
                isSelected={selectedEnseigne === enseigne.id}
                onClick={() => toggleEnseigne(enseigne.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
