// Hold to sync: the first click is immediate, then it repeats while held, so nobody has to tap
// fast (accessibility). Keyboard auto-repeat is ignored, so holding a key keeps the same cap.
import { isActivateKey } from './a11y';

/** Wire pointer and keyboard holding on el to onClick(x, y). Returns stop(), e.g. for when the app hides. */
export function bindHold(el: HTMLElement, onClick: (x: number, y: number) => void, repeatMs: number): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;
  let [hx, hy] = [0, 0];
  const stop = (): void => {
    if (timer !== null) clearInterval(timer);
    timer = null;
  };
  const start = (x: number, y: number): void => {
    stop();
    [hx, hy] = [x, y];
    onClick(x, y);
    timer = setInterval(() => onClick(hx, hy), repeatMs);
  };
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (e.isPrimary) start(e.clientX, e.clientY);
  });
  el.addEventListener('pointermove', (e) => ([hx, hy] = [e.clientX, e.clientY]));
  for (const type of ['pointerup', 'pointercancel', 'pointerleave', 'blur'] as const) el.addEventListener(type, stop);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  el.addEventListener('keydown', (e) => {
    if (!isActivateKey(e)) return;
    e.preventDefault();
    const r = el.getBoundingClientRect();
    if (!e.repeat) start(r.left + r.width / 2, r.top);
  });
  el.addEventListener('keyup', (e) => isActivateKey(e) && stop());
  return stop;
}
