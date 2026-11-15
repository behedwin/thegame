// Customer row under the network (with its signing celebration) and the customer list dialog.
import { CUSTOMERS } from '../content/registry';
import { T } from '../content/texts';
import { customerClickMult, customerProdMult, customersSigned, nextCustomer, signedCustomers, type GameState } from '../core';
import { isActivateKey } from './a11y';
import { effectsFor, flashClass, stamp } from './celebrate';
import { h, showDialog } from './dialogs';
import { sfx, toast } from './feedback';
import { reducedMotion } from './fx';
import { fmt } from './format';

/** Body elements for the customer list. */
function customerListBody(state: GameState): HTMLElement[] {
  const signed = new Set(signedCustomers(state).map((c) => c.id));
  const next = nextCustomer(state);
  const rows = CUSTOMERS.filter((c) => signed.has(c.id)).map((c) =>
    h(
      'li',
      { testId: `customer-${c.id}` },
      h('strong', { text: c.name }),
      ` · ${T.customerKind[c.kind]} · ${T.customerEffect(c.effect)}`,
    ),
  );
  return [
    h('p', { class: 'muted', text: T.customerList.intro }),
    h('ul', { class: 'customer-list', testId: 'customer-list' }, ...rows),
    h('p', { text: T.customerList.total(customerProdMult(state), customerClickMult(state)) }),
    h('p', { class: 'muted', text: next ? T.customerList.next(fmt(next.atRunKp)) : T.customerList.allSigned }),
  ];
}

export function showCustomers(state: GameState): void {
  showDialog(T.customerList.title, customerListBody(state), [{ label: T.customerList.close, primary: true }], 'customers-dialog');
}

/** The tappable row naming the latest customer. Celebrates each new signing once. */
export class CustomerRow {
  readonly host = h('div', { class: 'customers', testId: 'customers', attrs: { role: 'button', tabindex: '0', 'aria-label': T.customerList.open } });
  private last: number;

  constructor(state: () => GameState) {
    this.last = customersSigned(state());
    this.host.addEventListener('click', () => showCustomers(state()));
    this.host.addEventListener('keydown', (e) => isActivateKey(e) && (e.preventDefault(), showCustomers(state())));
  }

  /** Forget earlier signings without celebrating (a new school year starts from zero). */
  reset(state: GameState): void {
    this.last = customersSigned(state);
  }

  render(state: GameState): void {
    const signed = customersSigned(state);
    const who = signed ? `${T.customers(signed)} · ${CUSTOMERS[signed - 1]!.name}` : T.noCustomers;
    if (this.host.firstChild?.nodeValue !== who) this.host.textContent = who; // keeps a running stamp
    if (signed > this.last) {
      toast(T.toastCustomer(CUSTOMERS[signed - 1]!.name), 'good');
      sfx.customer();
      stamp(this.host, T.celebrate.signed);
      if (effectsFor('customer', reducedMotion()).includes('shake')) flashClass(this.host, 'shake', 500);
    }
    this.last = signed;
  }
}
