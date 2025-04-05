import HeroSection from '@/app/(home)/components/HeroSection';
import FeaturesSection from '@/app/(home)/components/FeaturesSection';
import WorkbenchSection from '@/app/(home)/components/WorkbenchSection';
import GetStartedSection from '@/app/(home)/components/GetStartedSection';
import SignupSection from '@/app/(home)/components/SignupSection';
import CardSection from '@/app/(home)/components/CardSection';

export default function HomePage() {

  return (
    <div className="bg-gradient-to-b from-[#0E002D] to-[#2F0093]">
      <HeroSection/>
      <FeaturesSection/>
      <WorkbenchSection/>
      <SignupSection/>
      <CardSection/>
      <GetStartedSection/>
    </div>
  );
}