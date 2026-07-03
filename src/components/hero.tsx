import { Link } from '@tanstack/react-router';
import { motion } from 'motion/react';
import ShinyButton from '@/components/animate-ui/components/buttons/shiny-button'; // Or similar button, I will just use standard ones if not available

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6 border border-border"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary"></span>
          Sybr Toolkit v1.0 Available
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold font-heading text-foreground mb-6 leading-tight tracking-tight"
        >
          Synteny Discovery. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">
            Ancestral Reconstruction.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto"
        >
          A powerful bioinformatics tool meticulously designed for the discovery of synteny blocks, the precise identification of evolutionary breakpoints, and robust ancestral genome reconstruction.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/analysis"
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]"
          >
            Start Analysis
          </Link>
          <Link
            to="/docs/$"
            params={{ _splat: '' }}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 transition-all border border-border"
          >
            Read Documentation
          </Link>
        </motion.div>

        {/* Terminal Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 mx-auto max-w-3xl rounded-xl bg-[#0d1117] border border-border shadow-2xl overflow-hidden text-left"
        >
          <div className="flex items-center px-4 py-3 bg-[#161b22] border-b border-border">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="ml-4 text-xs text-gray-400 font-mono">bash</div>
          </div>
          <div className="p-4 font-mono text-sm leading-relaxed overflow-x-auto text-gray-300">
            <div className="flex">
              <span className="text-primary mr-2">$</span>
              <span className="text-white">./sybr.sh -c run_sybr_config.yaml -j 8</span>
            </div>
            <div className="text-gray-500 mt-2">Starting Sybr Pipeline...</div>
            <div className="text-gray-400">[1/5] Synteny Processing  ✓</div>
            <div className="text-gray-400">[2/5] EBA Analysis        ✓</div>
            <div className="text-gray-400">[3/5] Enrichment Analysis ✓</div>
            <div className="text-cyan-400 mt-2">Pipeline execution complete in 42s.</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
