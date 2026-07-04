import { useCallback, useMemo, useState } from 'react';
import { ChevronUp, Download, FileArchive, FileText, Folder, Loader2, X } from 'lucide-react';
import type { ResultEntry } from '@/lib/sybr-api';
import { sybrApi, formatBytes } from '@/lib/sybr-api';
import { useJobResults } from '@/hooks/use-sybr';
import { Alert, ProgressBar } from '@/components/sybr/primitives';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DownloadState {
  phase: 'idle' | 'preparing' | 'downloading' | 'done' | 'error';
  current: number;
  total: number;
  currentName?: string;
  failed: string[];
  errorMessage?: string;
}

const IDLE_DOWNLOAD: DownloadState = { phase: 'idle', current: 0, total: 0, failed: [] };

export function ResultsBrowser({ apiKey, jobId }: { apiKey: string; jobId: string }) {
  const [path, setPath] = useState('');
  // Selection persists across directory navigation; keyed by entry path.
  const [selected, setSelected] = useState<Map<string, ResultEntry>>(new Map());
  const [download, setDownload] = useState<DownloadState>(IDLE_DOWNLOAD);
  const { data, error, isLoading } = useJobResults(apiKey, jobId, path);

  const crumbs = path ? path.split('/') : [];
  const entries = data?.entries ?? [];
  const dirs = entries.filter((e) => e.is_dir).sort((a, b) => a.name.localeCompare(b.name));
  const files = entries.filter((e) => !e.is_dir).sort((a, b) => a.name.localeCompare(b.name));

  const isBusy = download.phase === 'preparing' || download.phase === 'downloading';

  const toggle = useCallback((entry: ResultEntry) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(entry.path)) next.delete(entry.path);
      else next.set(entry.path, entry);
      return next;
    });
  }, []);

  const allInDirSelected =
    entries.length > 0 && entries.every((e) => selected.has(e.path));

  const toggleAllInDir = useCallback(() => {
    setSelected((prev) => {
      const next = new Map(prev);
      const everySelected = entries.length > 0 && entries.every((e) => next.has(e.path));
      if (everySelected) {
        for (const e of entries) next.delete(e.path);
      } else {
        for (const e of entries) next.set(e.path, e);
      }
      return next;
    });
  }, [entries]);

  const clearSelection = useCallback(() => setSelected(new Map()), []);

  const selectedEntries = useMemo(() => Array.from(selected.values()), [selected]);
  const selectedFileCount = selectedEntries.filter((e) => !e.is_dir).length;
  const selectedDirCount = selectedEntries.filter((e) => e.is_dir).length;
  const selectedKnownBytes = selectedEntries.reduce(
    (sum, e) => (e.is_dir ? sum : sum + (e.size_bytes ?? 0)),
    0,
  );

  /** Recursively expand a directory into its contained files. */
  const expandDir = useCallback(
    async (dirPath: string): Promise<ResultEntry[]> => {
      const listing = await sybrApi.listResults(apiKey, jobId, dirPath);
      const collected: ResultEntry[] = [];
      for (const entry of listing.entries) {
        if (entry.is_dir) collected.push(...(await expandDir(entry.path)));
        else collected.push(entry);
      }
      return collected;
    },
    [apiKey, jobId],
  );

  /** Fetch a single file and trigger a browser download via an object URL. */
  const downloadOne = useCallback(
    async (entry: ResultEntry) => {
      const res = await fetch(sybrApi.resultFileUrl(apiKey, jobId, entry.path));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = entry.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    },
    [apiKey, jobId],
  );

  const downloadSelected = useCallback(async () => {
    if (selectedEntries.length === 0) return;
    setDownload({ ...IDLE_DOWNLOAD, phase: 'preparing' });

    // Expand any selected folders into concrete files, then de-duplicate.
    const fileMap = new Map<string, ResultEntry>();
    try {
      for (const entry of selectedEntries) {
        if (entry.is_dir) {
          for (const f of await expandDir(entry.path)) fileMap.set(f.path, f);
        } else {
          fileMap.set(entry.path, entry);
        }
      }
    } catch (err) {
      setDownload({
        ...IDLE_DOWNLOAD,
        phase: 'error',
        errorMessage: err instanceof Error ? err.message : 'Failed to list folder contents.',
      });
      return;
    }

    const filesToDownload = Array.from(fileMap.values());
    if (filesToDownload.length === 0) {
      setDownload({ ...IDLE_DOWNLOAD, phase: 'error', errorMessage: 'No files to download.' });
      return;
    }

    const failed: string[] = [];
    for (let i = 0; i < filesToDownload.length; i++) {
      const entry = filesToDownload[i];
      setDownload({
        phase: 'downloading',
        current: i + 1,
        total: filesToDownload.length,
        currentName: entry.name,
        failed,
      });
      try {
        await downloadOne(entry);
      } catch {
        failed.push(entry.path);
      }
    }

    setDownload({
      phase: failed.length ? 'error' : 'done',
      current: filesToDownload.length,
      total: filesToDownload.length,
      failed,
      errorMessage: failed.length ? `${failed.length} file(s) failed to download.` : undefined,
    });
  }, [selectedEntries, expandDir, downloadOne]);

  const downloadPercent =
    download.total > 0 ? (download.current / download.total) * 100 : 0;

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

      <div className="flex flex-wrap items-center gap-2">
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
        {entries.length > 0 ? (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={allInDirSelected}
              onChange={toggleAllInDir}
            />
            Select all in this folder
          </label>
        ) : null}
      </div>

      {/* Selection action bar */}
      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span className="text-foreground">
            <strong>{selected.size}</strong> selected
            {selectedFileCount > 0 ? ` · ${selectedFileCount} file(s)` : ''}
            {selectedDirCount > 0 ? ` · ${selectedDirCount} folder(s)` : ''}
            {selectedKnownBytes > 0 ? ` · ${formatBytes(selectedKnownBytes)}` : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearSelection} disabled={isBusy}>
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
            <Button size="sm" onClick={downloadSelected} disabled={isBusy}>
              {isBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download selected
            </Button>
          </div>
        </div>
      ) : null}

      {/* Download progress / result */}
      {download.phase === 'preparing' ? (
        <Alert variant="info">Preparing files — expanding selected folders…</Alert>
      ) : null}
      {download.phase === 'downloading' ? (
        <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="min-w-0 flex-1 truncate font-mono text-foreground">
              {download.currentName}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {download.current}/{download.total}
            </span>
          </div>
          <ProgressBar value={downloadPercent} />
        </div>
      ) : null}
      {download.phase === 'done' ? (
        <Alert variant="success">
          Downloaded {download.total} file(s).{' '}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => setDownload(IDLE_DOWNLOAD)}
          >
            Dismiss
          </button>
        </Alert>
      ) : null}
      {download.phase === 'error' ? (
        <Alert variant="error">
          {download.errorMessage ?? 'Download failed.'}{' '}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => setDownload(IDLE_DOWNLOAD)}
          >
            Dismiss
          </button>
        </Alert>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading results…</p>
      ) : error ? (
        <Alert variant="warning">Could not load results: {error}</Alert>
      ) : entries.length === 0 ? (
        <Alert variant="info">Empty directory.</Alert>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {dirs.map((d) => {
            const isChecked = selected.has(d.path);
            return (
              <li
                key={d.path}
                className={cn('flex items-center gap-2 px-3 py-2 text-sm', isChecked && 'bg-primary/5')}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-primary"
                  checked={isChecked}
                  onChange={() => toggle(d)}
                  aria-label={`Select folder ${d.name}`}
                />
                <button
                  type="button"
                  onClick={() => setPath(d.path)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left transition-colors hover:text-primary"
                >
                  <Folder className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate font-medium">{d.name}</span>
                </button>
              </li>
            );
          })}
          {files.map((f) => {
            const isChecked = selected.has(f.path);
            return (
              <li
                key={f.path}
                className={cn('flex items-center gap-2 px-3 py-2 text-sm', isChecked && 'bg-primary/5')}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-primary"
                  checked={isChecked}
                  onChange={() => toggle(f)}
                  aria-label={`Select file ${f.name}`}
                />
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
