# @lp-labs/react-hotkeys

Scoped keyboard shortcuts and sequences with editable-field exclusions. React 18+ peer only; TypeScript, ESM and CommonJS included.

## Installation

```sh
npm install @lp-labs/react-hotkeys
```

## Quick Start

```jsx
import { useState } from 'react';
import { useHotkeys } from '@lp-labs/react-hotkeys';
export default function Example() {
  const [message, setMessage] = useState('Ready');
  useHotkeys([
    { keys: 'mod+k', handler: () => setMessage('Shortcut activated') },
    { keys: 'g g', handler: () => setMessage('Sequence activated') },
  ]);
  return <output aria-live="polite">{message}</output>;
}
```

## API

`useHotkeys(bindings,{enabled=true,scope,sequenceTimeout=800})`. Bindings contain `keys`, `handler(event)`, optional `enabled`, `allowInEditable`, `preventDefault` (true), and `repeat` (false). `mod` means Ctrl or Cmd. Modifiers `ctrl`, `meta`, `shift`, `alt` and aliases `space`, `esc`, `plus` are supported. Sequences use spaces. `parseShortcut` and `matchesShortcut` are exported. Scope is an element ref; without it the listener attaches to document.

## Benefits

| Area              | Details                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| Scoped listeners  | Attach to an element or document and clean up on unmount.                     |
| Sequence support  | Handle bounded multi-key sequences.                                           |
| Typing safeguards | Ignore editable fields, composition, repeat, and prevented events by default. |

## Customization

| Area      | Details                                                              |
| --------- | -------------------------------------------------------------------- |
| Binding   | Configure shortcut, handler, enabled, repeat, and preventDefault.    |
| Scope     | Choose a referenced element or document.                             |
| Sequences | Set timeout and explicitly allow editable-field shortcuts if needed. |

## Security And Limits

At most 100 bindings, 4 sequence steps, and 100 characters per shortcut; timeout: 100–5,000 ms. Composing, already prevented, repeat and editable-field events are excluded by default. Explicitly enabling editable shortcuts can disrupt typing. Browser/OS-reserved shortcuts cannot be overridden reliably. Handlers are application code and should not perform privileged actions without server authorization. SSR installs no listeners.

## Support

[Donate via PayPal](https://www.paypal.me/LibinPrasanth). Author: [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/).

## License

MIT License. See the packaged [LICENSE](LICENSE) file.
