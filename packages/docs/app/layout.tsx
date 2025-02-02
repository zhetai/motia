import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Motia',
    default: 'Motia - Code-first framework for intelligent workflows',
  },
  description: 'Write in any language. Automate anything. From AI agents to backend automation, Motia runs event-driven workflows with zero overhead.',
  metadataBase: new URL('https://motia.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://motia.dev',
    siteName: 'Motia',
    title: 'Motia - Code-first framework for intelligent workflows',
    description: 'Write in any language. Automate anything. From AI agents to backend automation, Motia runs event-driven workflows with zero overhead.',
    images: [
      {
        url: '/og-image.png',  // You'll need to create this image
        width: 1200,
        height: 630,
        alt: 'Motia - Code-first framework for intelligent workflows',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@motiadev',  // Replace with your Twitter handle
    creator: '@motiadev',  // Replace with your Twitter handle
    title: 'Motia - Code-first framework for intelligent workflows',
    description: 'Write in any language. Automate anything. From AI agents to backend automation, Motia runs event-driven workflows with zero overhead.',
    images: ['/og-image.png'],  // Same image as OG
  },
  other: {
    'twitter:image:alt': 'Motia - Code-first framework for intelligent workflows',
  }
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col h-full min-h-dvh w-dvw landscape:min-h-screen landscape:h-full landscape:w-full p-0 m-0 gap-0" suppressHydrationWarning>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}