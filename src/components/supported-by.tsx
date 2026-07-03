import { motion } from 'motion/react';

const supporters = [
  { name: 'CSIR IGIB', logo: '/landing/logo-igib.png', href: 'https://www.igib.res.in' },
  { name: 'AcSIR', logo: '/landing/logo-acsir.png', href: 'https://acsir.res.in' },
  { name: 'The RF Foundation', logo: '/landing/logo-rf.webp', href: 'https://www.rockefellerfoundation.org' },
];

export function SupportedBy() {
  return (
    <section className="border-y border-border bg-card py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <h3 className="mb-12 text-center font-heading text-2xl font-bold text-foreground md:text-3xl">
          Supported by
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
          {supporters.map((s, i) => (
            <motion.a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group flex flex-col items-center gap-3"
            >
              <img
                src={s.logo}
                alt={s.name}
                loading="lazy"
                className="h-20 w-auto object-contain opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                {s.name}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
