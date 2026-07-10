/**
 * SYBR API client.
 *
 * Thin, typed wrapper around the FastAPI backend (see `api/` in the repo root).
 * The base URL is read from the `VITE_SYBR_API_URL` env var and falls back to
 * the local dev server. All authenticated requests attach the `X-API-Key`
 * header; file/archive downloads use the `?api_key=` query parameter instead,
 * because they are opened directly by the browser.
 */

export const API_BASE: string =
  (import.meta.env.VITE_SYBR_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:8000/api/v1';

// ── Domain types (mirrors api/models.py) ─────────────────────────────────────

export type JobStatus =
  | 'queued'
  | 'uploading'
  | 'validating'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type FileCategory =
  | 'fasta'
  | 'satsuma_alignments'
  | 'sequence_lengths'
  | 'scaffolds'
  | 'lastz_alignments'
  | 'species_info'
  | 'tree'
  | 'classification'
  | 'annotation'
  | 'hgt';

export interface RunStages {
  synteny_processing: boolean;
  eba_analysis: boolean;
  enrichment_analysis: boolean;
  chainNet_generation: boolean;
  Ancestor_seq_recunstruction: boolean;
  hgt_overlap_analysis: boolean;
}

export interface JobSubmitRequest {
  job_name: string;
  email?: string | null;
  run_stages: RunStages;
  reference_name: string;
  reference_species: string;
  eba: { n: number; r: string; p: number };
  window_sizes: number[];
  step_size: number;
  cores: number;
}

export interface JobProgress {
  current_stage: string | null;
  percent: number;
}

export interface JobResponse {
  job_id: string;
  job_name?: string | null;
  email?: string | null;
  status: JobStatus;
  progress: JobProgress;
  config?: Record<string, unknown> | null;
  cores: number;
  created_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  error?: string | null;
}

export interface JobCreateResponse {
  job_id: string;
  status: JobStatus;
  created_at: string;
  message: string;
}

export interface JobListResponse {
  jobs: JobResponse[];
  total: number;
}

export interface JobLogEvent {
  level?: string;
  message?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface JobLogsResponse {
  job_id: string;
  pipeline_log: string;
  events: JobLogEvent[];
}

export interface ResultEntry {
  path: string;
  name: string;
  is_dir: boolean;
  size_bytes?: number | null;
}

export interface ResultListResponse {
  job_id: string;
  entries: ResultEntry[];
}

export interface FileUploadResponse {
  job_id: string;
  filename: string;
  category: string;
  size_bytes: number;
  destination: string;
  message: string;
}

export interface FileInfo {
  name: string;
  category: string;
  size_bytes: number;
  uploaded_at?: string | null;
}

export interface FileListResponse {
  job_id: string;
  files: FileInfo[];
  total: number;
}

export interface AuthVerifyResponse {
  valid: boolean;
  key_name: string;
  permissions: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  pipeline_dir: string;
  jobs_dir: string;
  active_jobs: number;
}

// ── Error handling ───────────────────────────────────────────────────────────

export class SybrApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'SybrApiError';
    this.status = status;
  }
}

function detailFrom(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === 'string') {
      if (/^\s*</.test(detail)) {
        return 'API unreachable — got an HTML page instead of JSON. Is the backend running and /api/v1 proxied?';
      }
      return detail;
    }
    return JSON.stringify(detail);
  }
  return fallback;
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

async function request<T>(
  apiKey: string,
  endpoint: string,
  init: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...init,
      headers: {
        'X-API-Key': apiKey,
        ...(init.headers ?? {}),
      },
    });
  } catch (err) {
    throw new SybrApiError(
      err instanceof Error ? err.message : 'Network error — is the API reachable?',
      0,
    );
  }

  const body = await parseJson(res);
  if (!res.ok) {
    throw new SybrApiError(detailFrom(body, `Request failed (${res.status})`), res.status);
  }
  return body as T;
}

// ── Endpoints ────────────────────────────────────────────────────────────────

export const sybrApi = {
  health: (apiKey: string) => request<HealthResponse>(apiKey, '/health'),

  verifyKey: (apiKey: string) => request<AuthVerifyResponse>(apiKey, '/auth/verify'),

  createJob: (apiKey: string, payload: JobSubmitRequest) =>
    request<JobCreateResponse>(apiKey, '/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  listJobs: (apiKey: string, statusFilter?: string) =>
    request<JobListResponse>(
      apiKey,
      `/jobs${statusFilter && statusFilter !== 'All' ? `?status_filter=${encodeURIComponent(statusFilter)}` : ''}`,
    ),

  getJob: (apiKey: string, jobId: string) =>
    request<JobResponse>(apiKey, `/jobs/${encodeURIComponent(jobId)}`),

  startJob: (apiKey: string, jobId: string) =>
    request<JobResponse>(apiKey, `/jobs/${encodeURIComponent(jobId)}/start`, {
      method: 'POST',
    }),

  getJobLogs: (apiKey: string, jobId: string, tail = 80) =>
    request<JobLogsResponse>(apiKey, `/jobs/${encodeURIComponent(jobId)}/logs?tail=${tail}`),

  deleteJob: (apiKey: string, jobId: string) =>
    request<{ message: string; job_id: string }>(apiKey, `/jobs/${encodeURIComponent(jobId)}`, {
      method: 'DELETE',
    }),

  listFiles: (apiKey: string, jobId: string) =>
    request<FileListResponse>(apiKey, `/jobs/${encodeURIComponent(jobId)}/files`),

  listResults: (apiKey: string, jobId: string, path = '') =>
    request<ResultListResponse>(
      apiKey,
      `/jobs/${encodeURIComponent(jobId)}/results${path ? `?path=${encodeURIComponent(path)}` : ''}`,
    ),

  /**
   * Upload a file with real-time progress.
   *
   * Uses `XMLHttpRequest` (not `fetch`) because it's the only browser API that
   * exposes upload byte-progress events. `onProgress` receives loaded/total
   * bytes for the current file.
   */
  uploadFile(
    apiKey: string,
    jobId: string,
    category: FileCategory,
    file: File,
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<FileUploadResponse> {
    return new Promise<FileUploadResponse>((resolve, reject) => {
      const form = new FormData();
      form.append('category', category);
      form.append('file', file, file.name);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/jobs/${encodeURIComponent(jobId)}/upload`);
      xhr.setRequestHeader('X-API-Key', apiKey);
      // Note: do NOT set Content-Type — the browser adds the multipart boundary.

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(event.loaded, event.total);
      };

      xhr.onload = () => {
        let body: unknown = null;
        try {
          body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch {
          body = { detail: xhr.responseText };
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(file.size, file.size);
          resolve(body as FileUploadResponse);
        } else {
          reject(new SybrApiError(detailFrom(body, `Upload failed (${xhr.status})`), xhr.status));
        }
      };

      xhr.onerror = () =>
        reject(new SybrApiError('Network error during upload — is the API reachable?', 0));
      xhr.onabort = () => reject(new SybrApiError('Upload cancelled', 0));

      xhr.send(form);
    });
  },

  // Direct-download URLs (browser navigation / anchor href). Auth via query param.
  resultFileUrl: (apiKey: string, jobId: string, filePath: string) =>
    `${API_BASE}/jobs/${encodeURIComponent(jobId)}/results/${filePath}?api_key=${encodeURIComponent(apiKey)}`,

  resultsArchiveUrl: (apiKey: string, jobId: string) =>
    `${API_BASE}/jobs/${encodeURIComponent(jobId)}/results_archive?api_key=${encodeURIComponent(apiKey)}`,
};

// ── Formatting helpers ───────────────────────────────────────────────────────

/** Convert an ISO-8601 UTC string (e.g. "2026-04-29T05:47:50Z") to local time. */
export function formatTime(iso?: string | null): string {
  if (!iso) return '—';
  const parsed = new Date(iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Strip ANSI escape / control sequences from pipeline log output so it renders
 * cleanly in a plain <pre> block. The Snakemake pipeline emits colour codes and
 * cursor-movement sequences that would otherwise show up as noise.
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: intentionally matching ANSI control codes.
const ANSI_PATTERN = /[\u001b\u009b][[()#;?]*(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]/g;

export function stripAnsi(input: string): string {
  return input.replace(ANSI_PATTERN, '');
}

export function formatBytes(raw?: number | null): string {
  const bytes = raw ?? 0;
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
