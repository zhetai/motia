import { StreamSubscription } from './stream-subscription'
import { GroupEventMessage, JoinMessage } from './stream.types'

export class StreamGroupSubscription<TData extends { id: string }> extends StreamSubscription<
  TData[],
  GroupEventMessage<TData>
> {
  constructor(sub: JoinMessage) {
    super(sub, [])
  }

  listener(message: GroupEventMessage<TData>): void {
    if (message.event.type === 'sync') {
      this.setState(message.event.data)
    } else if (message.event.type === 'create') {
      const id = message.event.data.id
      const state = this.getState()

      if (!state.find((item) => item.id === id)) {
        this.setState([...state, message.event.data])
      }
    } else if (message.event.type === 'update') {
      const messageData = message.event.data
      const messageDataId = messageData.id
      const state = this.getState()

      this.setState(state.map((item) => (item.id === messageDataId ? messageData : item)))
    } else if (message.event.type === 'delete') {
      const messageDataId = message.event.data.id
      const state = this.getState()

      this.setState(state.filter((item) => item.id !== messageDataId))
    } else if (message.event.type === 'event') {
      this.onEventReceived(message.event.event)
    }
  }
}
