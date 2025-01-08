import type { ReactNode } from 'react'
import clsx from 'clsx'
import Heading from '@theme/Heading'
import styles from './styles.module.css'
import chunk from 'lodash.chunk'

type FeatureItem = {
  title: string
  Svg: React.ComponentType<React.ComponentProps<'svg'>>
  description: ReactNode
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Developer-First Framework',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Wistro provides a rigorous, convention-based framework that developers love. Start simple with basic flows
        that are up and running in minutes, then seamlessly scale to more sophisticated scenarios as your needs grow.
        Its carefully crafted guardrails and patterns dramatically speed up development while ensuring consistency and
        reliability across flows of any complexity. Whether you're building a simple approval flow or orchestrating
        complex distributed systems, you get the perfect balance of flexibility and structure.
      </>
    ),
  },
  {
    title: 'Multi-Endpoint Reality',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Modern systems rarely live in one place. Write and manage your flows in one place, then deploy them
        anywhere. Wistro embraces distributed systems, making it natural to build flows that connect cloud services,
        on-prem systems, edge devices, and third-party APIs through a unified event-based interface. Design your
        flow once in Wistro's intuitive interface, and let the framework handle the complexity of deploying and
        orchestrating across your entire infrastructure - from cloud to edge to on-premises systems.
      </>
    ),
  },
  {
    title: 'Language & Runtime Freedom',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Flow components can be written in any language and run anywhere from laptops and phones to IoT devices and
        servers. Just install the lightweight Wistro endpoint and it handles everything else - deployment, versioning,
        updates, runtime management, and secure inbound/outbound traffic management. Whether you're running Node.js
        microservices, Python data processing, mobile apps, IoT firmware, or cloud functions, Wistro's lightweight
        event-based protocol means anything that can send and receive events can be part of your flow. No complex
        setup, infrastructure management, or security configuration required - Wistro takes care of the operational
        complexity so you can focus on your flow logic.
      </>
    ),
  },
  {
    title: 'Event-Driven Simplicity',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Rather than forcing complex RPC or REST patterns, Wistro uses simple event-based communication with clear
        conventions. Components listen for events they care about and emit events when they do something, making it easy
        to build loosely coupled, resilient flows while maintaining predictability.
      </>
    ),
  },
  {
    title: 'Human & External System Integration',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Because Wistro is message-based, flows can naturally pause for human approval, external system processing,
        or long-running operations. When the response comes back - whether it's a manager's approval, a third-party API
        callback, or a webhook from another system - the flow simply picks up exactly where it left off. This makes
        it trivial to build flows that span human decision points, external services, and time delays without
        complex state management.
      </>
    ),
  },
]

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): ReactNode {
  const rows = chunk(FeatureList, 3)
  return (
    <section className={styles.features}>
      <div className="container">
        {rows.map((row, idx) => (
          <div className="row justify-center " key={`row-${idx}`}>
            {row.map((props, idx) => (
              <div className={clsx(`col col--${12 / row.length}`)} key={`col-${idx}`}>
                <Feature key={idx} {...props} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
