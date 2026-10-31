import { beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { setup, key } from './helpers.mjs';
import { useHotkeys, parseShortcut } from '../dist/index.js';
let ui;
beforeEach(async () => (ui = await setup()));
afterEach(async () => ui.cleanup());
test('sequences execute once and editable fields are excluded', async () => {
  let calls = 0;
  function App() {
    useHotkeys([
      { keys: 'g g', handler: () => calls++ },
      { keys: 'mod+k', handler: () => calls++ },
    ]);
    return createElement('input');
  }
  await ui.render(createElement(App));
  await key(document.body, 'g');
  await key(document.body, 'g');
  assert.equal(calls, 1);
  await key(ui.container.querySelector('input'), 'k', { ctrlKey: true });
  assert.equal(calls, 1);
  await key(document.body, 'k', { ctrlKey: true });
  assert.equal(calls, 2);
  assert.throws(() => parseShortcut('a b c d e'));
});
