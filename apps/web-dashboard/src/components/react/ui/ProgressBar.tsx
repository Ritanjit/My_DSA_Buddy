import { cn } from '@/lib/utils';

type Variant = 'primary' | 'easy' | 'medium' | 'hard';

interface ProgressBarProps {
  value: number;
  variant?: Variant;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const variantColors: Record<Variant, string> = {
  primary: 'var(--color-primary)',
  easy: 'var(--color-difficulty-easy)',
  medium: 'var(--color-difficulty-medium)',
  hard: 'var(--color-difficulty-hard)',
};

export default function ProgressBar({ value, variant = 'primary', size = 'md', showLabel, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1 rounded-full overflow-hidden', height, 'bg-[var(--color-surface-soft)]')}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out')}
          style={{ width: `${clamped}%`, backgroundColor: variantColors[variant] }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-[var(--color-muted)] min-w-[3ch] text-right">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
