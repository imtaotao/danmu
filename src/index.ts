import { assert } from 'aidly';
import { StreamManager } from './manager';
import type { CreateOption } from './types';

const formatOptions = <T>(options: CreateOption<T>) => {
  const newOptions = Object.assign(
    {
      mode: 'strict',
      direction: 'right',
      gap: 0,
      interval: 500,
      trackHeight: '20%',
      times: [3500, 4500],
      limits: { stash: 1024 },
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
