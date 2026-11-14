// Persistence via @capacitor/preferences (SharedPreferences on Android, localStorage on web).
import { Preferences } from '@capacitor/preferences';
import type { GameState } from '../core/state';
import { deserialize, serialize } from './format';

const KEY = 'skolintegratoren.save';
const BACKUP_KEY = 'skolintegratoren.save.unreadable';

export interface LoadResult {
  state: GameState | null;
  /** Set when a save existed but could not be read. It is kept under a backup key. */
  error?: string;
}

export async function loadGame(nowMs: number): Promise<LoadResult> {
  const { value } = await Preferences.get({ key: KEY });
  if (value === null) return { state: null };
  try {
    return { state: deserialize(value, nowMs) };
  } catch (e) {
    await Preferences.set({ key: BACKUP_KEY, value });
    return { state: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function saveGame(state: GameState): Promise<void> {
  await Preferences.set({ key: KEY, value: serialize(state) });
}

export async function wipeGame(): Promise<void> {
  await Preferences.remove({ key: KEY });
}
