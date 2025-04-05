'use client'
import React, { useEffect, useState } from 'react';

const GitHubStarButton = ({ className = '' }) => {
  const [starCount, setStarCount] = useState(null);

  useEffect(() => {
    // Fetch star count from GitHub API
    fetch('https://api.github.com/repos/MotiaDev/motia')
      .then(response => response.json())
      .then(data => {
        setStarCount(data.stargazers_count);
      })
      .catch(error => {
        console.error('Error fetching GitHub stars:', error);
      });
  }, []);

  return (
    <a
      href="https://github.com/MotiaDev/motia"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center px-3 py-0.5 gap-1.5 rounded-md border transition-colors
        bg-white hover:bg-gray-50 text-gray-800 border-gray-600
        dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-700 
        ${className}`
      }
      style={{ height: '28px' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
      </svg>
      <span className="font-medium text-xs">Star</span>
      {
        starCount !== null && (
          <span className="ml-1 text-xs border-l border-gray-300 dark:border-gray-600 pl-1.5">{starCount}</span>
        )
      }
    </a >
  );
};

export default GitHubStarButton;
