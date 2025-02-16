'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CopyDocsButton = () => {
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    // Fetch the docs content from the API endpoint
    fetch('/llms.txt') // Directly fetch llms.txt from the public directory
      .then(response => response.text()) // Use response.text() to get plain text
      .then(data => {
        setContent(data);
      })
      .catch(error => console.error('Failed to fetch docs:', error));
  }, []);

  const handleCopy = async () => {
    if (!content) {
      console.error('No content available to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy docs:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="fixed bottom-6 right-6 flex items-center gap-2 px-3 py-2 text-sm font-medium 
                transition-colors rounded-lg shadow-lg
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-gray-100
                border border-gray-200 dark:border-gray-700
                hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>llms.txt</span>
        </>
      )}
    </button>
  );
};

export default CopyDocsButton;