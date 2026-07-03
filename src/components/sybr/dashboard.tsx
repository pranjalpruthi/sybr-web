import { useEffect, useState, type ElementType } from 'react';
import { ClipboardList, Download, FlaskConical, Search } from 'lucide-react';
import { useVerifyKey } from '@/hooks/use-sybr';
import { useSybrStore, setSybrState, type DashboardPage } from '@/lib/sybr-store';
import { ApiConnection, ENV_API_KEY } from '@/components/sybr/api-connection';
import { SubmitJob } from '@/components/sybr/submit-job';
import { CheckJob } from '@/components/sybr/check-job';
import { AllJobs } from '@/components/sybr/all-jobs';
import { Alert } from '@/components/sybr/primitives';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV: { id: DashboardPage; label: string; Icon: ElementType }[] = [
  { id: 'submit', label: 'Submit Job', Icon: FlaskConical },
  { id: 'check', label: 'Check Job', Icon: Search },
  { id: 'admin', label: 'All Jobs (Admin)', Icon: ClipboardList },
];

const PAGE_TITLES: Record<DashboardPage, { title: string; subtitle: string }> = {
  submit: {
    title: 'Submit New Job',
    subtitle: 'Configure pipeline stages, upload input files, and launch your analysis.',
  },
  check: {
    title: 'Check Job Status',
    subtitle: 'Enter your Job ID to view status, logs, and download results.',
  },
  admin: {
    title: 'All Jobs',
    subtitle: 'Admin view — every job submitted with this API key.',
  },
};

export function SybrDashboard() {
  const [mounted, setMounted] = useState(false);
  const page = useSybrStore((s) => s.page);
  const storeKey = useSybrStore((s) => s.apiKey);

  const apiKey = ENV_API_KEY || storeKey;

  // Debounce so verification doesn't fire on every keystroke.
  const [debouncedKey, setDebouncedKey] = useState(apiKey);
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedKey(apiKey), 400);
    return () => window.clearTimeout(id);
  }, [apiKey]);

  const verify = useVerifyKey(debouncedKey);
  const connected = verify.status === 200 && Boolean(verify.data?.valid);

  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch: the dashboard depends on localStorage-backed state.
  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Multi-species synteny analysis &amp; ancestral genome reconstruction toolkit.
          </p>
          <p className="text-xs text-muted-foreground">
            Automated modular workflow for conserved genomic blocks, evolutionary breakpoints,
            ancestral genome reconstruction, and enrichment analysis.
          </p>
        </div>

        <nav className="space-y-1">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSybrState({ page: id })}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                page === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Sample input data</p>
          <p className="text-xs text-muted-foreground">
            Example input files with pre-computed alignments.
          </p>
          <Button variant="outline" size="sm" asChild className="w-full">
            <a href="https://doi.org/10.6084/m9.figshare.32315682" target="_blank" rel="noreferrer">
              <Download className="h-3.5 w-3.5" />
              Download sample data
            </a>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <ApiConnection verify={verify} hasKey={Boolean(apiKey)} />
        </div>
      </aside>

      {/* Main content */}
      <section className="min-w-0 space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">{PAGE_TITLES[page].title}</h2>
          <p className="text-muted-foreground">{PAGE_TITLES[page].subtitle}</p>
        </div>

        {!connected ? (
          <Alert variant="info">
            Enter a valid API key in the sidebar to get started.
          </Alert>
        ) : page === 'submit' ? (
          <SubmitJob apiKey={apiKey} />
        ) : page === 'check' ? (
          <CheckJob apiKey={apiKey} />
        ) : (
          <AllJobs apiKey={apiKey} />
        )}
      </section>
    </div>
  );
}
