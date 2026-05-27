export const navRoutes = [
  { label: 'Home', href: '/', icon: 'Home' },
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Roadmaps', href: '/roadmaps', icon: 'Map' },
  { label: 'Problems', href: '/problems', icon: 'Code2' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
  { label: 'About', href: '/about', icon: 'Info' },
] as const;

export const navLinksUppercase = navRoutes.map((r) => ({
  ...r,
  label: r.label.toUpperCase(),
}));

export const mobilePrimaryLinks = [
  { label: 'Home', href: '/', icon: 'Home' },
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Problems', href: '/problems', icon: 'Code2' },
  { label: 'Roadmaps', href: '/roadmaps', icon: 'Map' },
] as const;

export const mobileSecondaryLinks = [
  { label: 'Settings', href: '/settings', icon: 'Settings' },
  { label: 'About', href: '/about', icon: 'Info' },
] as const;

export const footerLinks = {
  Product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Roadmaps', href: '/roadmaps' },
    { label: 'Problems', href: '/problems' },
    { label: 'Extension', href: '/about#extension' },
  ],
  Resources: [
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'Documentation', href: '/about' },
    { label: 'Changelog', href: '/about#changelog' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/about#privacy' },
    { label: 'MIT License', href: '/about#license' },
  ],
} as const;
