import { useState, useEffect, useCallback, useRef } from 'react';
import { Expand } from '@theme-toggles/react/dist/index.js';
import '@theme-toggles/react/css/Expand.css';

const STORAGE_KEY = 'dsabuddy-theme';

interface ThemeToggleProps {
  revealDuration?: number;
  iconDuration?: number;
}

export default function ThemeToggle({
  revealDuration = 600,
  iconDuration = 750,
}: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const syncTheme = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const domTheme = document.documentElement.getAttribute('data-theme');

    let resolved: 'light' | 'dark' = 'light';

    if (stored === 'light' || stored === 'dark') {
      resolved = stored;
    } else if (domTheme === 'light' || domTheme === 'dark') {
      resolved = domTheme;
    }

    setIsDark(resolved === 'dark');
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem(STORAGE_KEY, resolved);
  }, []);

  useEffect(() => {
    syncTheme();
    setMounted(true);
  }, [syncTheme]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) syncTheme();
    };

    const handleAstroSwap = () => {
      syncTheme();
    };

    window.addEventListener('storage', handleStorage);
    document.addEventListener('astro:after-swap', handleAstroSwap);

    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('astro:after-swap', handleAstroSwap);
    };
  }, [syncTheme]);

  const handleToggle = useCallback(() => {
    const container = buttonRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const newIsDark = !isDark;
    const newTheme = newIsDark ? 'dark' : 'light';

    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1500);

    if (typeof document.startViewTransition !== 'function') {
      setIsDark(newIsDark);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
      document.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: newTheme } }));
      return;
    }

    const transition = document.startViewTransition(() => {
      setIsDark(newIsDark);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
      document.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: newTheme } }));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: revealDuration,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  }, [isDark, revealDuration]);

  if (!mounted) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '1rem',
          background: isDark ? '#252320' : '#efe9de',
          color: isDark ? '#faf9f5' : '#141413',
          padding: '0.4rem 0.85rem',
          borderRadius: '2px',
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10000,
          opacity: showTooltip ? 1 : 0,
          transform: showTooltip ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        aria-hidden="true"
      >
        {isDark ? 'Dark mode' : 'Light mode'}
      </div>

      <div
        ref={buttonRef}
        style={{ position: 'relative' }}
      >
        {/* @ts-ignore — React 19 types incompatibility with @theme-toggles/react */}
        <Expand
          toggled={isDark}
          toggle={handleToggle as any}
          duration={iconDuration}
          aria-label={`Current: ${isDark ? 'Dark mode' : 'Light mode'}. Click to switch theme.`}
          title={isDark ? 'Dark mode' : 'Light mode'}
          style={{
            width: '24px',
            height: '24px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            color: '#cc785c',
            transition: 'transform 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
            fontSize: '40px',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.transform = 'scale(1.15)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      </div>
    </>
  );
}
