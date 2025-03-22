'use client';

import { usePathname } from 'next/navigation';
import { trackTwitterEvent, trackGTMEvent } from './tracking';
import { useEffect } from 'react';

export function RouteTracker() {
    const pathname = usePathname();

    useEffect(() => {
        trackTwitterEvent('pageview', { pathname });
        trackGTMEvent('page_view', { 
            page_path: pathname,
            page_title: document.title
        });
    }, [pathname]);
  
  return null;
} 