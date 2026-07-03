import { motion } from 'motion/react';

const stats = [
  { value: '100+', label: 'successful Jobs' },
  { value: '100%', label: 'FOSS · Deployed @ CSIR-IGIB' },
  { value: 'v0.0.1', label: 'alpha' },
];

export function StatsSection() {
  return (
    <section className="border-t border-border bg-secondary/40 py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-heading text-5xl font-bold text-primary">{s.value}</p>
              <p className="mt-2 text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="container mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
        <p>
          Crafted with ❤️ 🧑🏻‍💻 at{' '}
          <a
            href="https://jitendralab.igib.res.in/"
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary hover:underline"
          >
            JitendraLab
          </a>
          , CSIR-IGIB 🧬 · 💌 Raise a query at{' '}
          <a href="mailto:jnarayan@igib.res.in" className="text-primary hover:underline">
            jnarayan@igib.res.in
          </a>
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">© Copyright {new Date().getFullYear()} SyBR</p>
      </div>
    </footer>
  );
}
