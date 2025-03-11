'use client';

import { usePathname } from 'next/navigation';
import { trackTwitterEvent } from './tracking';
import { useEffect } from 'react';

export function RouteTracker() {
    const pathname = usePathname();

    useEffect(() => {
        trackTwitterEvent('pageview', { pathname });
    }, [pathname]);
  
  return null;
} 