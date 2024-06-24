import { assert } from 'aidly';
import { StreamManager } from './manager';
import type { CreateOption } from './types';

const formatOptions = <T>(options: CreateOption<T>) => {
  const newOptions = Object.assign(
    {
      gap: 0,
      limits: {},
      interval: 500,
      mode: 'strict',
      direction: 'right',
      trackHeight: '20%',
      times: [4000, 6000],
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
  const opts = formatOptions<T>(options);
  const manager = new StreamManager<T>(opts);
  if (opts.plugin) {
    manager.usePlugin(() => opts.plugin!);
  }
  return manager;
}
