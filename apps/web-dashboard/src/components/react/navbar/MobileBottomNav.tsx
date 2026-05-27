import { useState, useEffect, useCallback } from 'react';
import { X, ChevronUp, MoreHorizontal, Home, LayoutDashboard, Code2, Map, Settings, BookOpen } from 'lucide-react';

interface MobileBottomNavProps {
  initialPath?: string;
}

const primaryNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/problems', label: 'Problems', icon: Code2 },
  { href: '/roadmaps', label: 'Roadmaps', icon: Map },
];

const secondaryNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/about', label: 'Docs', icon: BookOpen },
];

const themeColors = {
  light: {
    background: '#d8d5cf',
    border: '#cc785c',
    text: '#141413',
    textMuted: '#141413',
    active: '#cc785c',
    activeBg: 'rgba(204, 120, 92, 0.2)',
    menuBg: '#d8d5cf',
    menuBorder: '#cc785c',
  },
  dark: {
    background: '#181715',
    border: '#252320',
    text: '#6c6a64',
    textMuted: '#6c6a64',
    active: '#ffffff',
    activeBg: 'rgba(255, 255, 255, 0.1)',
    menuBg: '#181715',
    menuBorder: '#252320',
  },
};

function getThemeFromDOM(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  try {
    const stored = localStorage.getItem('dsabuddy-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'light';
}

export default function MobileBottomNav({ initialPath = '/' }: MobileBottomNavProps) {
  const [activeLink, setActiveLink] = useState(initialPath);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [, setThemeTick] = useState(0);

  const forceThemeRerender = useCallback(() => {
    setThemeTick(t => t + 1);
  }, []);

  useEffect(() => {
    forceThemeRerender();
  }, [forceThemeRerender]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          forceThemeRerender();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const handleThemeChange = () => forceThemeRerender();
    const handleAstroSwap = () => forceThemeRerender();
    document.addEventListener('theme-change', handleThemeChange);
    document.addEventListener('astro:after-swap', handleAstroSwap);

    return () => {
      observer.disconnect();
      document.removeEventListener('theme-change', handleThemeChange);
      document.removeEventListener('astro:after-swap', handleAstroSwap);
    };
  }, [forceThemeRerender]);

  const theme = getThemeFromDOM();
  const c = themeColors[theme];

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] safe-area-pb"
        style={{
          backgroundColor: c.background,
          borderTop: `2px solid ${c.border}`,
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {primaryNavItems.map((item) => {
            const isActive = activeLink === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setActiveLink(item.href)}
                className="flex flex-col items-center justify-center p-2 rounded-xl transition-all"
                style={{
                  color: isActive ? c.active : c.textMuted,
                }}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </a>
            );
          })}

          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="flex flex-col items-center justify-center p-2 rounded-xl transition-all"
            style={{
              color: isMoreMenuOpen ? c.active : c.textMuted,
            }}
          >
            {isMoreMenuOpen ? <X size={20} /> : <MoreHorizontal size={20} />}
            <span className="text-xs mt-1 font-medium">More</span>
          </button>
        </div>
      </nav>

      <div
        className={`lg:hidden fixed bottom-16 left-0 right-0 z-[60] transition-all duration-300 ease-in-out ${
          isMoreMenuOpen ? 'translate-y-0 opacity-100 mb-2' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="mx-4 mb-2 rounded-2xl shadow-xl backdrop-blur-lg"
          style={{
            backgroundColor: c.menuBg,
            border: `1px solid ${c.menuBorder}`,
          }}
        >
          <div className="flex justify-center py-2">
            <ChevronUp
              size={16}
              style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}
            />
          </div>

          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {secondaryNavItems.map((item) => {
                const isActive = activeLink === item.href;
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setActiveLink(item.href);
                      setIsMoreMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-xl transition-all"
                    style={{
                      color: isActive ? c.active : c.textMuted,
                      backgroundColor: isActive ? c.activeBg : 'transparent',
                    }}
                  >
                    <div className="mb-2">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-20"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}
    </>
  );
}
