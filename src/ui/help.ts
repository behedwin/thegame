// Help page ("Så spelar du") from the settings dialog: one collapsible section per src/content/help/ file.
import { HELP } from '../content/registry';
import { T } from '../content/texts';
import { h, showDialog } from './dialogs';

export function showHelp(): void {
  const sections = HELP.map((s, i) => h('details', { testId: `help-${s.id}`, attrs: i === 0 ? { open: '' } : {} }, h('summary', { text: s.title }), ...s.body.map((p) => h('p', { text: p }))));
  showDialog(T.help.title, [h('div', { class: 'help', testId: 'help-list' }, ...sections)], [{ label: T.help.close, primary: true }], 'help-dialog');
}
