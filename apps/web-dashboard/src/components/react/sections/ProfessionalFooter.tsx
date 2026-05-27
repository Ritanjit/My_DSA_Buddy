import { Github, BookOpen, FileText, Shield, Scale } from 'lucide-react';

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Roadmaps', href: '/roadmaps' },
      { label: 'Problems', href: '/problems' },
      { label: 'Extension', href: '/about#extension' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'GitHub', href: 'https://github.com', icon: Github },
      { label: 'Documentation', href: '/about', icon: BookOpen },
      { label: 'Changelog', href: '/about#changelog', icon: FileText },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/about#privacy', icon: Shield },
      { label: 'MIT License', href: '/about#license', icon: Scale },
    ],
  },
];

export default function ProfessionalFooter() {
  return (
    <footer className="bg-surface-dark pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <span className="font-mono text-base font-bold text-white">D</span>
              </div>
              <span
                className="font-body text-sm font-semibold"
                style={{ color: 'var(--color-on-dark)', letterSpacing: '0.04em' }}
              >
                My DSA Buddy
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-[240px]"
              style={{ color: 'var(--color-on-dark-soft)' }}
            >
              Track your DSA journey the right way ! Your data - private & secured :)
            </p>
          </div>

          {/* Link Columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4
                className="font-body text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--color-primary)' }}
              >
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-200 hover:!text-[var(--color-on-dark)]"
                      style={{ color: 'var(--color-on-dark-soft)' }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-on-dark-soft)' }}>
            &copy; {new Date().getFullYear()} My DSA Buddy. All rights reserved.
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--color-on-dark-soft)' }}>
            Built with privacy in mind
          </p>
        </div>
      </div>
    </footer>
  );
}
