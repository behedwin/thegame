// Customer list view: which contracts are signed this school year and what they give.
import { CUSTOMERS } from '../content/registry';
import { T } from '../content/texts';
import { customerClickMult, customerProdMult, nextCustomer, signedCustomers, type GameState } from '../core';
import { h, showDialog } from './dialogs';
import { fmt } from './format';

/** Body elements for the customer list. Exported separately for testability. */
export function customerListBody(state: GameState): HTMLElement[] {
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
