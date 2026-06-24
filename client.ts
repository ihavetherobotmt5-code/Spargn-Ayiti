/// <reference types="vite/client" />

/**
 * Client-side configuration for Spargn Ayiti.
 *
 * Single source of truth for all values read from `import.meta.env` (which
 * Vite statically replaces at build time). This file MUST NOT reference
 * `process.env` — Vite replaces `process.env.*` with empty strings in the
 * browser bundle, silently breaking config.
 *
 * To expose a new env var to the client:
 *   1. Prefix it with `VITE_` in your `.env` file (e.g. `VITE_API_BASE_URL=...`)
 *   2. Declare it in the `ImportMetaEnv` interface below (declaration merging
 *      extends Vite's built-in type — no `as any` needed).
 *   3. Read it via `clientConfig` — do NOT call `import.meta.env` directly
 *      elsewhere in the codebase.
 *
 * Usage:
 *   import { clientConfig } from './config/client';
 *   const apiBase = clientConfig.apiBaseUrl;
 */

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

function readEnv(key: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export const clientConfig = {
  /** Base URL for API calls. Defaults to relative `/api` so the same build
   *  works in dev (Vite proxy) and production (Express static serve). */
  apiBaseUrl: readEnv('VITE_API_BASE_URL', '/api'),
  /** App version surfaced in the Settings page footer. */
  appVersion: readEnv('VITE_APP_VERSION', '0.1.0'),
} as const;

export type ClientConfig = typeof clientConfig;
