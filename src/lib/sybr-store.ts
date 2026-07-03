/**
 * Tiny global store for SYBR dashboard client state.
 *
 * Holds the API key, the active dashboard page, the last looked-up job id, and
 * whether the admin view is unlocked. Backed by `useSyncExternalStore` so it
 * works without any external state-management dependency, and persisted to
 * `localStorage` (guarded for SSR / prerender where `window` is absent).
 */

import { useSyncExternalStore } from 'react';

export type DashboardPage = 'submit' | 'check' | 'admin';

export interface SybrState {
  apiKey: string;
  page: DashboardPage;
  lookupJobId: string;
  adminUnlocked: boolean;
}

const STORAGE_KEY = 'sybr-dashboard-state';
const PERSISTED_KEYS: (keyof SybrState)[] = ['apiKey', 'lookupJobId'];

const DEFAULT_STATE: SybrState = {
  apiKey: '',
  page: 'submit',
  lookupJobId: '',
  adminUnlocked: false,
};

function loadPersisted(): Partial<SybrState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<SybrState>) : {};
  } catch {
    return {};
  }
}

let state: SybrState = { ...DEFAULT_STATE, ...loadPersisted() };
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave: Partial<SybrState> = {};
    for (const key of PERSISTED_KEYS) {
      (toSave as Record<string, unknown>)[key] = state[key];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    /* ignore write failures (e.g. private mode) */
  }
}

export function setSybrState(patch: Partial<SybrState>): void {
  state = { ...state, ...patch };
  persist();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SybrState {
  return state;
}

// Server / prerender snapshot: always defaults (no localStorage access).
function getServerSnapshot(): SybrState {
  return DEFAULT_STATE;
}

export function useSybrStore<T>(selector: (s: SybrState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getServerSnapshot()),
  );
}
