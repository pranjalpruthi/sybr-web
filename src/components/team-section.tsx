import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

interface Member {
  name: string;
  role: string;
  focus: string;
  image: string;
  href: string;
}

const team: Member[] = [
  {
    name: 'Dr. Jitendra Narayan',
    role: 'Senior Scientist',
    focus: 'Comparative Genomics',
    image: '/landing/team-jitendra.jpg',
    href: 'https://scholar.google.co.uk/citations?user=ySm4BzcAAAAJ&hl=en',
  },
  {
    name: 'Pranjal Pruthi',
    role: 'Project Scientist | Web Developer',
    focus: 'Decoding AMR Dynamics',
    image: '/landing/team-pranjal.jpeg',
    href: 'https://www.linkedin.com/in/pranjal-pruthi/',
  },
  {
    name: 'Ajay Bhatia',
    role: 'Senior Researcher',
    focus: 'HGT Mapping | Enrichment Analysis',
    image: '/landing/team-ajay.jpeg',
    href: 'https://www.researchgate.net/profile/Ajay-Bhatia-5',
  },
];

export function TeamSection() {
  return (
    <section id="team" className="scroll-mt-24 bg-background py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-14 text-center font-heading text-3xl font-bold text-foreground md:text-4xl">
          🏛️ Our Team at{' '}
          <a
            href="http://igib.res.in"
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary hover:underline"
          >
            CSIR IGIB
          </a>
        </h2>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <motion.a
              key={m.name}
              href={m.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="relative mb-5 h-32 w-32 overflow-hidden rounded-full ring-4 ring-primary/10 transition-all group-hover:ring-primary/30">
                <img
                  src={m.image}
                  alt={m.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="flex items-center gap-1.5 text-lg font-semibold text-foreground group-hover:text-primary">
                {m.name}
                <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="mt-1 text-sm font-medium text-primary/90">{m.role}</p>
              <p className="mt-1 text-sm text-muted-foreground">{m.focus}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
