import { useState } from 'react';
import { ChevronDown, Mail, ScrollText, Settings2, Package, Square, Trash2 } from 'lucide-react';
import type { JobResponse } from '@/lib/sybr-api';
import { sybrApi, formatTime } from '@/lib/sybr-api';
import { useJobLogs } from '@/hooks/use-sybr';
import { StatusBadge } from '@/components/sybr/status-badge';
import { Alert, Card, ProgressBar } from '@/components/sybr/primitives';
import { ResultsBrowser } from '@/components/sybr/results-browser';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from '@/components/animate-ui/components/radix/tabs';
import { cn } from '@/lib/utils';

type DetailTab = 'logs' | 'config' | 'results';

export function JobCard({
  apiKey,
  job,
  defaultExpanded = false,
  onChanged,
}: {
  apiKey: string;
  job: JobResponse;
  defaultExpanded?: boolean;
  onChanged?: () => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [tab, setTab] = useState<DetailTab>('logs');
  const [busy, setBusy] = useState(false);

  const isRunning = job.status === 'running' || job.status === 'validating';
  const isTerminal = ['completed', 'failed', 'cancelled'].includes(job.status);

  const logs = useJobLogs(apiKey, job.job_id, 80, {
    enabled: expanded && tab === 'logs',
    pollMs: expanded && tab === 'logs' && isRunning ? 5000 : undefined,
  });

  const handleAction = async () => {
    setBusy(true);
    try {
      await sybrApi.deleteJob(apiKey, job.job_id);
      onChanged?.();
    } catch {
      /* surfaced by parent refetch */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{job.job_name ?? 'Unnamed'}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{job.job_id}</p>
          {job.email ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {job.email}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusBadge status={job.status} />
          {job.progress.percent > 0 ? (
            <div className="w-40">
              <ProgressBar value={job.progress.percent} />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {job.progress.current_stage ? `${job.progress.current_stage} · ` : ''}
                {Math.round(job.progress.percent)}%
              </p>
            </div>
          ) : null}
        </div>

        <div className="text-right text-xs text-muted-foreground">
          <p>Created: {formatTime(job.created_at)}</p>
          {job.started_at ? <p>Started: {formatTime(job.started_at)}</p> : null}
          {job.completed_at ? <p>Done: {formatTime(job.completed_at)}</p> : null}
        </div>

        <div className="flex gap-2">
          {isRunning ? (
            <Button variant="destructive" size="sm" disabled={busy} onClick={handleAction}>
              <Square className="h-3.5 w-3.5" />
              Cancel
            </Button>
          ) : isTerminal ? (
            <Button variant="destructive" size="sm" disabled={busy} onClick={handleAction}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between border-t border-border bg-muted/40 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <span>Details &amp; Logs</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded ? (
        <div className="border-t border-border p-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as DetailTab)}>
            <TabsList className="w-full">
              <TabsTrigger value="logs">
                <ScrollText className="h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="config">
                <Settings2 className="h-4 w-4" />
                Config
              </TabsTrigger>
              <TabsTrigger value="results">
                <Package className="h-4 w-4" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContents className="pt-4">
              <TabsContent value="logs" className="space-y-3">
                {logs.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading logs…</p>
                ) : logs.data?.pipeline_log ? (
                  <pre className="max-h-96 overflow-auto rounded-lg bg-foreground/5 p-3 font-mono text-xs leading-relaxed text-foreground">
                    {logs.data.pipeline_log}
                  </pre>
                ) : (
                  <Alert variant="info">No log output yet.</Alert>
                )}
                {job.error ? <Alert variant="error">Error: {job.error}</Alert> : null}
              </TabsContent>

              <TabsContent value="config">
                {job.config ? (
                  <pre className="max-h-96 overflow-auto rounded-lg bg-foreground/5 p-3 font-mono text-xs leading-relaxed text-foreground">
                    {JSON.stringify(job.config, null, 2)}
                  </pre>
                ) : (
                  <Alert variant="info">No configuration recorded.</Alert>
                )}
              </TabsContent>

              <TabsContent value="results">
                {job.status === 'completed' ? (
                  <ResultsBrowser apiKey={apiKey} jobId={job.job_id} />
                ) : (
                  <Alert variant="info">Results are available once the job completes.</Alert>
                )}
              </TabsContent>
            </TabsContents>
          </Tabs>
        </div>
      ) : null}
    </Card>
  );
}
