import { motion } from 'motion/react';
import { ArrowRight, Chrome } from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Decorative gradient orb */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-ink leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
        >
          Track Your DSA Journey
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-body text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
        >
          Monitor your LeetCode progress, follow company roadmaps and sync solutions to GitHub - all locally, all private, all yours :)
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="/dashboard"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 h-auto text-base"
          >
            Go to Dashboard
            <ArrowRight size={16} />
          </a>
          <a
            href="/about#extension"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-3 h-auto text-base"
          >
            <Chrome size={16} />
            Get Extension
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 text-muted text-sm font-mono"
        >
          100% offline &middot; zero telemetry &middot; open source
        </motion.p>
      </div>
    </section>
  );
}
