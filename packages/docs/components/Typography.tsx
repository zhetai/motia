import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TypographyVariant = 'title' | 'description';

interface TypographyProps {
  variant: TypographyVariant;
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}

export default function Typography({
  variant,
  children,
  className,
  as: Component = 'div',
}: TypographyProps) {
  const styles = {
    title: 'text-[#E9DFFF] text-center font-dm-sans text-[54px] tracking-[-0.135rem] leading-[100%] font-medium leading-tight',
    description: 'text-[#CDBCF0] text-center font-dm-mono text-[1.25rem] tracking-[-0.025rem] leading-[120%] font-normal',
  };

  return (
    <Component className={cn(styles[variant], className)}>
      {children}
    </Component>
  );
} 