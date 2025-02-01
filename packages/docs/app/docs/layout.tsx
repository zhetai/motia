import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import DocsLayoutWrapper from '../../components/DocsLayoutWrapper';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayoutWrapper
      tree={source.pageTree}
      baseOptions={baseOptions}
    >
      {children}
    </DocsLayoutWrapper>
  );
}