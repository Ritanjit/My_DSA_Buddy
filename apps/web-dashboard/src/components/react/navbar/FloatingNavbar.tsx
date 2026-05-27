import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import ThemeToggle from '../theme-toggle/ThemeToggle';
import MobileBottomNav from './MobileBottomNav';

const PILL_GAP = 5;
const PILL_BORDER = 3;
const PILL_EXTRA = 2 * (PILL_GAP + PILL_BORDER);

interface Props {
  initialPath?: string;
}

const navLinks = [
  { label: 'HOME', href: '/' },
  { label: 'DASHBOARD', href: '/dashboard' },
  { label: 'ROADMAPS', href: '/roadmaps' },
  { label: 'PROBLEMS', href: '/problems' },
  { label: 'SETTINGS', href: '/settings' },
  { label: 'DOCS', href: '/about' },
];

function getResponsiveSizes(width: number) {
  const t = Math.max(0, Math.min(1, (width - 1024) / (1920 - 1024)));
  const lerp = (min: number, max: number) => min + t * (max - min);

  return {
    logoSize: lerp(28, 40),
    logoGap: lerp(6, 12),
    logoFontSize: lerp(10, 13),
    logoMaxWidth: lerp(90, 140),
    navFontSize: lerp(0.72, 1),
    navActiveFontSize: lerp(0.78, 1.05),
    navPaddingX: lerp(4, 12),
    navPaddingY: lerp(4, 8),
    navGap: lerp(2, 16),
  };
}

export default function FloatingNavbar({ initialPath = '/' }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [activeLink, setActiveLink] = useState(initialPath);
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [navWidth, setNavWidth] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const measure = () => setNavWidth(nav.offsetWidth);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 1024) {
        setIsScrolled(window.scrollY > 20);
      } else {
        setIsScrolled(false);
      }
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const desktop = w >= 1024;
      setIsDesktop(desktop);
      setViewportWidth(w);
      if (!desktop) {
        setIsScrolled(false);
      } else {
        setIsScrolled(window.scrollY > 20);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const sizes = useMemo(() => getResponsiveSizes(viewportWidth), [viewportWidth]);

  const pillWidthScrolled = navWidth > 0 ? navWidth + PILL_EXTRA : viewportWidth;
  const pillWidthFull = viewportWidth;

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center py-3 pointer-events-none">
        <motion.div
          initial={false}
          animate={{
            x: '-50%',
            width: isScrolled ? pillWidthScrolled : pillWidthFull,
            y: isScrolled ? 32 : 0,
            borderRadius: isScrolled ? '9999px' : '0px',
            borderTopWidth: isScrolled ? '3px' : '0px',
            borderLeftWidth: isScrolled ? '3px' : '0px',
            borderRightWidth: isScrolled ? '3px' : '0px',
            borderBottomWidth: isScrolled ? '3px' : '1px',
            backgroundColor: (!isDesktop || isScrolled) ? 'rgba(24, 23, 21, 0.95)' : 'rgba(24, 23, 21, 0.8)',
            borderColor: isScrolled ? 'rgba(24, 23, 21, 0.3)' : 'rgba(24, 23, 21, 0.2)',
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
            borderRadius: {
              duration: isScrolled ? 0.6 : 0.15,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          className="absolute top-0 left-1/2 h-full backdrop-blur-3xl border-solid pointer-events-auto"
        />

        <motion.nav
          ref={navRef}
          initial={false}
          animate={{ y: isScrolled ? 32 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-[90vw] sm:w-[92%] max-w-7xl flex justify-between items-center px-4 sm:px-3 sm:pr-6 pointer-events-auto"
        >
          {/* Logo */}
          <a
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity z-[60]"
            style={{ gap: `${sizes.logoGap}px` }}
          >
            <div
              className="rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                height: `${sizes.logoSize}px`,
                width: `${sizes.logoSize}px`,
                backgroundColor: '#cc785c',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: `${sizes.logoSize * 0.5}px`,
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                D
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: `${sizes.logoFontSize}px`,
                fontWeight: 600,
                color: '#faf9f5',
                letterSpacing: '0.04em',
                lineHeight: 1.3,
                maxWidth: `${sizes.logoMaxWidth}px`,
              }}
            >
              My DSA Buddy
            </span>
          </a>

          {/* Nav Links */}
          <ul
            className="hidden lg:flex items-center"
            style={{ gap: `${sizes.navGap}px` }}
          >
            {navLinks.map((link) => {
              const isActive = activeLink === link.href;
              return (
                <li
                  key={link.href}
                  className={`relative group font-semibold font-sans transition-all whitespace-nowrap
                  ${isActive ? 'text-[var(--color-primary)]' : 'text-[#faf9f5] hover:text-[var(--color-primary)]'}`}
                  style={{
                    fontSize: isActive ? `${sizes.navActiveFontSize}rem` : `${sizes.navFontSize}rem`,
                  }}
                >
                  <a
                    href={link.href}
                    onClick={() => setActiveLink(link.href)}
                    className="no-underline"
                    style={{
                      padding: `${sizes.navPaddingY}px ${sizes.navPaddingX}px`,
                      display: 'inline-block',
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                  </a>
                  <span className={`absolute left-1/2 transform -translate-x-1/2 bottom-[-6px]
                  flex items-center gap-1 transition-opacity duration-300
                  ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <span className="w-1.5 h-1.5 bg-[#cc785c] rounded-full"></span>
                    <span className="w-6 h-1 bg-[#cc785c] rounded"></span>
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </motion.nav>
      </div>

      <MobileBottomNav initialPath={activeLink} />
    </>
  );
}
