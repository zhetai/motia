import type { Event } from '@motia/core'

export type RequestOptions = {
  body?: Record<string, unknown>
}

export type CapturedEvent<TData = unknown> = Omit<Event<TData>, 'logger'>
