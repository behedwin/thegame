/// <reference types="vite/client" />

declare module 'virtual:changelog' {
  export interface ChangelogEntry { id: string; title: string; date?: string }
  /** Highest done task id: the number after "1." in the version. */
  export const build: number;
  /** "1.<highest done id>", plus a short commit sha when known. */
  export const version: string;
  /** Player-facing changelog, newest first. */
  export const entries: ChangelogEntry[];
}
