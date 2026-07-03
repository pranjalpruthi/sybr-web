import { cn } from '@/lib/utils';
import type { JobStatus } from '@/lib/sybr-api';

const STATUS_STYLES: Record<JobStatus, string> = {
  queued: 'bg-muted text-muted-foreground',
  uploading: 'bg-blue-500/15 text-blue-500',
  validating: 'bg-amber-500/15 text-amber-500',
  running: 'bg-emerald-500/15 text-emerald-500 animate-pulse',
  completed: 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400',
  failed: 'bg-destructive/15 text-destructive',
  cancelled: 'bg-yellow-600/15 text-yellow-600 dark:text-yellow-400',
};

export function StatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {status}
    </span>
  );
}
