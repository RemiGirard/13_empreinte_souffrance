import type { Store } from './types';

/**
 * Smart spatial filtering for map markers
 *
 * Strategy:
 * - At high zoom levels: show ALL markers in viewport
 * - At low zoom levels: use grid-based sampling to spread markers evenly
 *   and avoid overcrowding in dense areas (cities)
 *
 * The grid divides the viewport into cells, and we pick at most N markers per cell,
 * prioritizing diversity (mix of cage/no-cage stores).
 */

/** Desktop settings */
const DESKTOP = {
  FULL_DISPLAY_ZOOM: 10,
  MAX_MARKERS_ZOOMED_OUT: 1500,
  GRID_CELLS_MIN_ZOOM: 30,
  GRID_CELLS_MED_ZOOM: 50,
  MAX_PER_CELL: 10,
};

/** Mobile settings - reduced for performance */
const MOBILE = {
  FULL_DISPLAY_ZOOM: 11,
  MAX_MARKERS_ZOOMED_OUT: 400,
  GRID_CELLS_MIN_ZOOM: 15,
  GRID_CELLS_MED_ZOOM: 25,
  MAX_PER_CELL: 4,
};

type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};


export function smartFilterStores(
  stores: Store[],
  zoom: number,
  bounds: Bounds | null,
  isMobile: boolean = false
): Store[] {
  // No bounds yet = show nothing (map not ready)
  if (!bounds) return [];

  const config = isMobile ? MOBILE : DESKTOP;

  // Filter to viewport first
  const inViewport = stores.filter((s) => {
    const [lat, lng] = s.coords;
    return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
  });

  // At high zoom: show ALL markers in viewport
  if (zoom >= config.FULL_DISPLAY_ZOOM) {
    return inViewport;
  }

  // At low zoom: use grid-based spatial sampling
  return gridBasedSample(inViewport, zoom, bounds, config);
}

type Config = typeof DESKTOP;

/**
 * Grid-based spatial sampling
 * Divides viewport into cells and picks representative markers from each
 */
function gridBasedSample(stores: Store[], zoom: number, bounds: Bounds, config: Config): Store[] {
  // Determine grid size based on zoom
  // Lower zoom = fewer cells = more aggressive filtering
  const gridCells = zoom < 8 ? config.GRID_CELLS_MIN_ZOOM : config.GRID_CELLS_MED_ZOOM;

  // Calculate max markers based on zoom
  // zoom 6 = ~300, zoom 10 = ~600
  const maxMarkers = Math.round(config.MAX_MARKERS_ZOOMED_OUT * Math.pow(1.15, zoom - 6));

  const latRange = bounds.north - bounds.south;
  const lngRange = bounds.east - bounds.west;
  const cellLatSize = latRange / gridCells;
  const cellLngSize = lngRange / gridCells;

  // Group stores by grid cell
  const grid = new Map<string, Store[]>();

  for (const store of stores) {
    const [lat, lng] = store.coords;
    const cellRow = Math.floor((lat - bounds.south) / cellLatSize);
    const cellCol = Math.floor((lng - bounds.west) / cellLngSize);
    const cellKey = `${cellRow},${cellCol}`;

    if (!grid.has(cellKey)) {
      grid.set(cellKey, []);
    }
    grid.get(cellKey)!.push(store);
  }

  // Select markers from each cell with diversity priority
  const selected: Store[] = [];

  for (const cellStores of grid.values()) {
    // Sort to prioritize diversity: alternate cage/no-cage
    const sorted = sortForDiversity(cellStores);

    // Take up to MAX_PER_CELL from this cell
    for (let i = 0; i < Math.min(config.MAX_PER_CELL, sorted.length); i++) {
      selected.push(sorted[i]);
    }
  }

  // If still too many, do a final spread-based reduction
  if (selected.length > maxMarkers) {
    return spreadReduce(selected, maxMarkers);
  }

  return selected;
}

/**
 * Sort stores to prioritize diversity (mix of cage/no-cage)
 */
function sortForDiversity(stores: Store[]): Store[] {
  const cage = stores.filter((s) => s.hasCageEggs);
  const noCage = stores.filter((s) => !s.hasCageEggs);

  // Interleave cage and no-cage stores
  const result: Store[] = [];
  const maxLen = Math.max(cage.length, noCage.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < noCage.length) result.push(noCage[i]);
    if (i < cage.length) result.push(cage[i]);
  }

  return result;
}

/**
 * Reduce to N markers while maintaining spatial spread
 * Uses deterministic selection based on position hash
 */
function spreadReduce(stores: Store[], maxCount: number): Store[] {
  if (stores.length <= maxCount) return stores;

  // Sort by a spatial hash to ensure deterministic, spread-out selection
  const withHash = stores.map((s) => ({
    store: s,
    // Hash based on coordinates - creates consistent ordering
    hash: spatialHash(s.coords[0], s.coords[1]),
  }));

  withHash.sort((a, b) => a.hash - b.hash);

  // Take evenly spaced samples
  const step = stores.length / maxCount;
  const result: Store[] = [];

  for (let i = 0; i < maxCount; i++) {
    const idx = Math.floor(i * step);
    result.push(withHash[idx].store);
  }

  return result;
}

/**
 * Simple spatial hash for deterministic ordering
 * Interleaves lat/lng bits for good spatial distribution
 */
function spatialHash(lat: number, lng: number): number {
  // Normalize to 0-1000000 range for France
  const latNorm = Math.floor((lat - 41) * 100000);
  const lngNorm = Math.floor((lng + 6) * 100000);

  // Simple interleave-like hash
  return (latNorm * 73856093) ^ (lngNorm * 19349663);
}
