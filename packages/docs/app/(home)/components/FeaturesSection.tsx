'use client';

import CodeEditor from '@/app/(home)/components/CodeEditor';
import FeatureCard from '@/app/(home)/components/FeatureCard';
import Typography from '@/components/Typography';

export default function FeaturesSection() {
  const powerfulFlowsFeatures = [
    {
      title: "Composable Building Blocks",
      description: "Create complex workflows with simple reusable steps."
    },
    {
      title: "Shared Steps",
      description: "Reuse logic across multiple flows to stay DRY."
    },
    {
      title: "Built-in Triggers",
      description: "Kick off flows with webhooks, HTTP requests, or cron."
    }
  ];

  const codeFirstFeatures = [
    {
      title: "Minimal Boilerplate",
      description: "No DSL, just code."
    },
    {
      title: "Seamless Imports",
      description: "Use any dependency with zero friction."
    },
    {
      title: "Straightforward Handlers",
      description: "Steps are normal functions."
    }
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <Typography
          variant="title"
          as="h2"
          className="mb-6"
        >
          Powerful Flows, Simple Steps
        </Typography>
        <Typography
          variant="description"
          as="p"
          className="mx-auto max-w-2xl mb-16"
        >
          Effortlessly build AI-driven workflows. With a
          lightweight, developer-friendly framework, you
          can create intelligent automations using the
          dependencies you know and love.
        </Typography>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          <main className="flex flex-col items-start rounded-lg lg:col-span-7">
            <CodeEditor />
          </main>

          <div className="grid grid-cols-1 gap-8 lg:col-span-5">
            <FeatureCard
              title="Seamless Flow Orchestration"
              features={powerfulFlowsFeatures}
            />
            <FeatureCard
              title="Code-first"
              features={codeFirstFeatures}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 