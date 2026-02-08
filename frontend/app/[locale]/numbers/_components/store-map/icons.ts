import L from 'leaflet';
import type { MapColorPalette, MarkerConfig } from './types';
import { DEFAULT_COLORS, DEFAULT_MARKER } from './types';

/* ═══════════════════════════════════════════════════════════════════════════
   Egg marker icon factory — cached, configurable
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Generate the inline SVG string for an egg-shaped marker.
 *
 * The path is a smooth egg bezier — narrower at the top, wider at the bottom —
 * rendered as a `divIcon` so Leaflet doesn't need to load external images.
 */
export function eggSvg(
  fill: string,
  stroke: string,
  width: number,
  height: number,
): string {
  // The viewBox is always 20×26; the actual <svg> is scaled to w×h.
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 20 26">` +
    `<path d="M10 0.5C15.52 0.5 19.5 9.07 19.5 15.77C19.5 22.47 15.52 25.5 10 25.5` +
    `C4.48 25.5 0.5 22.47 0.5 15.77C0.5 9.07 4.48 0.5 10 0.5Z" ` +
    `fill="${fill}" stroke="${stroke}" stroke-width="1"/>` +
    `</svg>`
  );
}

/* ─── Icon cache ──────────────────────────────────────────────────────────── */

const iconCache = new Map<string, L.DivIcon>();

function cacheKey(fill: string, stroke: string, w: number, h: number): string {
  return `${fill}|${stroke}|${w}|${h}`;
}

/**
 * Create (or return from cache) a Leaflet DivIcon with an egg-shaped SVG.
 *
 * ```ts
 * const icon = createEggIcon('#ff584b', '#d43d30');       // defaults
 * const big  = createEggIcon('#ff584b', '#d43d30', 24, 32); // custom size
 * ```
 */
export function createEggIcon(
  fill: string,
  stroke: string,
  width: number = DEFAULT_MARKER.width,
  height: number = DEFAULT_MARKER.height,
): L.DivIcon {
  const key = cacheKey(fill, stroke, width, height);
  const cached = iconCache.get(key);
  if (cached) return cached;

  const icon = L.divIcon({
    html: eggSvg(fill, stroke, width, height),
    className: 'egg-marker',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],          // bottom center
    popupAnchor: [0, -(height - 2)],          // just above the egg tip
  });

  iconCache.set(key, icon);
  return icon;
}

/**
 * Convenience: return both cage & free icons for a given palette+marker config.
 *
 * ```tsx
 * const { cage, free } = createEggIconPair(colors, marker);
 * ```
 */
export function createEggIconPair(
  colors: MapColorPalette = DEFAULT_COLORS,
  marker: MarkerConfig = DEFAULT_MARKER,
): { cage: L.DivIcon; free: L.DivIcon } {
  return {
    cage: createEggIcon(colors.cage, colors.cageStroke, marker.width, marker.height),
    free: createEggIcon(colors.noCage, colors.noCageStroke, marker.width, marker.height),
  };
}
