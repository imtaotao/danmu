import { assert } from 'aidly';
import { StreamManager } from './manager';
import type { CreateOption } from './types';

const formatOptions = <T>(options: CreateOption<T>) => {
  const newOptions = Object.assign(
    {
      gap: 0,
      height: 25,
      interval: 500,
      times: [3500, 4500],
      limits: { stash: 1024 },
      mode: 'strict',
      direction: 'right',
    },
    options,
  );
  assert(newOptions.gap >= 0, 'The "gap" must be >= 0');
  if (typeof newOptions.limits.stash !== 'number') {
    newOptions.limits.stash = 1024;
  }
  return newOptions;
};

export function isManager<T = unknown>(val: unknown): val is StreamManager<T> {
  return val instanceof StreamManager;
}

export function create<T extends unknown>(options: CreateOption<T>) {
  const nop = formatOptions<T>(options);
  const sm = new StreamManager<T>(nop);
  if (nop.plugin) sm.usePlugin(nop.plugin);
  return sm;
}
