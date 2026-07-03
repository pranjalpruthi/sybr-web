import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';

const steps = [
  {
    num: "01",
    title: "Synteny Processing",
    desc: "Discover conserved genomic blocks across multiple species.",
  },
  {
    num: "02",
    title: "EBA Analysis",
    desc: "Identify evolutionary breakpoints with statistical confidence.",
  },
  {
    num: "03",
    title: "Enrichment Analysis",
    desc: "Perform KEGG pathway enrichment on regions of interest.",
  },
  {
    num: "04",
    title: "ChainNet Generation",
    desc: "Prepare hierarchical alignments for reconstruction.",
  },
  {
    num: "05",
    title: "Ancestral Reconstruction",
    desc: "Reconstruct the contiguous ancestral genome blocks.",
  },
];

export function PipelineFlow() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
            Modular Pipeline Workflow
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose to run the entire pipeline end-to-end or execute individual modules based on your research needs.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical connecting line */}
          <div className="absolute left-[28px] md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-primary/50 via-cyan-500/50 to-primary/50 md:-translate-x-1/2 rounded-full hidden sm:block" />

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-12 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Text Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} pt-2 sm:pt-0 pl-16 sm:pl-0`}>
                  <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>

                {/* Node */}
                <div className="absolute sm:relative left-0 sm:left-auto flex items-center justify-center w-14 h-14 rounded-full bg-card border-4 border-background shadow-[0_0_0_2px_rgba(var(--primary),0.5)] z-10 mx-auto group">
                  <span className="text-primary font-bold">{step.num}</span>
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Empty Spacer for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex justify-center text-primary animate-bounce pt-8 sm:hidden">
             <ArrowDown className="w-8 h-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
