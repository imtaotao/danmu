import { assert } from 'aidly';
import { type StreamPlugin } from './types';
import { StreamManager, type ManagerOptions } from './manager';

export function isManager<T = unknown>(val: unknown): val is StreamManager<T> {
  return val instanceof StreamManager;
}

export function create<T extends unknown>(
  options: Partial<ManagerOptions> & {
    container: HTMLElement;
    plugin?: StreamPlugin<T>;
  },
) {
  const newOptions = Object.assign(
    {
      gap: 0,
      height: 25,
      mode: 'strict',
      interval: 500,
      stashLimit: 1024,
      times: [3500, 4500],
      direction: 'right',
    },
    options,
  );
  assert(newOptions.gap >= 0, 'The "gap" must be >= 0');
  const sm = new StreamManager<T>(newOptions);
  if (newOptions.plugin) {
    sm.usePlugin(newOptions.plugin);
  }
  return sm;
}
