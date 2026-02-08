'use client';

import dynamic from 'next/dynamic';
import type { StoreMapProps } from './store-map/types';

/**
 * Client-only wrapper around `<StoreMap>`.
 *
 * Leaflet requires `window`, so we lazy-load with `ssr: false`.
 * All props are forwarded transparently to `StoreMap`.
 *
 * Usage:
 *   <StoreMapClient />                              // zero-config
 *   <StoreMapClient heightClassName="h-[400px]" />  // customised
 */
const StoreMapClient = dynamic(
  () => import('./store-map'),
  { ssr: false },
) as React.ComponentType<StoreMapProps>;

export default StoreMapClient;
