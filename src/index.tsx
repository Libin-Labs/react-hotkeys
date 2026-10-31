'use client';
import { useEffect, useRef, type RefObject } from 'react';
export interface Hotkey {
  keys: string;
  handler: (event: KeyboardEvent) => void;
  enabled?: boolean;
  allowInEditable?: boolean;
  preventDefault?: boolean;
  repeat?: boolean;
}
export function parseShortcut(shortcut: string): string[][] {
  const steps = shortcut
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((part) => part.split('+'));
  if (
    !shortcut.trim() ||
    shortcut.length > 100 ||
    steps.length > 4 ||
    steps.some((tokens) => tokens.some((token) => !token))
  )
    throw new TypeError('A shortcut needs 1..4 nonempty combinations and at most 100 characters.');
  return steps;
}
export function matchesShortcut(event: KeyboardEvent, tokens: readonly string[]): boolean {
  const key = tokens.at(-1)!;
  const normalized = key === 'space' ? ' ' : key === 'esc' ? 'escape' : key === 'plus' ? '+' : key;
  const mod = tokens.includes('mod');
  const ctrl = tokens.includes('ctrl');
  const meta = tokens.includes('meta');
  return (
    event.key.toLowerCase() === normalized &&
    (mod ? event.ctrlKey || event.metaKey : event.ctrlKey === ctrl && event.metaKey === meta) &&
    event.shiftKey === tokens.includes('shift') &&
    event.altKey === tokens.includes('alt')
  );
}
export function useHotkeys(
  bindings: readonly Hotkey[],
  {
    enabled = true,
    scope,
    sequenceTimeout = 800,
  }: {
    enabled?: boolean;
    scope?: RefObject<HTMLElement | null>;
    sequenceTimeout?: number;
  } = {},
) {
  if (
    bindings.length > 100 ||
    !Number.isFinite(sequenceTimeout) ||
    sequenceTimeout < 100 ||
    sequenceTimeout > 5000
  )
    throw new RangeError('Shortcut limits exceeded.');
  const current = useRef(
    bindings.map((binding) => ({ ...binding, steps: parseShortcut(binding.keys) })),
  );
  current.current = bindings.map((binding) => ({ ...binding, steps: parseShortcut(binding.keys) }));
  const progress = useRef(
    new Map<
      number,
      {
        keys: string;
        index: number;
        time: number;
      }
    >(),
  );
  useEffect(() => {
    if (!enabled) return;
    const target = scope?.current ?? document;
    const handle = (event: Event) => {
      const key = event as KeyboardEvent;
      if (key.defaultPrevented || key.isComposing) return;
      const editable = (key.target as Element | null)?.closest?.(
        'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]',
      );
      current.current.forEach((binding, position) => {
        if (
          key.defaultPrevented ||
          binding.enabled === false ||
          (key.repeat && !binding.repeat) ||
          (editable && !binding.allowInEditable)
        )
          return;
        const now = Date.now();
        const old = progress.current.get(position);
        const index =
          old?.keys === binding.keys && now - old.time <= sequenceTimeout ? old.index : 0;
        const match = matchesShortcut(key, binding.steps[index] ?? binding.steps[0]!);
        if (!match) {
          progress.current.delete(position);
          if (index && matchesShortcut(key, binding.steps[0]!))
            progress.current.set(position, { keys: binding.keys, index: 1, time: now });
          return;
        }
        if (index === binding.steps.length - 1) {
          progress.current.delete(position);
          if (binding.preventDefault !== false) key.preventDefault();
          binding.handler(key);
        } else progress.current.set(position, { keys: binding.keys, index: index + 1, time: now });
      });
    };
    target.addEventListener('keydown', handle);
    return () => {
      target.removeEventListener('keydown', handle);
      progress.current.clear();
    };
  }, [enabled, scope, sequenceTimeout]);
}
export default useHotkeys;
