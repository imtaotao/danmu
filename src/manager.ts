import { Exerciser } from './exerciser';
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
  private _exerciser: Exerciser<T>;
  private _viewStatus: ViewStatus = 'show';
  private _renderTimer: number | null = null;
  private _rendering: Promise<void> | null = null;
  private _plSys = createManagerLifeCycle<T>();
  private _sets = {
    show: new Set<FacileBarrage<T>>(),
    complex: new Set<FlexibleBarrage<unknown>>(),
    stash: [] as Array<BarrageData<T> | FacileBarrage<T>>,
  };

  public constructor(public options: ManagerOptions) {
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
    const { stash, show, complex } = this._sets;
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
    this._exerciser.updateOptions(newOptions);
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
    if (!this._exerciser.box) {
      this._exerciser.format();
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

    this._rendering = loopSlice(l, () => {
      const b = this._sets.stash.shift();
      if (!b) return;
      const trackData = this._exerciser.getTrackData();
      if (!trackData) {
        this._sets.stash.unshift(b);
        return false;
      }
      const { prevent } = this._plSys.lifecycle.willRender.emit({
        value: b.data,
        prevent: false,
      });
      if (prevent === true) return;
      this._fire(b, trackData);
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

  private _create({ data, plugin }: BarrageData<T>) {
    const {
      direction,
      times: [min, max],
    } = this.options;
    const t = Number(
      max === min ? max : (Math.random() * (max - min) + min).toFixed(0),
    );
    if (t <= 0) return null;
    assert(this._exerciser.box, 'Container not formatted');
    const b = new FacileBarrage({
      data,
      direction,
      duration: t,
      box: this._exerciser.box,
      defaultStatus: this._viewStatus,
      delInTrack: (b) => this._sets.show.delete(b),
    });
    if (plugin) b.use(plugin);
    b.use(createBridgePlugin<T>(this._plSys));
    return b;
  }

  private _fire(
    data: BarrageData<T> | FacileBarrage<T>,
    trackData: TrackData<T>,
  ) {
    const b = data instanceof FacileBarrage ? data : this._create(data);
    if (!b) return;

    b.createNode();
    b.appendNode(this.options.container);
    b.updateTrackData(trackData);
    b.position.y = trackData.gaps[0];
    b.setStyle('top', `${b.position.y}px`);
    this._sets.show.add(b);

    this._exerciser.run(b).then((isStash) => {
      if (isStash) {
        b.reset();
        b.setStyle('top', '');
        this._sets.show.delete(b);
        this._sets.stash.unshift(b);
      } else {
        b.destroy();
        if (this.n().all === 0) {
          this._plSys.lifecycle.finished.emit();
        }
      }
    });
  }
}
