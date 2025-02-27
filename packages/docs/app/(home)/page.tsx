'use client';

import { useState } from 'react';
import HeroSection from '@/app/(home)/components/HeroSection';
import FeaturesSection from '@/app/(home)/components/FeaturesSection';
import WorkbenchSection from '@/app/(home)/components/WorkbenchSection';
import CodeExampleSection from '@/app/(home)/components/CodeExampleSection';
import GetStartedSection from '@/app/(home)/components/GetStartedSection';

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
    <div className="bg-gradient-to-b from-[#0E002D] to-[#2F0093]">
      <HeroSection copied={copied} onCopy={handleCopy} />
      <FeaturesSection />
      <WorkbenchSection />
      <CodeExampleSection />
      <GetStartedSection />
    </div>
  );
}