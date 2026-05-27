import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  maxDropdownWidth?: number;
}

export default function CustomSelect({ value, onChange, options, placeholder, className = '', maxDropdownWidth }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const positionDropdown = useCallback(() => {
    if (!triggerRef.current || !dropRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const drop = dropRef.current;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const maxDrop = 240;

    const openBelow = spaceBelow >= Math.min(maxDrop, 120) || spaceBelow >= spaceAbove;
    const maxH = Math.min(maxDrop, openBelow ? spaceBelow - 8 : spaceAbove - 8);

    drop.style.position = 'fixed';
    drop.style.left = `${rect.left}px`;
    drop.style.minWidth = `${rect.width}px`;
    drop.style.maxHeight = `${maxH}px`;
    drop.style.maxWidth = maxDropdownWidth ? `${maxDropdownWidth}px` : '';
    drop.style.zIndex = '9999';

    if (openBelow) {
      drop.style.top = `${rect.bottom + 4}px`;
      drop.style.bottom = '';
    } else {
      drop.style.top = '';
      drop.style.bottom = `${window.innerHeight - rect.top + 4}px`;
    }
  }, [maxDropdownWidth]);

  const dropCallbackRef = useCallback((node: HTMLDivElement | null) => {
    (dropRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (node) {
      positionDropdown();
      node.addEventListener('wheel', (e) => {
        const el = node;
        const hasScroll = el.scrollHeight > el.clientHeight;
        if (!hasScroll) {
          e.preventDefault();
          return;
        }
        const atTop = el.scrollTop === 0 && e.deltaY < 0;
        const atBottom = Math.abs(el.scrollTop + el.clientHeight - el.scrollHeight) < 1 && e.deltaY > 0;
        if (atTop || atBottom) {
          e.preventDefault();
        }
        e.stopPropagation();
      }, { passive: false });
    }
  }, [positionDropdown]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || dropRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function handleScroll() {
      positionDropdown();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [open, positionDropdown]);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label || placeholder || 'Select...';

  return (
    <div ref={triggerRef} className={`relative min-w-[140px] ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-9 px-3 pr-8 rounded-[var(--radius-md)] text-sm bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] outline-none text-left w-full truncate transition-colors hover:border-[var(--color-primary)] focus:border-[var(--color-primary)]"
      >
        <span className={!selected ? 'text-[var(--color-muted-soft)]' : ''}>
          {displayLabel}
        </span>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-muted)' }}
        />
      </button>

      {open && createPortal(
        <div
          ref={dropCallbackRef}
          className="overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-card)] shadow-lg"
          style={{ overscrollBehavior: 'contain' }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors whitespace-nowrap ${
                option.value === value
                  ? 'bg-[var(--color-surface-soft)] text-[var(--color-primary)] font-medium'
                  : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
