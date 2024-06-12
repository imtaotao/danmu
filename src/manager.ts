import {
  SyncHook,
  AsyncHook,
  SyncWaterfallHook,
  PluginSystem,
} from "hooks-plugin";
import { SimpleBarrage } from "./barrages/simple";
import { CustomBarrage } from "./barrages/customized";
import { Exerciser, type TrackData } from "./exerciser";
import { NO_EMIT, hasOwn, createId, timeSlice } from "./utils";

export type ManagerPlugin<T> = Omit<
  ReturnType<Manager<T>["plSys"]["use"]>,
  "name"
> & { name?: string };

type BarragePlugin = unknown;

export interface BarrageData<T> {
  data: T;
  plugin?: BarragePlugin;
}

export interface ManagerOptions {
  limit: number;
  height: number;
  rowGap: number;
  capacity: number;
  interval: number;
  times: [number, number];
  forceRender: boolean;
  container: HTMLElement;
  direction: "right" | "left";
}

export class Manager<T extends unknown> {
  public version = __VERSION__;
  private exerciser: Exerciser;
  private renderTimer: number | null = null;
  private viewStatus: "hide" | "show" = "show";
  private bs = {
    c: new Set(), // custom
    d: new Set<SimpleBarrage>(), // display
    s: [] as Array<BarrageData<T> | SimpleBarrage>, // stash
  };
  private plSys = new PluginSystem({
    stop: new SyncHook<[], Manager<T>>(this),
    start: new SyncHook<[], Manager<T>>(this),
    send: new AsyncHook<[T], Manager<T>>(this),
    clear: new SyncHook<[], Manager<T>>(this),
    resize: new SyncHook<[], Manager<T>>(this),
    create: new AsyncHook<[], Manager<T>>(this),
    render: new AsyncHook<[], Manager<T>>(this),
    finished: new SyncHook<[], Manager<T>>(this),
    capacityWarning: new SyncHook<[], Manager<T>>(this),
    updateOptions: new SyncHook<[ManagerOptions], Manager<T>>(this),
    willRender: new SyncWaterfallHook<
      { prevent: boolean; value: SimpleBarrage | BarrageData<T> },
      Manager<T>
    >(this),
  });

  public constructor(private options: ManagerOptions) {
    this.exerciser = new Exerciser({
      times: options.times,
      rowGap: options.rowGap,
      height: options.height,
      container: options.container,
      forceRender: options.forceRender,
    });
  }

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

  public getContainer() {
    return this.exerciser.box;
  }

  public resize() {
    this.exerciser.resize();
    this.plSys.lifecycle.resize.emit();
  }

  public clear() {
    this.stopPlaying();
    this.bs.c.clear();
    this.bs.d.clear();
    this.bs.s.length = 0;
    this.each((b) => b.removeFromContainer());
    this.resize();
    this.plSys.lifecycle.clear.emit();
  }

  // 增加异步方法
  public each(fn: (b: SimpleBarrage) => boolean | void) {
    let i = 0;
    for (const item of this.bs.c) {
      if (fn(item as SimpleBarrage) === false) return;
    }
    for (const item of this.bs.d) {
      if (item.moving) {
        if (fn(item) === false) return;
      }
    }
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
    if (!this.canSend()) return false;
    this.bs.s.push({ data, plugin });
    this.plSys.lifecycle.send.emit(data);
    return true;
  }

  public sendForward(data: T, plugin?: unknown) {
    if (!this.canSend()) return false;
    this.bs.s.unshift({ data, plugin });
    this.plSys.lifecycle.send.emit(data);
    return true;
  }

  public startPlaying(flag?: Symbol) {
    if (this.playing()) return;
    this.plSys.lock();
    if (flag !== NO_EMIT) {
      this.plSys.lifecycle.start.emit();
    }
    const cb = () => {
      this.render();
      this.renderTimer = setTimeout(cb, this.options.interval);
    };
    cb();
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

  public render() {
    if (this.bs.s.length === 0 || !this.playing()) return;
    const { rowGap, limit, forceRender } = this.options;
    const { rows } = this.exerciser;
    const { stash, display } = this.n();
    let l = limit - display;

    if (rowGap > 0 && l > rows) {
      l = rows;
    }
    if (forceRender || l > stash) {
      l = stash;
    }
    if (l === 0) return;
    this.plSys.lifecycle.render.emit();

    timeSlice(l, () => {
      const b = this.bs.s.shift();
      if (!b) return;
      const trackData = this.exerciser.getTrackData();
      if (!trackData) {
        this.bs.s.unshift(b);
        return false; // stop
      }
      const { prevent } = this.plSys.lifecycle.willRender.emit({
        value: b,
        prevent: false,
      });
      if (prevent === true) return;
      this.fire(b, trackData);
    });
  }

  private canSend() {
    const res = this.n().all >= this.options.capacity;
    if (res) {
      console.warn(
        "The number of danmu exceeds the limit." + `(${this.options.capacity})`,
      );
      this.plSys.lifecycle.capacityWarning.emit();
    }
    return res;
  }

  private create(data: BarrageData<T>) {
    const {
      direction,
      times: [max, min],
    } = this.options;
    const t = Number(
      max === min ? max : (Math.random() * (max - min) + min).toFixed(0),
    );
    if (t <= 0) return null;
    return new SimpleBarrage({
      direction,
      box: this.exerciser.box,
      defaultStatus: this.viewStatus,
      delInTrack: (b) => this.bs.d.delete(b),
    });
  }

  private fire(data: BarrageData<T> | SimpleBarrage, trackData: TrackData) {
    const b = data instanceof SimpleBarrage ? data : this.create(data);
    if (!b) return;
    b.createNode();
    b.appendToContainer(this.options.container);
    b.trackData = trackData;
    b.position.y = trackData.gaps[0];
    this.bs.d.add(b);
    this.exerciser.emit(b).then((isStash) => {
      if (isStash) {
        this.bs.s.unshift(b);
      } else {
        b.destroy();
        if (this.n().all === 0) {
          this.plSys.lifecycle.finished.emit();
        }
      }
    });
  }
}
