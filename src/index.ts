import { Manager, type ManagerOptions } from "./manager";

export function create(options: Partial<ManagerOptions>) {
  return new Manager({
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
}
