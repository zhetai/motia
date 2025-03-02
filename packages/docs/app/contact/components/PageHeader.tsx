interface PageHeaderProps {
  title: string;
  description: string;
}

export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{title}</h1>
      <p className="text-lg text-gray-300 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
} 