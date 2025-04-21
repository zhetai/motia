import './global.css'
import './fonts.css'
import { RootProvider } from 'fumadocs-ui/provider'
import { Inter, DM_Mono, DM_Sans } from 'next/font/google'
import Script from 'next/script'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { RouteTracker } from './utils/RouteTracker'
import { GoogleTagManager } from '@next/third-parties/google'
import type { WithContext, Organization } from 'schema-dts'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-P6672CSW'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
})

const dmSans = DM_Sans({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const SLACK_APP_ID = process.env.NEXT_PUBLIC_SLACK_APP_ID ?? 'YOUR_SLACK_APP_ID'
const YANDEX_VERIFICATION = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ?? 'YOUR_YANDEX_VERIFICATION'
const BING_VERIFICATION = process.env.NEXT_PUBLIC_BING_VERIFICATION ?? 'YOUR_BING_VERIFICATION'
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ?? 'YOUR_GOOGLE_VERIFICATION'

export const metadata: Metadata = {
  title: {
    template: '%s | motia',
    default: 'Motia - AI Agent Framework for Software Engineering Teams',
  },
  description:
    'Write in any language. Automate anything. From AI agents to backend automation, motia runs event-driven workflows with zero overhead.',
  keywords: ['AI', 'automation', 'event-driven workflows', 'software engineering', 'backend automation', 'developer tools'],
  metadataBase: new URL('https://motia.dev'),

  // Standard OpenGraph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://motia.dev',
    siteName: 'motia',
    title: 'Motia - AI Agent Framework for Software Engineering Teams',
    description:
      'Write in any language. Automate anything. From AI agents to backend automation, motia runs event-driven workflows with zero overhead.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Motia - AI Agent Framework for Software Engineering Teams',
      },
    ],
  },

  // Twitter/X
  twitter: {
    card: 'summary_large_image',
    site: '@motiadev',
    creator: '@motiadev',
    title: 'Motia - AI Agent Framework for Software Engineering Teams',
    description:
      'Write in any language. Automate anything. From AI agents to backend automation, motia runs event-driven workflows with zero overhead.',
    images: ['/og-image.png'],
  },

  // Icons and PWA
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#18181b',
      },
    ],
  },

  // Additional metadata
  other: {
    // Twitter alt text
    'twitter:image:alt': 'Motia - AI Agent Framework for Software Engineering Teams',

    // Instagram
    'instagram:card': 'summary_large_image',
    'instagram:title': 'Motia - AI Agent Framework for Software Engineering Teams',
    'instagram:description':
      'Write in any language. Automate anything. From AI agents to backend automation, motia runs event-driven workflows with zero overhead.',
    'instagram:image': 'https://motia.dev/og-image.png',

    // Reddit
    'reddit:title': 'Motia - AI Agent Framework for Software Engineering Teams',
    'reddit:description':
      'Write in any language. Automate anything. From AI agents to backend automation, motia runs event-driven workflows with zero overhead.',
    'reddit:image': 'https://motia.dev/og-image.png',

    // LinkedIn
    'linkedin:card': 'summary_large_image',
    'linkedin:title': 'Motia - AI Agent Framework for Software Engineering Teams',
    'linkedin:description':
      'Write in any language. Automate anything. From AI agents to backend automation, motia runs event-driven workflows with zero overhead.',
    'linkedin:image': 'https://motia.dev/og-image.png',

    // Slack
    'slack-app-id': SLACK_APP_ID,

    // PWA related
    'theme-color': '#18181b',
    'application-name': 'motia',
    'apple-mobile-web-app-title': 'motia',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#18181b',
    'msapplication-config': '/browserconfig.xml',
    'format-detection': 'telephone=no',

    // Search Engine
    'google-site-verification': GOOGLE_VERIFICATION,
    'yandex-verification': YANDEX_VERIFICATION,
    'bing-verification': BING_VERIFICATION,

    // Canonical URL (important for SEO)
    canonical: 'https://motia.dev',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification for webmaster tools
  verification: {
    google: GOOGLE_VERIFICATION,
  },
}

// Define typed JSON-LD structured data using schema-dts Organization type
const structuredData: WithContext<Organization> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Motia',
  url: 'https://motia.dev',
  logo: 'https://motia.dev/logos/logo-black.svg',
  sameAs: [
    'https://twitter.com/motiadev',
    'https://github.com/MotiaDev/motia',
    'https://discord.gg/nJFfsH5d6v',
  ],
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <GoogleTagManager gtmId={GTM_ID} />
        <Script src="https://buttons.github.io/buttons.js" strategy="afterInteractive" async defer />
        <Script src="/twitter-pixel.js" id="twitter-pixel" strategy="lazyOnload" />
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className="flex flex-col h-full min-h-dvh w-dvw landscape:min-h-screen landscape:h-full landscape:w-full p-0 m-0 gap-0"
        suppressHydrationWarning
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P6672CSW"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <RootProvider>
          {children}
          <Analytics />
          <RouteTracker />
        </RootProvider>
      </body>
    </html>
  )
}
