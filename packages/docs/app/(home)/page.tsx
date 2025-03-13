'use client';

import HeroSection from '@/app/(home)/components/HeroSection';
import FeaturesSection from '@/app/(home)/components/FeaturesSection';
import WorkbenchSection from '@/app/(home)/components/WorkbenchSection';
import GetStartedSection from '@/app/(home)/components/GetStartedSection';
import SignupSection from '@/app/(home)/components/SignupSection';
import CodeExampleSection from '@/app/(home)/components/CodeExampleSection';
import CardSection from '@/app/(home)/components/CardSection';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

export default function HomePage() {
  const { copied, copyToClipboard } = useCopyToClipboard("npx motia create -t default -n new-project");

  return (
    <div className="bg-gradient-to-b from-[#0E002D] to-[#2F0093]">
      <HeroSection copied={copied} onCopy={copyToClipboard} />
      <FeaturesSection />
      <WorkbenchSection />
      <CodeExampleSection />
      <SignupSection />
      <CardSection />
      <GetStartedSection copied={copied} onCopy={copyToClipboard} />
    </div>
  );
}