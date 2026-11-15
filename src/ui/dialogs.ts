// Minimal modal dialogs built on <dialog>-like overlay divs.
export interface DialogButton {
  label: string;
  primary?: boolean;
  testId?: string;
  onClick?: () => void;
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: { class?: string; text?: string; testId?: string; attrs?: Record<string, string> } = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (props.class) e.className = props.class;
  if (props.text !== undefined) e.textContent = props.text;
  if (props.testId) e.dataset.testid = props.testId;
  for (const [k, v] of Object.entries(props.attrs ?? {})) e.setAttribute(k, v);
  e.append(...children);
  return e;
}

// Close functions of open dialogs, topmost last. Used by the back button.
const openDialogs: (() => void)[] = [];

/** Close the topmost dialog, as if cancelled. Returns false if none was open. */
export function closeTopDialog(): boolean {
  const close = openDialogs.at(-1);
  close?.();
  return close !== undefined;
}

/** Show a modal. Returns a close function. */
export function showDialog(title: string, body: (Node | string)[], buttons: DialogButton[], testId = 'dialog'): () => void {
  const overlay = h('div', { class: 'overlay', testId });
  const card = h('div', { class: 'dialog', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': title } });
  const close = () => {
    const i = openDialogs.indexOf(close);
    if (i < 0) return;
    openDialogs.splice(i, 1);
    overlay.classList.add('out');
    setTimeout(() => overlay.remove(), 180);
  };
  const actions = h('div', { class: 'dialog-actions' });
  for (const b of buttons) {
    const btn = h('button', { class: b.primary ? 'btn primary' : 'btn', text: b.label, ...(b.testId ? { testId: b.testId } : {}) });
    btn.addEventListener('click', () => (close(), b.onClick?.()));
    actions.append(btn);
  }
  card.append(h('h2', { text: title }), ...body.map((b) => (typeof b === 'string' ? h('p', { text: b }) : b)), actions);
  overlay.append(card);
  document.body.append(overlay);
  openDialogs.push(close);
  (actions.querySelector('.primary') as HTMLButtonElement | null)?.focus();
  return close;
}
