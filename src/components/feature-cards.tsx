import { motion } from 'motion/react';
import { Database, Scissors, Network, BarChart3, Settings2 } from 'lucide-react';

const features = [
  {
    icon: Database,
    title: 'Synteny Block Discovery',
    description: 'Efficient algorithms to identify conserved genomic regions across multiple species with high precision.',
  },
  {
    icon: Scissors,
    title: 'Evolutionary Breakpoints',
    description: 'Pinpoint the precise locations of genomic rearrangements using the advanced EBA module.',
  },
  {
    icon: Network,
    title: 'Ancestral Genome Reconstruction',
    description: 'Infer the genomic organization of common ancestors seamlessly using DESCHRAMBLER.',
  },
  {
    icon: BarChart3,
    title: 'Enrichment Analysis',
    description: 'Perform functional KEGG enrichment on identified regions effortlessly using getENRICH.',
  },
  {
    icon: Settings2,
    title: 'Modular Workflow',
    description: 'Highly flexible configuration allowing you to run specific stages of the analysis.',
  },
];

export function FeatureCards() {
  return (
    <section className="py-24 bg-card relative z-10 border-y border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
            Powerful Bioinformatics Features
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need for comprehensive comparative genomics in one unified toolkit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-background rounded-xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
