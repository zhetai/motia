'use client';

import { useGitHubCode } from '../hooks/useGitHubCode';
import { CodeDisplay, LoadingSkeleton, ErrorDisplay } from './ui/CodeDisplay';
import { Tab } from 'fumadocs-ui/components/tabs';

interface GitHubCodeFetcherProps {
  repo: string;
  path: string;
  branch?: string;
  language?: string;
}

export const GitHubCodeFetcher = ({ repo, path, branch = 'main', language }: GitHubCodeFetcherProps) => {
  const { code, loading, error } = useGitHubCode({
    repo,
    path,
    branch
  });

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // Determine language from file extension if not provided
  const fileExtension = language || path.split('.').pop() || 'typescript';

  return (
    <CodeDisplay 
      code={code} 
      language={fileExtension}
    />
  );
};

interface GitHubTabProps {
  repo: string;
  path: string;
  branch?: string;
  tab: string;
  language?: string;
}

export const GitHubTab = ({ repo, path, branch = 'main', tab, language }: GitHubTabProps) => {
  const { code, loading, error } = useGitHubCode({
    repo,
    path,
    branch
  });

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Tab value={tab} className="p-0">
        <ErrorDisplay message={error} />
      </Tab>
    );
  }

  // Determine language from file extension if not provided
  const fileExtension = language || path.split('.').pop() || 'typescript';

  return (
    <Tab value={tab} className="p-0">
      <CodeDisplay 
        code={code} 
        language={fileExtension}
      />
    </Tab>
  );
}; 