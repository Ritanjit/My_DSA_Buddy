import { motion } from 'motion/react';

const steps = [
  {
    number: '01',
    title: 'Install Extension',
    description: 'Add the Chrome extension to your browser.',
  },
  {
    number: '02',
    title: 'Solve Problems',
    description: 'Practice on LeetCode as usual.',
  },
  {
    number: '03',
    title: 'Auto-Detect',
    description: 'Extension detects accepted submissions.',
  },
  {
    number: '04',
    title: 'Dashboard Updates',
    description: 'Progress syncs to your local dashboard.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-surface-dark py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-on-dark text-center mb-16"
        >
          How it works
        </motion.h2>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          {/* Connecting line (desktop only) */}
          <div
            className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px"
            style={{ backgroundColor: 'rgba(204, 120, 92, 0.3)' }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center text-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 relative z-10"
                style={{
                  backgroundColor: 'var(--color-surface-dark-elevated)',
                  border: '2px solid var(--color-primary)',
                }}
              >
                <span
                  className="font-mono text-sm font-medium"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {step.number}
                </span>
              </div>
              <h3
                className="font-display text-lg mb-2"
                style={{ color: 'var(--color-on-dark)' }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm leading-relaxed max-w-[200px]"
                style={{ color: 'var(--color-on-dark-soft)' }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
