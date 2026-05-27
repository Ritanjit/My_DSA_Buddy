import { motion } from 'motion/react';
import { BarChart3, Map, GitBranch } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Track Progress',
    description: 'Monitor your LeetCode progress with streaks, heatmaps, and category breakdowns.',
  },
  {
    icon: Map,
    title: 'Company Roadmaps',
    description: 'Follow curated problem lists from Google, Amazon, Meta, and more.',
  },
  {
    icon: GitBranch,
    title: 'GitHub Sync',
    description: 'Automatically push solutions to your GitHub repo on every accepted submission.',
  },
];

export default function FeatureShowcase() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-ink text-center mb-16"
        >
          Everything you need
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="card-cream flex flex-col items-start"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(204, 120, 92, 0.15)' }}
                >
                  <Icon size={20} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="font-display text-ink text-xl mb-2">{feature.title}</h3>
                <p className="text-body text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
