import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Database, FileText, X, ZoomIn } from 'lucide-react';
import { GithubIcon } from '@/components/brand-icons';

const REPO_URL = 'https://github.com/BioinformaticsOnLine/Sybr';
const DOC_URL = '/landing/Sybr_Documentation.pdf';
const SAMPLE_DATA_URL = 'https://doi.org/10.6084/m9.figshare.32315682';
const WORKFLOW_IMAGE = '/landing/sybr-workflow.png';

function WorkflowLightbox({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="SyBR workflow diagram"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <motion.img
            src={WORKFLOW_IMAGE}
            alt="SyBR pipeline workflow"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function WorkflowShowcase() {
  const [open, setOpen] = useState(false);

  return (
    <section id="workflow" className="scroll-mt-24 border-t border-border bg-background py-24">
      <div className="container mx-auto max-w-5xl px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl"
        >
          Explore the streamlined process
        </motion.h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          This workflow guides you from inputting your gene lists to obtaining comprehensive
          enrichment results and visualizations.
        </p>

        <div className="mb-12 flex flex-wrap justify-center gap-4">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            <GithubIcon className="h-5 w-5" />✨ Access CLI
          </a>
          <a
            href={DOC_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-semibold text-foreground transition-all hover:border-primary/50 hover:text-primary"
          >
            <FileText className="h-5 w-5" />
            Documentation
          </a>
          <a
            href={SAMPLE_DATA_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-semibold text-foreground transition-all hover:border-primary/50 hover:text-primary"
          >
            <Database className="h-5 w-5" />
            Sample Data
          </a>
        </div>

        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          aria-label="Open workflow diagram in full view"
          className="group relative mx-auto block max-w-3xl overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-lg"
        >
          <img
            src={WORKFLOW_IMAGE}
            alt="SyBR pipeline workflow"
            loading="lazy"
            className="w-full rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-xl bg-black/0 transition-colors group-hover:bg-black/30">
            <span className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-4 w-4" />
              Click to enlarge
            </span>
          </span>
        </motion.button>
      </div>

      <WorkflowLightbox open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
