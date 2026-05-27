import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'text' | 'search';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, variant = 'text', className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{ color: 'var(--color-body-strong)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {variant === 'search' && (
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-muted)' }}
            />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3 rounded-[var(--radius-md)] text-sm font-body transition-all outline-none',
              'bg-[var(--color-surface-soft)] border border-[var(--color-hairline)]',
              'text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)]',
              'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20',
              error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20',
              variant === 'search' && 'pl-9',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
