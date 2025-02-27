'use client';

import React from 'react';
import CodeSandbox from '@/app/(home)/components/CodeSandbox';
import Typography from '@/components/Typography';

export default function CodeExampleSection() {
  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 flex flex-col items-center">
          <Typography 
            variant="title" 
            as="h2" 
            className="mb-6 w-[35rem]"
          >
            Seamless AI Automation for Your Stack
          </Typography>
          <Typography 
            variant="description" 
            as="p" 
            className="mx-auto max-w-2xl"
          >
            Build automation workflows with TypeScript or JavaScript. 
            Define your workflow configuration and handlers with a clean, 
            intuitive API that feels natural to developers.
          </Typography>
        </div>

        <div className="p-4 mb-8">
          <CodeSandbox 
            height="800px"
            repoPath="trello-flow"
          />
        </div>
      </div>
    </div>
  );
} 