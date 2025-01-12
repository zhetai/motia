import { BaseNode } from '../../../publicComponents/base-node'
import { BaseNodeProps } from '../../../publicComponents/base-node-props'
import { LanguageIndicator } from './language-indicator'

export const BaseFlowNode = ({ data }: BaseNodeProps) => {
  return (
    <BaseNode className="relative" data={data}>
      <LanguageIndicator language={data.language} />
    </BaseNode>
  )
}
