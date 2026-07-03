import { Link } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { Layers, MousePointerClick } from 'lucide-react';
import { GithubIcon } from '@/components/brand-icons';

const YT_VIDEO_ID = '6mHRhnU-bII';
const REPO_URL = 'https://github.com/BioinformaticsOnLine/Sybr';
const APP_URL = 'http://sybr.igib.res.in/app';

const updates = [
  {
    date: '2026-04-28',
    title: 'Sybr Web Server Alpha',
    description:
      'Sybr is now available as a hosted web service at sybr.igib.res.in. Submit jobs, track results, and download outputs directly from your browser — no local installation required.',
  },
  {
    date: '2026-03-15',
    title: 'DESCHRAMBLER Integration',
    description:
      'Added ancestral genome reconstruction support via DESCHRAMBLER. Infer ancestral genomic organization directly from LastZ alignments using a dedicated pipeline stage.',
  },
  {
    date: '2026-02-10',
    title: 'Enrichment Analysis via getENRICH',
    description:
      'Integrated the getENRICH module for functional enrichment of identified EBRs and msHSBs.',
  },
];

/** Full-bleed, muted, looping YouTube background video. */
function VideoBackground() {
  const src = `https://www.youtube-nocookie.com/embed/${YT_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${YT_VIDEO_ID}&playsinline=1&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3`;
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0b1020]">
      {/* 16:9 iframe scaled to always cover the section (like a CSS background-cover). */}
      <iframe
        title="SyBR background"
        src={src}
        allow="autoplay; encrypted-media"
        className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2"
        frameBorder={0}
      />
      {/* Dark overlay to keep foreground text legible (mirrors the Mobirise 0.6 overlay). */}
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-background" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-28 pb-20 text-white">
      <VideoBackground />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: headline + actions */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-heading text-6xl font-bold tracking-tight md:text-8xl"
            >
              SyBR
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 max-w-2xl text-2xl font-semibold text-white/90 md:text-3xl"
            >
              Multi-species synteny analysis and ancestral genome reconstruction toolkit
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
            >
              Automated pipeline for synteny analysis and ancestral genome reconstruction. Identifies
              conserved genomic blocks and evolutionary breakpoints across multiple species. Integrates
              EBA, DESCHRAMBLER, and getENRICH in a single modular workflow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/analysis"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
              >
                <MousePointerClick className="h-5 w-5" />
                Get Started
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-7 py-3 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <GithubIcon className="h-5 w-5" />
                Github
              </a>
              <a
                href="#workflow"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-7 py-3 text-lg font-semibold text-white transition-all hover:bg-white/10"
              >
                <Layers className="h-5 w-5" />
                Workflow
              </a>
            </motion.div>
          </div>

          {/* Right: recent updates panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md"
          >
            <h3 className="mb-5 text-lg font-semibold text-white">Recent Updates</h3>
            <ul className="space-y-5">
              {updates.map((u) => (
                <li key={u.date} className="border-l-2 border-primary/70 pl-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    🔹 {u.date}
                  </p>
                  <p className="mt-1 font-semibold text-white">{u.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{u.description}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { APP_URL, REPO_URL };
