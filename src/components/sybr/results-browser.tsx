import { useState } from 'react';
import { ChevronUp, Download, FileArchive, Folder, FileText } from 'lucide-react';
import { sybrApi, formatBytes } from '@/lib/sybr-api';
import { useJobResults } from '@/hooks/use-sybr';
import { Alert } from '@/components/sybr/primitives';
import { Button } from '@/components/ui/button';

export function ResultsBrowser({ apiKey, jobId }: { apiKey: string; jobId: string }) {
  const [path, setPath] = useState('');
  const { data, error, isLoading } = useJobResults(apiKey, jobId, path);

  const crumbs = path ? path.split('/') : [];
  const entries = data?.entries ?? [];
  const dirs = entries.filter((e) => e.is_dir).sort((a, b) => a.name.localeCompare(b.name));
  const files = entries.filter((e) => !e.is_dir).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => setPath('')}
            className="font-medium text-foreground hover:text-primary"
          >
            outputs
          </button>
          {crumbs.map((crumb, i) => {
            const target = crumbs.slice(0, i + 1).join('/');
            return (
              <span key={target} className="flex items-center gap-1">
                <span className="text-muted-foreground">/</span>
                <button
                  type="button"
                  onClick={() => setPath(target)}
                  className="font-mono text-muted-foreground hover:text-primary"
                >
                  {crumb}
                </button>
              </span>
            );
          })}
        </div>
        <Button asChild size="sm">
          <a href={sybrApi.resultsArchiveUrl(apiKey, jobId)} target="_blank" rel="noreferrer">
            <FileArchive className="h-3.5 w-3.5" />
            Download all (ZIP)
          </a>
        </Button>
      </div>

      {path ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPath(crumbs.slice(0, -1).join('/'))}
        >
          <ChevronUp className="h-3.5 w-3.5" />
          Go up
        </Button>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading results…</p>
      ) : error ? (
        <Alert variant="warning">Could not load results: {error}</Alert>
      ) : entries.length === 0 ? (
        <Alert variant="info">Empty directory.</Alert>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {dirs.map((d) => (
            <li key={d.path}>
              <button
                type="button"
                onClick={() => setPath(d.path)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <Folder className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate font-medium">{d.name}</span>
              </button>
            </li>
          ))}
          {files.map((f) => (
            <li key={f.path} className="flex items-center gap-2 px-3 py-2 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-mono">{f.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(f.size_bytes)}</span>
              <a
                href={sybrApi.resultFileUrl(apiKey, jobId, f.path)}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                aria-label={`Download ${f.name}`}
              >
                <Download className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
