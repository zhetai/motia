import Image from 'next/image';
import FeatureItem from '@/app/(home)/components/FeatureItem';
import Typography from '@/components/Typography';
import {
  TextFlowIcon,
  AscendingSortIcon,
  CrossOverIcon,
  CheckIcon,
  SynchronizeRefreshIcon,
  PinLocationIcon
} from '@/components/icons';
import flow from './images/flow.png'
export default function WorkbenchSection() {
  const workbenchFeatures = [
    {
      icon: <TextFlowIcon className="text-purple-300" />,
      title: "Visual Flow Explorer",
      description: "View your code-defined workflows in an interactive UI"
    },
    {
      icon: <AscendingSortIcon className="text-purple-300" />,
      title: "Live Logging",
      description: "See inputs, outputs, and errors in real time"
    },
    {
      icon: <CrossOverIcon className="text-purple-300" />,
      title: "Custom UI Overrides",
      description: "Add interactive elements for demos or live data tweaks"
    },
    {
      icon: <CheckIcon className="text-purple-300" />,
      title: "Manual Triggers",
      description: "Quickly test individual steps or entire flows"
    },
    {
      icon: <SynchronizeRefreshIcon className="text-purple-300" />,
      title: "Hot Reload",
      description: "Changes reflect instantly. Change it. See it. Run it."
    },
    {
      icon: <PinLocationIcon className="text-purple-300" />,
      title: "Local First",
      description: "Develop on your own machine without sign in"
    }
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex px-[1.30494rem] py-[1.00381rem] justify-center items-center gap-[1.00381rem] rounded-[0.50188rem] border-[1.606px] border-dashed border-[rgba(233,223,255,0.30)] text-purple-300 text-sm font-mono mb-4">
            <span className="text-[#E9DFFF] text-center font-dm-mono text-[1.10419rem] font-normal leading-[120%] tracking-[-0.02206rem]">motia-workbench</span>
          </div>
          <Typography 
            variant="title" 
            as="h2" 
            className="mb-6"
          >
            Design Workflows Effortlessly
          </Typography>
          <Typography 
            variant="description" 
            as="p" 
            className="mx-auto max-w-2xl"
          >
            A modern workbench that makes it easy to create,
            test, and refine automation workflows. Visually
            build logic, integrate with your tools, and see
            real-time execution—all in one place.
          </Typography>
        </div>

        <div className="relative rounded-xl overflow-hidden mb-16 flex justify-center">
          <Image 
            src={flow} 
            placeholder="blur"
            alt="Motia Workbench Interface" 
            quality={90}
            priority
            className="w-full rounded-xl shadow-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 75vw"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {workbenchFeatures.map((feature, index) => (
            <FeatureItem 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 