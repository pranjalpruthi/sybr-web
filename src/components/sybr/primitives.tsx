import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/sybr-api';

// ── Card ─────────────────────────────────────────────────────────────────────

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  );
}

export function SectionTitle({
  children,
  hint,
  className,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <h3 className="text-lg font-semibold text-foreground">{children}</h3>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

// ── Text / number fields ──────────────────────────────────────────────────────

interface FieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const inputClasses =
  'w-full h-10 rounded-md border border-border bg-input/40 px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50';

export const TextInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function TextInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputClasses, className)} {...props} />;
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn(inputClasses, className)} {...props} />;
  },
);

// ── Alerts ─────────────────────────────────────────────────────────────────────

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const ALERT_STYLES: Record<AlertVariant, { wrap: string; Icon: React.ElementType }> = {
  info: { wrap: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300', Icon: Info },
  success: {
    wrap: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    Icon: CheckCircle2,
  },
  warning: {
    wrap: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
    Icon: TriangleAlert,
  },
  error: {
    wrap: 'border-destructive/30 bg-destructive/10 text-destructive',
    Icon: AlertCircle,
  },
};

export function Alert({
  variant = 'info',
  children,
  className,
}: {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}) {
  const { wrap, Icon } = ALERT_STYLES[variant];
  return (
    <div className={cn('flex items-start gap-2 rounded-lg border px-3 py-2 text-sm', wrap, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── File input (single or multiple) ────────────────────────────────────────────

interface FileDropProps {
  id: string;
  label: React.ReactNode;
  accept: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  hint?: React.ReactNode;
}

export function FileDrop({ id, label, accept, multiple, files, onChange, hint }: FileDropProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const removeFile = (name: string) => onChange(files.filter((f) => f.name !== name));

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground">{label}</div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-input/20 px-4 py-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
      >
        <UploadCloud className="h-6 w-6 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {accept} {multiple ? '(multiple)' : ''}
        </span>
        <span className="text-xs text-muted-foreground">Click to browse or drop files</span>
      </button>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          onChange(multiple ? picked : picked.slice(0, 1));
          e.target.value = '';
        }}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {files.length > 0 ? (
        <ul className="space-y-1">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs"
            >
              <span className="min-w-0 flex-1 truncate font-mono">{f.name}</span>
              <span className="shrink-0 text-muted-foreground">{formatBytes(f.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(f.name)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${f.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
