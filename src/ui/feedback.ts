// Juice: synthesized sounds, haptics, floating numbers and toasts. No audio files, no network.
import { Haptics, ImpactStyle } from '@capacitor/haptics';

let ctx: AudioContext | null = null;
let soundOn = true;
let vibrationOn = true;

export function configureFeedback(sound: boolean, vibration: boolean): void {
  soundOn = sound;
  vibrationOn = vibration;
}

function audio(): AudioContext | null {
  if (!soundOn) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, startIn: number, duration: number, volume: number, type: OscillatorType = 'sine'): void {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + startIn;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(a.destination);
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
  event(): void {
    tone(880, 0, 0.1, 0.05);
    tone(1175, 0.09, 0.1, 0.05);
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
  layer.append(span);
  span.addEventListener('animationend', () => span.remove());
  // Keep the layer light even under heavy tapping.
  while (layer.childElementCount > 24) layer.firstElementChild?.remove();
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
