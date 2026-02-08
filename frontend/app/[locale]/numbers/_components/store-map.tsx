/**
 * Re-export from the modular store-map package.
 *
 * This file exists so that existing imports like
 *   `import('./store-map')`
 * in store-map-client.tsx continue to resolve correctly.
 */
export { default } from './store-map/StoreMap';
export type { StoreMapProps } from './store-map/types';
