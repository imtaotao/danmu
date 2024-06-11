import { Manager, type ManagerPlugin, type ManagerOptions } from "./manager";

export { type ManagerPlugin, type ManagerOptions } from "./manager";

export function create<T extends unknown>(
  options: Partial<ManagerOptions> & { plugin?: ManagerPlugin<T> },
) {
  const manager = new Manager<T>({
    ...options,
    limit: 100,
    height: 50,
    rowGap: 50,
    interval: 0.5,
    capacity: 1024,
    times: [5, 10],
    isShow: true,
    forceRender: false,
    direction: "right",
  });
  if (options.plugin) {
    manager.usePlugin({
      name: "default_plugin",
      ...options.plugin,
    });
  }
  return manager;
}
