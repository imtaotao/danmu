import { type ManagerPlugin } from './types';
import { Manager, type ManagerOptions } from './manager';

export function create<T extends unknown>(
  options: Partial<ManagerOptions> & {
    container: HTMLElement;
    plugin?: ManagerPlugin<T>;
  },
) {
  const manager = new Manager<T>({
    ...options,
    height: 30,
    rowGap: 20,
    interval: 500,
    viewLimit: 100,
    memoryLimit: 1024,
    forceRender: false,
    times: [3000, 6000],
    direction: 'right',
  });
  if (options.plugin) {
    manager.usePlugin(options.plugin);
  }
  return manager;
}
