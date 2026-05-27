import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'easy' | 'medium' | 'hard' | 'topic' | 'solved';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  easy: 'badge-easy',
  medium: 'badge-medium',
  hard: 'badge-hard',
  topic: 'badge-topic',
  solved: 'badge-solved',
};

export default function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </span>
  );
}
