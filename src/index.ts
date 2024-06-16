import { assert } from 'aidly';
import { type StreamPlugin } from './types';
import { StreamManager, type StreamOptions } from './stream';

export function create<T extends unknown>(
  options: Partial<StreamOptions> & {
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
  const stream = new StreamManager<T>(newOptions);
  if (newOptions.plugin) {
    stream.usePlugin(newOptions.plugin);
  }
  return stream;
}
