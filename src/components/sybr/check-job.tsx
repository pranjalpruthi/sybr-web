import { useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useJob } from '@/hooks/use-sybr';
import { useSybrStore, setSybrState } from '@/lib/sybr-store';
import { Alert, Card, Field, TextInput } from '@/components/sybr/primitives';
import { JobCard } from '@/components/sybr/job-card';
import { Button } from '@/components/ui/button';

export function CheckJob({ apiKey }: { apiKey: string }) {
  const savedId = useSybrStore((s) => s.lookupJobId);
  const [input, setInput] = useState(savedId);
  const [activeId, setActiveId] = useState(savedId);

  const { data, error, status, isLoading, isFetching, refetch } = useJob(apiKey, activeId);

  const isRunning = data?.status === 'running' || data?.status === 'validating';
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(refetch, 8000);
    return () => window.clearInterval(id);
  }, [isRunning, refetch]);

  const lookUp = () => {
    const trimmed = input.trim();
    setActiveId(trimmed);
    setSybrState({ lookupJobId: trimmed });
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <Field label="Job ID" hint="The Job ID shown after submitting the pipeline.">
          <TextInput
            value={input}
            placeholder="e.g. sybr_20260429_054750_5a28d442"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') lookUp();
            }}
          />
        </Field>
        <div className="flex gap-2">
          <Button onClick={lookUp} disabled={!input.trim()}>
            <Search className="h-4 w-4" />
            Look up job
          </Button>
          <Button variant="outline" onClick={refetch} disabled={!activeId || isFetching}>
            <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </Button>
        </div>
      </Card>

      {!activeId ? (
        <Alert variant="info">Enter your Job ID above and click “Look up job”.</Alert>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading job…</p>
      ) : status === 404 ? (
        <Alert variant="error">Job not found. Please check the ID and try again.</Alert>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : data ? (
        <JobCard apiKey={apiKey} job={data} defaultExpanded onChanged={refetch} />
      ) : null}
    </div>
  );
}
