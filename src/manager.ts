import { Exerciser } from './exerciser';
import { createBridgePlugin, createManagerLifeCycle } from './lifeCycle';
import { SimpleBarrage } from './barrages/simple';
import { ComplicatedBarrage } from './barrages/complicated';
import { NO_EMIT, hasOwn, createId, loopSlice, assert } from './utils';
import type {
  TrackData,
  Direction,
  ViewStatus,
  BarrageData,
  EachCallback,
  FilterCallback,
  ManagerPlugin,
  SimpleBarragePlugin,
} from './types';

export interface ManagerOptions {
  height: number;
  rowGap: number;
  viewLimit: number;
  memoryLimit: number;
  interval: number;
  times: [number, number];
  forceRender: boolean;
  direction: Direction;
  container: HTMLElement;
}

export class Manager<T extends unknown> {
  public version = __VERSION__;
  private _exerciser: Exerciser<T>;
  private _viewStatus: ViewStatus = 'show';
  private _renderTimer: number | null = null;
  private _plSys = createManagerLifeCycle<T>();
  private _bs = {
    show: new Set<SimpleBarrage<T>>(),
    complex: new Set<ComplicatedBarrage<unknown>>(),
    stash: [] as Array<BarrageData<T> | SimpleBarrage<T>>,
  };

  public constructor(private options: ManagerOptions) {
    this._exerciser = new Exerciser({
      times: options.times,
      rowGap: options.rowGap,
      height: options.height,
      container: options.container,
      forceRender: options.forceRender,
    });
  }

  public playing() {
    return this._renderTimer !== null;
  }

  public n() {
    const { stash, show, complex } = this._bs;
    return {
      stash: stash.length,
      complex: complex.size,
      display: show.size + complex.size,
      all: show.size + complex.size + stash.length,
    };
  }

  public getContainer() {
    return this._exerciser.box;
  }

  public format() {
    this._exerciser.format();
    this._plSys.lifecycle.resize.emit();
  }

  public clear() {
    this.stopPlaying();
    this.each((b) => b.removeNode());
    this._bs.show.clear();
    this._bs.complex.clear();
    this._bs.stash.length = 0;
    this.format();
    this._plSys.lifecycle.clear.emit();
  }

  public each(fn: EachCallback<T>) {
    for (const item of this._bs.complex) {
      if (fn(item) === false) return;
    }
    for (const item of this._bs.show) {
      if (fn(item) === false) return;
    }
  }

  public asyncEach(fn: EachCallback<T>) {
    let stop = false;
    const arr = Array.from(this._bs.complex);
    return loopSlice(arr.length, (i) => {
      if (fn(arr[i]) === false) {
        stop = true;
        return false;
      }
    }).then(() => {
      if (stop) return;
      const arr = Array.from(this._bs.show);
      return loopSlice(arr.length, (i) => fn(arr[i]));
    });
  }

  public usePlugin(plugin: ManagerPlugin<T>) {
    plugin.name = plugin.name || `__runtime_plugin_${createId()}__`;
    this._plSys.use(plugin as ManagerPlugin<T> & { name: string });
  }

  public updateOptions(newOptions: Partial<ManagerOptions>) {
    this._exerciser.updateOptions(newOptions);
    this.options = Object.assign(this.options, newOptions);

    if (hasOwn(newOptions, 'interval')) {
      this.stopPlaying(NO_EMIT);
      this.startPlaying(NO_EMIT);
    }
    this._plSys.lifecycle.updateOptions.emit(this.options);
  }

  public show(filter?: FilterCallback<T>) {
    return this.changeViewStatus('show', filter);
  }

  public hide(filter?: FilterCallback<T>) {
    return this.changeViewStatus('hide', filter);
  }

  public push(data: T, plugin?: SimpleBarragePlugin<T>) {
    if (!this.canSend()) return false;
    this._bs.stash.push({ data, plugin });
    this._plSys.lifecycle.push.emit(data, true);
    return true;
  }

  public unshift(data: T, plugin?: SimpleBarragePlugin<T>) {
    if (!this.canSend()) return false;
    this._bs.stash.unshift({ data, plugin });
    this._plSys.lifecycle.push.emit(data, false);
    return true;
  }

  public startPlaying(_flag?: Symbol) {
    if (this.playing()) return;
    if (!this._exerciser.box) {
      this._exerciser.format();
    }
    this._plSys.lock();
    if (_flag !== NO_EMIT) {
      this._plSys.lifecycle.start.emit();
    }
    const cb = () => {
      this._renderTimer = setTimeout(cb, this.options.interval);
      this.render();
    };
    cb();
  }

  public stopPlaying(_flag?: Symbol) {
    if (!this.playing()) return;
    if (this._renderTimer) {
      clearTimeout(this._renderTimer);
    }
    this._renderTimer = null;
    if (_flag !== NO_EMIT) {
      this._plSys.lifecycle.stop.emit();
    }
    this._plSys.unlock();
  }

  public render() {
    if (this._bs.stash.length === 0 || !this.playing()) return;
    const { rows } = this._exerciser;
    const { stash, display } = this.n();
    const { rowGap, viewLimit, forceRender } = this.options;
    let l = viewLimit - display;

    if (rowGap > 0 && l > rows) {
      l = rows;
    }
    if (forceRender || l > stash) {
      l = stash;
    }
    if (l === 0) return;
    this._plSys.lifecycle.render.emit();

    loopSlice(l, () => {
      const b = this._bs.stash.shift();
      if (!b) return;
      const trackData = this._exerciser.getTrackData();
      if (!trackData) {
        this._bs.stash.unshift(b);
        return false;
      }
      const { prevent } = this._plSys.lifecycle.willRender.emit({
        value: b.data,
        prevent: false,
      });
      if (prevent === true) return;
      this.fire(b, trackData);
    });
  }

  private canSend() {
    const res = this.n().all >= this.options.memoryLimit;
    if (res) {
      console.warn(
        'The number of danmu in memory exceeds the limit.' +
          `(${this.options.memoryLimit})`,
      );
      this._plSys.lifecycle.capacityWarning.emit();
    }
    return !res;
  }

  private changeViewStatus(status: ViewStatus, filter?: FilterCallback<T>) {
    return new Promise<void>((resolve) => {
      if (this._viewStatus === status) {
        resolve();
        return;
      }
      this._viewStatus = status;
      this.asyncEach((b) => {
        if (this._viewStatus === status) {
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
    assert(this._exerciser.box, 'Container not formatted');
    const b = new SimpleBarrage({
      data,
      direction,
      duration: t,
      box: this._exerciser.box,
      defaultStatus: this._viewStatus,
      delInTrack: (b) => this._bs.show.delete(b),
    });
    if (plugin) b.use(plugin);
    b.use(createBridgePlugin<T>(this._plSys));
    return b;
  }

  private fire(
    data: BarrageData<T> | SimpleBarrage<T>,
    trackData: TrackData<T>,
  ) {
    const b = data instanceof SimpleBarrage ? data : this.create(data);
    if (!b) return;
    b.createNode();
    b.appendNode(this.options.container);
    b.updateTrackData(trackData);
    b.position.y = trackData.gaps[0];
    this._bs.show.add(b);
    this._exerciser.emit(b).then((isStash) => {
      if (isStash) {
        this._bs.show.delete(b);
        this._bs.stash.unshift(b);
      } else {
        b.destroy();
        if (this.n().all === 0) {
          this._plSys.lifecycle.finished.emit();
        }
      }
    });
  }
}