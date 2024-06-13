import { type ManagerPlugin } from "./types";
import { Manager, type ManagerOptions } from "./manager";

export function create<T extends unknown>(
  options: Partial<ManagerOptions> & {
    container: HTMLElement;
    plugins?: ManagerPlugin<T> | Array<ManagerPlugin<T>>;
  },
) {
  const manager = new Manager<T>({
    ...options,
    height: 30,
    rowGap: 20,
    limit: 1024, // 改名
    interval: 500,
    capacity: 1024, // 内存改名
    times: [5, 10],
    forceRender: false,
    direction: "right",
  });
  const { plugins } = options;
  if (plugins) {
    if (Array.isArray(plugins)) {
      for (const p of plugins) {
        manager.usePlugin(p);
      }
    } else {
      manager.usePlugin(plugins);
    }
  }
  return manager;
}
