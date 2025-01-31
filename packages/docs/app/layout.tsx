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
    default: 'Motia - Code-first framework for inteligent workflows',
  },
  description: 'Code-first framework for inteligent workflows',
  openGraph: {
    title: 'Motia',
    description: 'Code-first framework for inteligent workflows',
    url: 'https://motia.dev',
    siteName: 'Motia',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motia',
    description: 'Code-first framework for inteligent workflows',
  },
};

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