import Typography from "@/components/Typography";

interface Feature {
  title: string;
  description: string;
}

interface FeatureCardProps {
  title: string;
  features: Feature[];
}

export default function FeatureCard({ title, features }: FeatureCardProps) {
  return (
    <div className="bg-indigo-950 rounded-lg p-6 text-left shadow-xl">
      <Typography 
        variant="title" 
        as="h3" 
        className="text-3xl text-white mb-4 text-left"
      >
        {title}
      </Typography>

      {features.map((feature, index) => (
        <div key={index}>
          <div className="mb-4">
            <Typography 
              variant="title" 
              as="h4" 
              className="text-lg text-white mb-1 text-left tracking-normal"
            >
              {feature.title}
            </Typography>
            <Typography 
              variant="description" 
              as="p" 
              className="text-purple-200 text-sm text-left"
            >
              {feature.description}
            </Typography>
          </div>
          
          {index < features.length - 1 && (
            <div className="border-b border-dotted border-purple-600 mb-4"></div>
          )}
        </div>
      ))}
    </div>
  );
} 