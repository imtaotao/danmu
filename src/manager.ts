import { Exerciser } from "./exerciser";
import { createManagerLifeCycle } from "./lifeCycle";
import { SimpleBarrage } from "./barrages/simple";
import { ComplicatedBarrage } from "./barrages/complicated";
import { NO_EMIT, hasOwn, createId, loopSlice, assert } from "./utils";
import type {
  TrackData,
  Direction,
  ViewStatus,
  BarrageData,
  EachCallback,
  FilterCallback,
  ManagerPlugin,
  BarragePlugin,
} from "./types";

export interface ManagerOptions {
  limit: number;
  height: number;
  rowGap: number;
  capacity: number;
  interval: number;
  times: [number, number];
  forceRender: boolean;
  direction: Direction;
  container: HTMLElement;
}

export class Manager<T extends unknown> {
  public version = __VERSION__;
  private exerciser: Exerciser<T>;
  private viewStatus: ViewStatus = "show";
  private renderTimer: number | null = null;
  private plSys = createManagerLifeCycle<T>(this);
  private bs = {
    show: new Set<SimpleBarrage<T>>(),
    complex: new Set<ComplicatedBarrage<unknown>>(),
    stash: [] as Array<BarrageData<T> | SimpleBarrage<T>>,
  };

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
    const { stash, show, complex } = this.bs;
    return {
      stash: stash.length,
      complex: complex.size,
      display: show.size + complex.size,
      all: show.size + complex.size + stash.length,
    };
  }

  public getContainer() {
    return this.exerciser.box;
  }

  public format() {
    this.exerciser.format();
    this.plSys.lifecycle.resize.emit();
  }

  public clear() {
    this.stopPlaying();
    this.each((b) => b.removeFromContainer());
    this.bs.show.clear();
    this.bs.complex.clear();
    this.bs.stash.length = 0;
    this.format();
    this.plSys.lifecycle.clear.emit();
  }

  public each(fn: EachCallback<T>) {
    for (const item of this.bs.complex) {
      if (fn(item) === false) return;
    }
    for (const item of this.bs.show) {
      if (fn(item) === false) return;
    }
  }

  public asyncEach(fn: EachCallback<T>) {
    let stop = false;
    const arr = Array.from(this.bs.complex);
    return loopSlice(arr.length, (i) => {
      if (fn(arr[i]) === false) {
        stop = true;
        return false;
      }
    }).then(() => {
      if (stop) return;
      const arr = Array.from(this.bs.show);
      return loopSlice(arr.length, (i) => fn(arr[i]));
    });
  }

  public usePlugin(plugin: ManagerPlugin<T>) {
    plugin.name = plugin.name || `runtime_plugin_${createId()}`;
    this.plSys.use(plugin as ManagerPlugin<T> & { name: string });
  }

  public updateOptions(newOptions: Partial<ManagerOptions>) {
    this.exerciser.updateOptions(newOptions);
    this.options = Object.assign(this.options, newOptions);

    if (hasOwn(newOptions, "interval")) {
      this.stopPlaying(NO_EMIT);
      this.startPlaying(NO_EMIT);
    }
    this.plSys.lifecycle.updateOptions.emit(this.options);
  }

  public show(filter?: FilterCallback<T>) {
    return this.changeViewStatus("show", filter);
  }

  public hide(filter?: FilterCallback<T>) {
    return this.changeViewStatus("hide", filter);
  }

  public send(data: T, plugin?: BarragePlugin) {
    if (!this.canSend()) return false;
    this.bs.stash.push({ data, plugin });
    this.plSys.lifecycle.send.emit(data);
    return true;
  }

  public sendForward(data: T, plugin?: BarragePlugin) {
    if (!this.canSend()) return false;
    this.bs.stash.unshift({ data, plugin });
    this.plSys.lifecycle.send.emit(data);
    return true;
  }

  public startPlaying(_flag?: Symbol) {
    if (this.playing()) return;
    if (!this.exerciser.box) {
      this.exerciser.format();
    }
    this.plSys.lock();
    if (_flag !== NO_EMIT) {
      this.plSys.lifecycle.start.emit();
    }
    const cb = () => {
      this.render();
      this.renderTimer = setTimeout(cb, this.options.interval);
    };
    cb();
  }

  public stopPlaying(_flag?: Symbol) {
    if (!this.playing()) return;
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
    }
    this.renderTimer = null;
    if (_flag !== NO_EMIT) {
      this.plSys.lifecycle.stop.emit();
    }
    this.plSys.unlock();
  }

  public render() {
    if (this.bs.stash.length === 0 || !this.playing()) return;
    const { rows } = this.exerciser;
    const { stash, display } = this.n();
    const { rowGap, limit, forceRender } = this.options;
    let l = limit - display;

    if (rowGap > 0 && l > rows) {
      l = rows;
    }
    if (forceRender || l > stash) {
      l = stash;
    }
    if (l === 0) return;
    this.plSys.lifecycle.render.emit();

    loopSlice(l, () => {
      const b = this.bs.stash.shift();
      if (!b) return;
      const trackData = this.exerciser.getTrackData();
      if (!trackData) {
        this.bs.stash.unshift(b);
        return false;
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

  private changeViewStatus(status: ViewStatus, filter?: FilterCallback<T>) {
    return new Promise<void>((resolve) => {
      if (this.viewStatus === status) {
        resolve();
        return;
      }
      this.viewStatus = status;
      this.asyncEach((b) => {
        if (this.viewStatus === status) {
          if (!filter || filter(b) !== true) {
            b[status]();
          }
        } else {
          return false;
        }
      }).then(resolve);
    });
  }

  private create({ data, plugin }: BarrageData<T>) {
    const {
      direction,
      times: [max, min],
    } = this.options;
    const t = Number(
      max === min ? max : (Math.random() * (max - min) + min).toFixed(0),
    );
    if (t <= 0) return null;
    assert(this.exerciser.box, "Container not formatted");
    return new SimpleBarrage({
      data,
      plugin,
      direction,
      box: this.exerciser.box,
      defaultStatus: this.viewStatus,
      delInTrack: (b) => this.bs.show.delete(b),
    });
  }

  private fire(
    data: BarrageData<T> | SimpleBarrage<T>,
    trackData: TrackData<T>,
  ) {
    const b = data instanceof SimpleBarrage ? data : this.create(data);
    if (!b) return;
    b.createNode();
    b.appendToContainer(this.options.container);
    b.trackData = trackData;
    b.position.y = trackData.gaps[0];
    this.bs.show.add(b);
    this.exerciser.emit(b).then((isStash) => {
      if (isStash) {
        this.bs.show.delete(b);
        this.bs.stash.unshift(b);
      } else {
        b.destroy();
        if (this.n().all === 0) {
          this.plSys.lifecycle.finished.emit();
        }
      }
    });
  }
}
