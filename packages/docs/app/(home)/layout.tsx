import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout {...baseOptions} className='h-full py-32 dark:bg-gradient-to-t dark:from-zinc-900 dark:to-zinc-1000 bg-gradient-to-b from-gray-200 to-gray-300'>{children}</HomeLayout>;
}
