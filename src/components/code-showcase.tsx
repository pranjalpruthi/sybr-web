import { motion } from 'motion/react';
import { useState } from 'react';

const codes = {
  config: `# run_sybr_config.yaml
base_input_dir:  "/path/to/inputs"
base_output_dir: "/path/to/outputs"

run_stages:
  synteny_processing: true
  eba_analysis: true
  enrichment_analysis: true
  chainNet_generation: true
  Ancestor_seq_recunstruction: true

reference_name: "Adineta_vaga"
reference_species: "vaga"

eba:
  n: 5
  r: "Adineta_vaga"
  p: 300

getenrich:
  r: "ko"
`,
  cli: `# Clean run with specific window sizes and step size
./sybr.sh \\
  -c run_sybr_config.yaml \\
  -w 200000,400000,500000 \\
  -p 50000 \\
  -j 16 \\
  -C

# Default run
./sybr.sh -j 8
`
};

export function CodeShowcase() {
  const [activeTab, setActiveTab] = useState<'config' | 'cli'>('config');

  return (
    <section className="py-24 bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
              Simple Configuration. <br />
              Powerful Execution.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Control the entire Sybr workflow through a single, elegant YAML configuration file. Execute locally or on your HPC cluster with our optimized Snakemake wrapper.
            </p>
            <ul className="space-y-3 pt-4">
               {[
                 'Zero code required for basic usage',
                 'Granular control over specific modules',
                 'Scalable from laptops to compute clusters',
                 'Reproducible pipeline runs'
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-foreground">
                   <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                     <div className="w-2 h-2 rounded-full bg-primary" />
                   </div>
                   {item}
                 </li>
               ))}
            </ul>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full max-w-xl"
          >
            <div className="rounded-xl overflow-hidden bg-[#0d1117] border border-border shadow-2xl">
              <div className="flex bg-[#161b22] border-b border-[#30363d] px-2 py-2 gap-2">
                <button
                  onClick={() => setActiveTab('config')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'config' ? 'bg-[#21262d] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
                  }`}
                >
                  run_sybr_config.yaml
                </button>
                <button
                  onClick={() => setActiveTab('cli')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'cli' ? 'bg-[#21262d] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
                  }`}
                >
                  CLI Usage
                </button>
              </div>
              <div className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                <pre className="!bg-transparent !m-0 !p-0">
                  <code>{codes[activeTab]}</code>
                </pre>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
