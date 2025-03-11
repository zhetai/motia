'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { trackTwitterEvent } from './tracking'
import { useEffect, Suspense } from 'react'

function RouteTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    trackTwitterEvent('pageview', { pathname })
  }, [pathname, searchParams])

  return null
}

export function RouteTracker() {
  return (
    <Suspense fallback={null}>
      <RouteTrackerInner />
    </Suspense>
  )
}
