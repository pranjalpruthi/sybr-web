import { useEffect, useMemo, useState } from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import type { JobResponse } from '@/lib/sybr-api';
import { formatTime } from '@/lib/sybr-api';
import { useJobs } from '@/hooks/use-sybr';
import { useSybrStore, setSybrState } from '@/lib/sybr-store';
import { Alert, Card, Field, SectionTitle, Select, TextInput } from '@/components/sybr/primitives';
import { JobCard } from '@/components/sybr/job-card';
import { Button } from '@/components/ui/button';

const ADMIN_PASSWORD = (import.meta.env.VITE_SYBR_ADMIN_PASSWORD as string | undefined) ?? '';
const STATUS_OPTIONS = ['All', 'queued', 'uploading', 'running', 'completed', 'failed', 'cancelled'];

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState('');
  const [wrong, setWrong] = useState(false);

  const unlock = () => {
    if (pw === ADMIN_PASSWORD) {
      onUnlock();
    } else {
      setWrong(true);
    }
  };

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <SectionTitle hint="Enter the admin password to view all jobs for this API key.">
        <span className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Admin Access
        </span>
      </SectionTitle>
      <Field label="Admin Password">
        <TextInput
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && unlock()}
        />
      </Field>
      {wrong ? <Alert variant="error">Incorrect password.</Alert> : null}
      <Button onClick={unlock} className="w-full">
        Unlock
      </Button>
    </Card>
  );
}

function EmailSummary({ jobs }: { jobs: JobResponse[] }) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const j of jobs) {
      if (j.email) map.set(j.email, (map.get(j.email) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  return (
    <Card className="space-y-4 p-6">
      <SectionTitle>Email Summary — Submitters</SectionTitle>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <p className="mb-2 text-sm font-medium text-foreground">Jobs per email</p>
          {counts.length === 0 ? (
            <Alert variant="info">No emails recorded yet.</Alert>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-1.5 font-medium">Email</th>
                  <th className="py-1.5 text-right font-medium">Jobs</th>
                </tr>
              </thead>
              <tbody>
                {counts.map(([email, n]) => (
                  <tr key={email} className="border-b border-border/50">
                    <td className="py-1.5">{email}</td>
                    <td className="py-1.5 text-right font-mono">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="lg:col-span-2">
          <p className="mb-2 text-sm font-medium text-foreground">Per-job email log</p>
          <div className="max-h-72 overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-1.5 font-medium">Email</th>
                  <th className="px-3 py-1.5 font-medium">Job</th>
                  <th className="px-3 py-1.5 font-medium">Status</th>
                  <th className="px-3 py-1.5 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.job_id} className="border-t border-border/50">
                    <td className="px-3 py-1.5">{j.email ?? '—'}</td>
                    <td className="px-3 py-1.5">{j.job_name ?? '—'}</td>
                    <td className="px-3 py-1.5">{j.status}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap">{formatTime(j.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function AllJobs({ apiKey }: { apiKey: string }) {
  const unlocked = useSybrStore((s) => s.adminUnlocked);
  const [statusFilter, setStatusFilter] = useState('All');

  const { data, error, isLoading, isFetching, refetch } = useJobs(apiKey, statusFilter, {
    enabled: unlocked && Boolean(apiKey),
  });

  const jobs = data?.jobs ?? [];
  const anyRunning = jobs.some((j) => j.status === 'running' || j.status === 'validating');

  // Auto-refresh every 10s while any job is running (mirrors the Streamlit app).
  useEffect(() => {
    if (!unlocked || !anyRunning) return;
    const id = window.setInterval(refetch, 10000);
    return () => window.clearInterval(id);
  }, [unlocked, anyRunning, refetch]);

  if (!unlocked) {
    return <AdminGate onUnlock={() => setSybrState({ adminUnlocked: true })} />;
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-end justify-between gap-4 p-4">
        <Field label="Filter by status" className="min-w-48">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Button variant="outline" onClick={refetch} disabled={isFetching}>
          <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </Button>
      </Card>

      {anyRunning ? (
        <Alert variant="info">Auto-refreshing every 10 seconds while jobs are running…</Alert>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading jobs…</p>
      ) : error ? (
        <Alert variant="error">Error loading jobs: {error}</Alert>
      ) : jobs.length === 0 ? (
        <Alert variant="info">No jobs found. Submit a new job from the Submit Job tab.</Alert>
      ) : (
        <>
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.job_id} apiKey={apiKey} job={job} onChanged={refetch} />
            ))}
          </div>
          <EmailSummary jobs={jobs} />
        </>
      )}
    </div>
  );
}
