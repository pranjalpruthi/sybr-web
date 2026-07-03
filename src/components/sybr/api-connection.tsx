import { Activity, KeyRound, PlugZap, ShieldCheck, ShieldX } from 'lucide-react';
import type { AsyncResource } from '@/hooks/use-sybr';
import { useHealth } from '@/hooks/use-sybr';
import type { AuthVerifyResponse } from '@/lib/sybr-api';
import { useSybrStore, setSybrState } from '@/lib/sybr-store';
import { Alert, Field, TextInput } from '@/components/sybr/primitives';

export const ENV_API_KEY = (import.meta.env.VITE_SYBR_API_KEY as string | undefined) ?? '';

export function ApiConnection({
  verify,
  hasKey,
}: {
  verify: AsyncResource<AuthVerifyResponse>;
  hasKey: boolean;
}) {
  const storeKey = useSybrStore((s) => s.apiKey);
  const apiKey = storeKey;
  const { data, error, status, isLoading } = verify;

  const connected = status === 200 && Boolean(data?.valid);
  const health = useHealth(ENV_API_KEY || storeKey, { enabled: connected });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <PlugZap className="h-4 w-4 text-primary" />
        API Connection
      </div>

      {ENV_API_KEY ? (
        <Alert variant="success">API key loaded from environment.</Alert>
      ) : (
        <Field label="API Key" hint="Create one with: python sybr_api.py create-key --name mykey">
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <TextInput
              type="password"
              value={apiKey}
              placeholder="Paste your API key"
              onChange={(e) => setSybrState({ apiKey: e.target.value })}
              className="pl-9"
            />
          </div>
        </Field>
      )}

      {hasKey ? (
        isLoading ? (
          <p className="text-xs text-muted-foreground">Verifying…</p>
        ) : status === 200 && data?.valid ? (
          <>
            <Alert variant="success">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Connected as <strong>{data.key_name}</strong>
              </span>
            </Alert>
            {health.data ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                API v{health.data.version} · {health.data.active_jobs} active job
                {health.data.active_jobs === 1 ? '' : 's'}
              </p>
            ) : null}
          </>
        ) : (
          <Alert variant="error">
            <span className="flex items-center gap-1.5">
              <ShieldX className="h-3.5 w-3.5" />
              {error && status !== 401 && status !== 403 ? error : 'Invalid API key'}
            </span>
          </Alert>
        )
      ) : null}
    </div>
  );
}
