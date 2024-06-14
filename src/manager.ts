import { Engine } from './engine';
import { FacileBarrage } from './barrages/facile';
import { FlexibleBarrage } from './barrages/flexible';
import { NO_EMIT, hasOwn, createId, loopSlice, assert } from './utils';
import { createBridgePlugin, createManagerLifeCycle } from './lifeCycle';
import type {
  TrackData,
  Direction,
  ViewStatus,
  BarrageData,
  EachCallback,
  FilterCallback,
  FacilePlugin,
  ManagerPlugin,
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
  private _engine: Engine<T>;
  private _viewStatus: ViewStatus = 'show';
  private _renderTimer: number | null = null;
  private _rendering: Promise<void> | null = null;
  private _plSys = createManagerLifeCycle<T>();

  public constructor(public options: ManagerOptions) {
    this._engine = new Engine({
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
    const { stash, show, complex } = this._sets;
    return {
      stash: stash.length,
      complex: complex.size,
      display: show.size + complex.size,
      all: show.size + complex.size + stash.length,
    };
  }

  public getContainer() {
    return this._engine.box;
  }

  public format() {
    this._engine.format();
    this._plSys.lifecycle.resize.emit();
  }

  public clear() {
    this.stopPlaying();
    this.each((b) => b.removeNode());
    this._sets.show.clear();
    this._sets.complex.clear();
    this._sets.stash.length = 0;
    this.format();
    this._plSys.lifecycle.clear.emit();
  }

  public each(fn: EachCallback<T>) {
    for (const item of this._sets.complex) {
      if (fn(item) === false) return;
    }
    for (const item of this._sets.show) {
      if (fn(item) === false) return;
    }
  }

  public asyncEach(fn: EachCallback<T>) {
    let stop = false;
    const arr = Array.from(this._sets.complex);
    return loopSlice(arr.length, (i) => {
      if (fn(arr[i]) === false) {
        stop = true;
        return false;
      }
    }).then(() => {
      if (stop) return;
      const arr = Array.from(this._sets.show);
      return loopSlice(arr.length, (i) => fn(arr[i]));
    });
  }

  public usePlugin(plugin: ManagerPlugin<T>) {
    plugin.name = plugin.name || `__runtime_plugin_${createId()}__`;
    this._plSys.use(plugin as ManagerPlugin<T> & { name: string });
  }

  public updateOptions(newOptions: Partial<ManagerOptions>) {
    this._engine.updateOptions(newOptions);
    this.options = Object.assign(this.options, newOptions);

    if (hasOwn(newOptions, 'interval')) {
      this.stopPlaying(NO_EMIT);
      this.startPlaying(NO_EMIT);
    }
    this._plSys.lifecycle.updateOptions.emit(this.options);
  }

  public show(filter?: FilterCallback<T>) {
    return this._changeViewStatus('show', filter);
  }

  public hide(filter?: FilterCallback<T>) {
    return this._changeViewStatus('hide', filter);
  }

  public push(data: T, plugin?: FacilePlugin<T>) {
    if (!this._canSend()) return false;
    this._sets.stash.push({ data, plugin });
    this._plSys.lifecycle.push.emit(data, true);
    return true;
  }

  public unshift(data: T, plugin?: FacilePlugin<T>) {
    if (!this._canSend()) return false;
    this._sets.stash.unshift({ data, plugin });
    this._plSys.lifecycle.push.emit(data, false);
    return true;
  }

  public startPlaying(_flag?: Symbol) {
    if (this.playing()) return;
    if (!this._engine.box) {
      this._engine.format();
    }
    this._plSys.lock();
    if (_flag !== NO_EMIT) {
      this._plSys.lifecycle.start.emit();
    }
    const cycle = () => {
      this._renderTimer = setTimeout(cycle, this.options.interval);
      this.render();
    };
    cycle();
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
    if (this._sets.stash.length === 0 || !this.playing()) return;
    const { rows } = this._engine;
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

    this._rendering = loopSlice(l, () => {
      const b = this._sets.stash.shift();
      if (!b) return;
      const trackData = this._engine.getTrackData();
      if (!trackData) {
        this._sets.stash.unshift(b);
        return false;
      }
      const { prevent } = this._plSys.lifecycle.willRender.emit({
        value: b.data,
        prevent: false,
      });
      if (prevent === true) return;
      this._engine.fire(b, trackData);
    });
    this._rendering.finally(() => (this._rendering = null));
  }

  private _canSend() {
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

  private _changeViewStatus(status: ViewStatus, filter?: FilterCallback<T>) {
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
}
