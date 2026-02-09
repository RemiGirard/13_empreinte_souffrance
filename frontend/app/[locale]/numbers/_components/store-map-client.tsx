'use client';

import dynamic from 'next/dynamic';
import type { StoreMapProps } from './store-map/types';

const StoreMapClient = dynamic(() => import('./store-map'), { ssr: false }) as React.ComponentType<StoreMapProps>;

export default StoreMapClient;
