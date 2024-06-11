import { AsyncHook, PluginSystem } from "hooks-plugin";
import { createId } from "./utils";

type PluginArgs<T> = ReturnType<Manager<T>["plsys"]["use"]>;

export interface ManagerOptions {
  limit: number;
  height: number;
  rowGap: number;
  capacity: number;
  interval: number;
  times: [number, number];
  isShow: boolean;
  forceRender: boolean;
  direction: "right" | "left";
}

export class Manager<T extends unknown> {
  private stashBarrages = new Set();
  private displayBarrages = new Set();
  private specialBarrages = new Set();

  public version = __VERSION__;
  public plsys = new PluginSystem({
    send: new AsyncHook<[T], Manager<T>>(this),
    create: new AsyncHook<[], Manager<T>>(this),
  });

  public constructor(private options: ManagerOptions) {}

  public usePlugin(plugin: Omit<PluginArgs<T>, "name"> & { name?: string }) {
    if (!plugin.name) {
      plugin.name = `runtime_plugin_${createId()}`;
    }
    this.plsys.use(plugin as PluginArgs<T>);
  }

  public send(data: T, plugin?: unknown) {
    if (!this.canAdd()) return false;
    this.stashBarrages.add({ data, plugin });
    this.plsys.lifecycle.send.emit(data);
    return true;
  }

  public startPlaying() {
    this.plsys.lock();
  }

  private canAdd() {
    return true;
  }
}
