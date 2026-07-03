/**
 * Data-fetching hooks for the SYBR dashboard.
 *
 * A minimal async-resource hook with manual refetch and optional polling,
 * plus thin wrappers around the typed API client. Kept dependency-free so the
 * dashboard works with the existing toolchain.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  sybrApi,
  SybrApiError,
  type AuthVerifyResponse,
  type FileListResponse,
  type HealthResponse,
  type JobListResponse,
  type JobLogsResponse,
  type JobResponse,
  type ResultListResponse,
} from '@/lib/sybr-api';

export interface AsyncResource<T> {
  data: T | null;
  error: string | null;
  status: number | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

interface AsyncOptions {
  enabled?: boolean;
  pollMs?: number;
}

function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
  { enabled = true, pollMs }: AsyncOptions = {},
): AsyncResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [tick, setTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setIsFetching(true);
    fetcherRef
      .current()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
        setStatus(200);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setData(null);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus(err instanceof SybrApiError ? err.status : 500);
      })
      .finally(() => {
        if (cancelled) return;
        setIsFetching(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tick, ...deps]);

  // First-load: fetching with nothing to show yet.
  const isLoading = enabled && isFetching && data === null && error === null;

  useEffect(() => {
    if (!enabled || !pollMs) return;
    const id = window.setInterval(refetch, pollMs);
    return () => window.clearInterval(id);
  }, [enabled, pollMs, refetch]);

  return { data, error, status, isLoading, isFetching, refetch };
}

// ── Typed wrappers ───────────────────────────────────────────────────────────

export function useVerifyKey(apiKey: string): AsyncResource<AuthVerifyResponse> {
  return useAsyncResource<AuthVerifyResponse>(
    () => sybrApi.verifyKey(apiKey),
    [apiKey],
    { enabled: apiKey.length > 0 },
  );
}

export function useHealth(apiKey: string, opts: AsyncOptions = {}): AsyncResource<HealthResponse> {
  return useAsyncResource<HealthResponse>(() => sybrApi.health(apiKey), [apiKey], {
    enabled: apiKey.length > 0,
    ...opts,
  });
}

export function useJobFiles(
  apiKey: string,
  jobId: string,
  opts: AsyncOptions = {},
): AsyncResource<FileListResponse> {
  return useAsyncResource<FileListResponse>(
    () => sybrApi.listFiles(apiKey, jobId),
    [apiKey, jobId],
    { enabled: Boolean(apiKey && jobId), ...opts },
  );
}

export function useJob(
  apiKey: string,
  jobId: string,
  opts: AsyncOptions = {},
): AsyncResource<JobResponse> {
  return useAsyncResource<JobResponse>(
    () => sybrApi.getJob(apiKey, jobId),
    [apiKey, jobId],
    { enabled: Boolean(apiKey && jobId), ...opts },
  );
}

export function useJobs(
  apiKey: string,
  statusFilter: string,
  opts: AsyncOptions = {},
): AsyncResource<JobListResponse> {
  return useAsyncResource<JobListResponse>(
    () => sybrApi.listJobs(apiKey, statusFilter),
    [apiKey, statusFilter],
    { enabled: Boolean(apiKey), ...opts },
  );
}

export function useJobLogs(
  apiKey: string,
  jobId: string,
  tail = 80,
  opts: AsyncOptions = {},
): AsyncResource<JobLogsResponse> {
  return useAsyncResource<JobLogsResponse>(
    () => sybrApi.getJobLogs(apiKey, jobId, tail),
    [apiKey, jobId, tail],
    { enabled: Boolean(apiKey && jobId), ...opts },
  );
}

export function useJobResults(
  apiKey: string,
  jobId: string,
  path: string,
  opts: AsyncOptions = {},
): AsyncResource<ResultListResponse> {
  return useAsyncResource<ResultListResponse>(
    () => sybrApi.listResults(apiKey, jobId, path),
    [apiKey, jobId, path],
    { enabled: Boolean(apiKey && jobId), ...opts },
  );
}
