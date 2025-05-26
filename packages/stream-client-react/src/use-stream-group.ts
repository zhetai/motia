import { useEffect, useState } from 'react'
import { useMotiaStream } from './use-motia-stream'
import { StreamSubscription } from '@motiadev/stream-client-browser'

export type StreamGroupArgs = {
  streamName: string
  groupId: string
}

/**
 * A hook to get a group of items from a stream.
 *
 * @example
 * ```tsx
 * const { data } = useStreamGroup<{ id:string; name: string }>({
 *   streamName: 'my-stream',
 *   groupId: '123',
 * })
 *
 * return (
 *   <div>
 *     {data.map((item) => (
 *       <div key={item.id}>{item.name}</div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export const useStreamGroup = <TData>(args?: StreamGroupArgs) => {
  const { stream } = useMotiaStream()
  const [data, setData] = useState<TData[]>([])
  const [event, setEvent] = useState<StreamSubscription | null>(null)

  useEffect(() => {
    if (!args?.streamName || !args?.groupId) return

    const subscription = stream.subscribeGroup(args.streamName, args.groupId)

    subscription.addChangeListener((data) => setData(data as TData[]))
    setEvent(subscription)

    return () => {
      setData([])
      setEvent(null)
      subscription.close()
    }
  }, [stream, args?.streamName, args?.groupId])

  return { data, event }
}
