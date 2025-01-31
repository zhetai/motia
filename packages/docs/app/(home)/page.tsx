'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("npx motia create -t default -n new-project");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-4 bg-transparent flex-1">
      <div className="text-center max-w-5xl">
        <h1 className="text-[56px] sm:text-[72px] md:text-[86px] font-[950] leading-[1.0]">
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Code-First
          </span> <span>Framework</span>
        </h1>
        <h2 className="text-[42px] sm:text-[56px] md:text-[64px] font-[800] dark:text-gray-300 text-gray-700 mb-6 mt-2 leading-[1.1]">
          for <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Intelligent<br className="sm:hidden" /> <span>Workflows</span>
          </span>
        </h2>

        {/* Rest of the component stays the same */}
        <p className="text-lg sm:text-xl dark:text-gray-400 text-gray-600 max-w-3xl mx-auto tracking-[-0.02em] font-light mb-8">
          <strong className="dark:text-white text-gray-900 text-xl sm:text-2xl">Write in any language. Automate anything. </strong>
          From AI agents to backend automation, Motia runs event-driven workflows with zero overhead.
        </p>

        <div className="flex justify-center gap-4 mb-8">
          <Link
            href="/docs/quick-start"
            className="px-6 py-3 text-sm font-medium bg-white text-black rounded-lg shadow-md hover:shadow-lg 
                     hover:bg-gray-100 transition-all transform hover:scale-105 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            Get Started →
          </Link>

          <Link
            href="/docs"
            className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg 
                     backdrop-blur-lg bg-opacity-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all transform hover:scale-105"
          >
            Read the Docs
          </Link>
        </div>

        <div
          className="relative inline-flex items-center dark:bg-[#0a0a0a] bg-gray-100 px-4 py-1.5 dark:text-gray-300 text-gray-700 
                   font-mono text-sm border dark:border-gray-700 border-gray-200 rounded-md group cursor-pointer select-none"
          onClick={handleCopy}
        >
          <span className="dark:text-gray-500 text-gray-400">~</span>
          <span className="ml-2">npx motia create -t default -n new-project</span>

          <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity dark:text-gray-500 text-gray-400 hover:text-gray-900 dark:hover:text-white">
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}