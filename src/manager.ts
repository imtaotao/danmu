import { SyncHook, AsyncHook, PluginSystem } from "hooks-plugin";
import { SimpleBarrage } from "./barrages/simple";
import { CustomBarrage } from "./barrages/customized";
import { NO_EMIT, hasOwn, createId, timeSlice } from "./utils";

export type ManagerPlugin<T> = Omit<
  ReturnType<Manager<T>["plSys"]["use"]>,
  "name"
> & { name?: string };

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
  public version = __VERSION__;
  public plSys = new PluginSystem({
    stop: new SyncHook<[], Manager<T>>(this),
    start: new SyncHook<[], Manager<T>>(this),
    send: new AsyncHook<[T], Manager<T>>(this),
    create: new AsyncHook<[], Manager<T>>(this),
    render: new AsyncHook<[T], Manager<T>>(this),
    updateOptions: new SyncHook<[ManagerOptions], Manager<T>>(this),
  });
  private renderTimer: number | null = null;
  public bs = {
    c: new Set(),
    d: new Set<{ data: T; plugin?: unknown }>(),
    s: [] as Array<{ data: T; plugin?: unknown } | SimpleBarrage>,
  };

  public constructor(private options: ManagerOptions) {}

  public playing() {
    return this.renderTimer !== null;
  }

  public n() {
    const { c, s, d } = this.bs;
    return {
      custom: c.size,
      stash: s.length,
      display: d.size + c.size,
      all: d.size + c.size + s.length,
    };
  }

  public usePlugin(plugin: ManagerPlugin<T>) {
    plugin.name = plugin.name || `runtime_plugin_${createId()}`;
    this.plSys.use(plugin as ManagerPlugin<T> & { name: string });
  }

  public updateOptions(newOptions: Partial<ManagerOptions>) {
    this.options = Object.assign(this.options, newOptions);
    if (hasOwn(newOptions, "interval")) {
      this.stopPlaying(NO_EMIT);
      this.startPlaying(NO_EMIT);
    }
  }

  public send(data: T, plugin?: unknown) {
    if (!this.canAdd()) return false;
    this.bs.s.push({ data, plugin });
    this.plSys.lifecycle.send.emit(data);
    return true;
  }

  public sendForward(data: T, plugin?: unknown) {
    if (!this.canAdd()) return false;
    this.bs.s.unshift({ data, plugin });
    this.plSys.lifecycle.send.emit(data);
    return true;
  }

  public startPlaying(flag?: Symbol) {
    if (this.playing()) return;
    this.plSys.lock();
    const { interval } = this.options;
    if (flag !== NO_EMIT) {
      this.plSys.lifecycle.start.emit();
    }
    const setTime = () => {
      this.render();
      this.renderTimer = setTimeout(setTime, interval);
    };
    setTime();
  }

  public stopPlaying(flag?: Symbol) {
    if (!this.playing()) return;
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
    }
    this.renderTimer = null;
    if (flag !== NO_EMIT) {
      this.plSys.lifecycle.stop.emit();
    }
    this.plSys.unlock();
  }

  private render() {
    if (this.bs.s.length === 0) return;
  }

  private canAdd() {
    return true;
  }
}
