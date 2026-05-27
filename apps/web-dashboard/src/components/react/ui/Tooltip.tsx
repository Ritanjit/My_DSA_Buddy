import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
}

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export default function Tooltip({ content, side = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <div
        className={cn(
          'absolute z-50 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-body whitespace-nowrap pointer-events-none',
          'bg-[var(--color-surface-dark)] text-[var(--color-on-dark)]',
          'transition-opacity duration-150',
          positionClasses[side],
          visible ? 'opacity-100' : 'opacity-0',
        )}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
}
