// Juice: synthesized sounds, haptics, floating numbers and toasts. No audio files, no network.
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { trimLayer } from './fx';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let soundOn = true;
let vibrationOn = true;
let volume = 1;
let background = false;

/** Share of the volume kept while the app is in the background. */
export const BACKGROUND_DUCK = 0.2;

/** Master gain (0-1) for the given settings. Pure, so it can be tested without audio. */
export function masterGain(sound: boolean, vol: number, inBackground: boolean): number {
  if (!sound || !Number.isFinite(vol)) return 0;
  const v = Math.min(1, Math.max(0, vol));
  return inBackground ? v * BACKGROUND_DUCK : v;
}

function applyGain(): void {
  if (!ctx || !master) return;
  // Short ramp avoids clicks when the slider moves or the app is backgrounded.
  master.gain.setTargetAtTime(masterGain(soundOn, volume, background), ctx.currentTime, 0.05);
}

export function configureFeedback(sound: boolean, vibration: boolean, vol = 1): void {
  soundOn = sound;
  vibrationOn = vibration;
  volume = vol;
  applyGain();
}

/** Duck the sound while the app is hidden; restore it when it returns. */
export function setBackground(hidden: boolean): void {
  background = hidden;
  applyGain();
}

function audio(): AudioContext | null {
  if (masterGain(soundOn, volume, background) <= 0) return null;
  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = masterGain(soundOn, volume, background);
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, startIn: number, duration: number, peak: number, type: OscillatorType = 'sine'): void {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + startIn;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(master ?? a.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  click(): void {
    tone(520 + Math.random() * 160, 0, 0.07, 0.05, 'triangle');
  },
  buy(): void {
    tone(660, 0, 0.08, 0.06, 'triangle');
    tone(990, 0.06, 0.12, 0.05, 'triangle');
  },
  /** Random event: a two-note "ping" like an incoming message. */
  event(): void {
    tone(880, 0, 0.1, 0.05);
    tone(1175, 0.09, 0.1, 0.05);
  },
  /** Automation milestone: short rising triad. */
  milestone(): void {
    [587, 740, 880].forEach((f, i) => tone(f, i * 0.06, 0.14, 0.05, 'triangle'));
  },
  /** New customer signed: warm chord with a bright top note. */
  customer(): void {
    [392, 494, 587].forEach((f) => tone(f, 0, 0.35, 0.03, 'sine'));
    tone(1175, 0.12, 0.25, 0.04, 'triangle');
  },
  fanfare(): void {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.08, 0.18, 0.05, 'triangle'));
  },
};

export function haptic(strength: 'light' | 'medium' = 'light'): void {
  if (!vibrationOn) return;
  Haptics.impact({ style: strength === 'light' ? ImpactStyle.Light : ImpactStyle.Medium }).catch(() => {
    /* not supported: ignore */
  });
}

/** Floating "+12" that rises from a point and fades. */
export function floatText(layer: HTMLElement, x: number, y: number, text: string, big = false): void {
  const span = document.createElement('span');
  span.className = big ? 'float-num big' : 'float-num';
  span.textContent = text;
  span.style.left = `${x + (Math.random() * 40 - 20)}px`;
  span.style.top = `${y}px`;
  // A slightly random arc and size so repeated taps do not stack in a straight column.
  span.style.setProperty('--dx', `${(Math.random() * 60 - 30).toFixed(0)}px`);
  span.style.setProperty('--s', (0.9 + Math.random() * 0.3).toFixed(2));
  layer.append(span);
  span.addEventListener('animationend', () => span.remove());
  trimLayer(layer); // keep the layer light even under heavy tapping
}

let toastHost: HTMLElement | null = null;

export function toast(text: string, kind: 'info' | 'good' | 'event' = 'info'): void {
  if (!toastHost) {
    toastHost = document.createElement('div');
    toastHost.className = 'toasts';
    toastHost.setAttribute('role', 'status');
    document.body.append(toastHost);
  }
  const div = document.createElement('div');
  div.className = `toast ${kind}`;
  div.textContent = text;
  toastHost.append(div);
  setTimeout(() => div.classList.add('out'), 3200);
  setTimeout(() => div.remove(), 3700);
  while (toastHost.childElementCount > 3) toastHost.firstElementChild?.remove();
}
