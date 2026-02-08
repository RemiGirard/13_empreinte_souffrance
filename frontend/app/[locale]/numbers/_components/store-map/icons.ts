import L from 'leaflet';
import type { MapColorPalette, MarkerConfig, MarkerStyle } from './types';
import { DEFAULT_COLORS, DEFAULT_MARKER } from './types';

/* ═══════════════════════════════════════════════════════════════════════════
   Egg marker icon factory — multiple styles, cached
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Illustrated marker SVG file paths ───────────────────────────────── */

const MARKER_ICONS = {
  cage: '/logo/marker_cage_egg.svg',
  free: '/logo/marker_free_egg.svg',
} as const;

/* ─── Inline SVG generators ───────────────────────────────────────────── */

/** Plain egg shape (no illustration). */
export function eggSvg(
  fill: string,
  stroke: string,
  width: number,
  height: number,
): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 20 26">` +
    `<path d="M10 0.5C15.52 0.5 19.5 9.07 19.5 15.77C19.5 22.47 15.52 25.5 10 25.5` +
    `C4.48 25.5 0.5 22.47 0.5 15.77C0.5 9.07 4.48 0.5 10 0.5Z" ` +
    `fill="${fill}" stroke="${stroke}" stroke-width="1"/>` +
    `</svg>`
  );
}

/** Filled circle. */
function circleSvg(
  fill: string,
  stroke: string,
  size: number,
): string {
  const r = size / 2 - 1;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>` +
    `</svg>`
  );
}

/* ─── Icon cache ──────────────────────────────────────────────────────── */

const iconCache = new Map<string, L.DivIcon>();

/* ─── Per-style factories ─────────────────────────────────────────────── */

function createIllustratedIcon(
  type: 'cage' | 'free',
  width: number,
  height: number,
  opacity: number,
): L.DivIcon {
  const key = `illustrated|${type}|${width}|${height}|${opacity}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const src = type === 'cage' ? MARKER_ICONS.cage : MARKER_ICONS.free;
  const styles = `width:${width}px;height:${height}px${opacity < 1 ? `;opacity:${opacity}` : ''}`;
  const icon = L.divIcon({
    html: `<img src="${src}" width="${width}" height="${height}" style="${styles}" alt="" />`,
    className: 'egg-marker',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -(height - 2)],
  });

  iconCache.set(key, icon);
  return icon;
}

function createPlainEggIcon(
  fill: string,
  stroke: string,
  width: number,
  height: number,
  opacity: number,
): L.DivIcon {
  const key = `egg|${fill}|${stroke}|${width}|${height}|${opacity}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const svgHtml = eggSvg(fill, stroke, width, height);
  const html = opacity < 1
    ? `<span style="opacity:${opacity}">${svgHtml}</span>`
    : svgHtml;

  const icon = L.divIcon({
    html,
    className: 'egg-marker',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -(height - 2)],
  });

  iconCache.set(key, icon);
  return icon;
}

function createCircleIcon(
  fill: string,
  stroke: string,
  size: number,
  opacity: number,
): L.DivIcon {
  const key = `circle|${fill}|${stroke}|${size}|${opacity}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const svgHtml = circleSvg(fill, stroke, size);
  const html = opacity < 1
    ? `<span style="opacity:${opacity}">${svgHtml}</span>`
    : svgHtml;

  const icon = L.divIcon({
    html,
    className: 'egg-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });

  iconCache.set(key, icon);
  return icon;
}

/* ─── Public API ──────────────────────────────────────────────────────── */

/** Shorthand kept for backward compat */
export function createCageEggIcon(w = DEFAULT_MARKER.width, h = DEFAULT_MARKER.height) {
  return createIllustratedIcon('cage', w, h, 1);
}
export function createFreeEggIcon(w = DEFAULT_MARKER.width, h = DEFAULT_MARKER.height) {
  return createIllustratedIcon('free', w, h, 1);
}

/** Legacy plain-egg factory */
export function createEggIcon(
  fill: string,
  stroke: string,
  width = DEFAULT_MARKER.width,
  height = DEFAULT_MARKER.height,
): L.DivIcon {
  return createPlainEggIcon(fill, stroke, width, height, 1);
}

/**
 * Return a cage/free icon pair for the given style.
 * @param opacity  Marker opacity (0.2–1.0). Defaults to 1.
 */
export function createIconPairForStyle(
  style: MarkerStyle,
  colors: MapColorPalette = DEFAULT_COLORS,
  marker: MarkerConfig = DEFAULT_MARKER,
  opacity = 1,
): { cage: L.DivIcon; free: L.DivIcon } {
  switch (style) {
    case 'illustrated':
      return {
        cage: createIllustratedIcon('cage', marker.width, marker.height, opacity),
        free: createIllustratedIcon('free', marker.width, marker.height, opacity),
      };
    case 'egg':
      return {
        cage: createPlainEggIcon(colors.cage, colors.cageStroke, marker.width, marker.height, opacity),
        free: createPlainEggIcon(colors.noCage, colors.noCageStroke, marker.width, marker.height, opacity),
      };
    case 'circle': {
      const size = Math.min(marker.width, marker.height);
      return {
        cage: createCircleIcon(colors.cage, colors.cageStroke, size, opacity),
        free: createCircleIcon(colors.noCage, colors.noCageStroke, size, opacity),
      };
    }
  }
}

/** Backward-compat alias — defaults to illustrated style. */
export function createEggIconPair(
  colors: MapColorPalette = DEFAULT_COLORS,
  marker: MarkerConfig = DEFAULT_MARKER,
): { cage: L.DivIcon; free: L.DivIcon } {
  return createIconPairForStyle('illustrated', colors, marker);
}
