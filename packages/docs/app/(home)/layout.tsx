import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeLayout 
        {...baseOptions} 
        className='flex-1 py-32 dark:bg-gradient-to-t dark:from-zinc-900 dark:to-zinc-1000 bg-gradient-to-b from-gray-100 to-gray-200'
      >
        {children}
      </HomeLayout>
      <footer className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} All rights reserved.
      </footer>
    </div>
  );
}
