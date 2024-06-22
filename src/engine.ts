import { Queue } from 'small-queue';
import {
  assert,
  hasOwn,
  remove,
  toUpperCase,
  loopSlice,
  isInBounds,
} from 'aidly';
import { Box } from './box';
import { toNumber, nextFrame } from './utils';
import { FacileBarrage } from './barrages/facile';
import { FlexibleBarrage } from './barrages/flexible';
import type {
  Mode,
  TrackData,
  StashData,
  Direction,
  ViewStatus,
  EachCallback,
  Barrage,
  BarrageType,
  BarragePlugin,
  RenderOptions,
  PushFlexOptions,
} from './types';

export interface EngineOptions {
  mode: Mode;
  gap: number | string;
  trackHeight: number | string;
  times: [number, number];
  direction: Omit<Direction, 'none'>;
  limits: {
    stash: number;
    view?: number;
  };
}

export class Engine<T> {
  public rows = 0;
  public box = new Box();
  private _fx = new Queue();
  private _tracks = [] as Array<TrackData<T>>;
  private _sets = {
    view: new Set<FacileBarrage<T>>(),
    flexible: new Set<FlexibleBarrage<T>>(),
    stash: [] as Array<StashData<T> | FacileBarrage<T>>,
  };

  public constructor(public options: EngineOptions) {
    this.options.gap = this._n('width', this.options.gap);
  }

  public len() {
    const { stash, view, flexible } = this._sets;
    return {
      stash: stash.length,
      flexible: flexible.size,
      view: view.size + flexible.size,
      all: view.size + flexible.size + stash.length,
    };
  }

  public add(
    data: T | FacileBarrage<T>,
    plugin?: BarragePlugin<T>,
    isPush?: boolean,
  ) {
    const val = data instanceof FacileBarrage ? data : { data, plugin };
    this._sets.stash[isPush ? 'push' : 'unshift'](val);
  }

  public updateOptions(newOptions: Partial<EngineOptions>) {
    this.options = Object.assign(this.options, newOptions);
    if (hasOwn(newOptions, 'gap')) {
      this.options.gap = this._n('width', this.options.gap);
    }
    if (hasOwn(newOptions, 'trackHeight') || hasOwn(newOptions, 'container')) {
      this.format();
    }
  }

  public clear() {
    this._sets.view.clear();
    this._sets.flexible.clear();
    this._sets.stash.length = 0;
    this.format();
  }

  public each(fn: EachCallback<T>) {
    for (const item of this._sets.flexible) {
      if (fn(item) === false) return;
    }
    for (const item of this._sets.view) {
      if (fn(item) === false) return;
    }
  }

  public asyncEach(fn: EachCallback<T>) {
    let stop = false;
    const arr = Array.from(this._sets.flexible);
    return loopSlice(
      arr.length,
      (i) => {
        if (fn(arr[i]) === false) {
          stop = true;
          return false;
        }
      },
      17,
    ).then(() => {
      if (stop) return;
      const arr = Array.from(this._sets.view);
      return loopSlice(arr.length, (i) => fn(arr[i]), 17);
    });
  }

  public format() {
    // Need to format the container first
    this.box.format();
    const h = this._n('height', this.options.trackHeight);
    const rows = (this.rows = +(this.box.height / h).toFixed(0));

    for (let i = 0; i < rows; i++) {
      const s = h * i;
      const e = h * (i + 1) - 1;
      const m = (e - s) / 2 + s;
      const location = [s, m, e] as [number, number, number];

      if (location[1] > this.box.height) {
        this.rows--;
        if (this._tracks[i]) {
          this._tracks.splice(i, 1);
        }
      } else if (this._tracks[i]) {
        this._tracks[i].location = location;
      } else {
        this._tracks.push({
          location,
          list: [],
        });
      }
    }
  }

  public renderFlexBarrage(
    data: T,
    {
      hooks,
      position,
      duration,
      direction,
      viewStatus,
      plugin,
      bridgePlugin,
    }: RenderOptions<T> & PushFlexOptions<T>,
  ) {
    assert(this.box, 'Container not formatted');
    hooks.render.call(null, 'flexible');
    const b = this._create('flexible', data, viewStatus, {
      position,
      duration,
      direction,
    });
    if (plugin) b.use(plugin);
    b.use(bridgePlugin);

    const { prevent } = hooks.willRender.call(null, {
      barrage: b,
      prevent: false,
      type: 'flexible',
    });
    if (prevent === true) return;

    const setup = () => {
      b.createNode();
      this._sets.view.add(b);
      this._setAction(b).then(() => {
        if (b.isLoop) {
          b.loops++;
          b.setStartStatus();
          setup();
          return;
        }
        b.destroy();
        if (this.len().all === 0) {
          hooks.finished.call(null);
        }
      });
    };
    setup();
  }

  public render({ hooks, viewStatus, bridgePlugin }: RenderOptions<T>) {
    const { mode, limits } = this.options;

    const launch = () => {
      const num = this.len();
      let l = num.stash;
      if (typeof limits.view === 'number') {
        const max = limits.view - num.view;
        if (l > max) l = max;
      }
      if (mode === 'strict' && l > this.rows) {
        l = this.rows;
      }
      if (l <= 0) return;
      hooks.render.call(null, 'facile');
      return loopSlice(l, () => this._consume(viewStatus, bridgePlugin, hooks));
    };

    if (mode === 'strict') {
      this._fx.add((next) => {
        const p = launch();
        p ? p.then(next) : next();
      });
    } else {
      launch();
    }
  }

  private _consume(
    viewStatus: ViewStatus,
    bridgePlugin: BarragePlugin<T>,
    hooks: RenderOptions<T>['hooks'],
  ) {
    let b: FacileBarrage<T>;
    const layer = this._sets.stash.shift();
    if (!layer) return;
    const trackData = this._getTrackData();
    if (!trackData) {
      this._sets.stash.unshift(layer);
      return false;
    }

    if (layer instanceof FacileBarrage) {
      b = layer;
    } else {
      b = this._create('facile', layer.data, viewStatus);
      if (layer.plugin) b.use(layer.plugin);
      b.use(bridgePlugin);
    }
    const { prevent } = hooks.willRender.call(null, {
      barrage: b,
      prevent: false,
      type: 'facile',
    });

    if (prevent !== true) {
      // First createNode, users may add styles
      b.createNode();
      b.appendNode(this.box.el);
      b.updateTrackData(trackData);
      b.updatePosition({ y: trackData.location[1] - b.getHeight() / 2 });
      this._sets.view.add(b);

      const setup = () => {
        this._setAction(b).then((isStash) => {
          if (isStash) {
            b.reset();
            this._sets.view.delete(b);
            this._sets.stash.unshift(b);
            return;
          }
          if (b.isLoop) {
            b.loops++;
            b.setStartStatus();
            setup();
            return;
          }
          b.destroy();
          if (this.len().all === 0) {
            hooks.finished.call(null);
          }
        });
      };
      setup();
    }
  }

  private _setAction(cur: Barrage<T>) {
    return new Promise<boolean>((resolve) => {
      nextFrame(() => {
        assert(cur.trackData);
        const { mode, times } = this.options;

        if (mode !== 'none' && cur.type === 'facile') {
          const prev = this._last(cur.trackData.list, 1);
          if (prev && cur.loops === 0) {
            const fixTime = this._collisionPrediction(prev, cur);
            if (fixTime !== null) {
              if (isInBounds(times, fixTime)) {
                cur.fixDuration(fixTime);
              } else if (mode === 'strict') {
                resolve(true);
                return;
              }
            }
          }
        }
        cur.appendNode(this.box.el);
        cur.setOff().then(() => resolve(false));
      });
    });
  }

  private _create(
    type: BarrageType,
    data: T,
    viewStatus: ViewStatus,
    options?: Omit<PushFlexOptions<T>, 'plugin'>,
  ) {
    assert(this.box, 'Container not formatted');
    let b: Barrage<T>;
    const config = {
      data,
      duration: 0,
      box: this.box,
      defaultStatus: viewStatus,
      direction: this.options.direction as Direction,
      delInTrack: (b: Barrage<T>) => {
        remove(this._sets.view, b);
        type === 'facile'
          ? remove(this._sets.stash, b)
          : remove(this._sets.flexible, b);
      },
    };

    if (type === 'facile') {
      config.duration = this._randomDuration();
      b = new FacileBarrage(config);
    } else {
      assert(options);
      const duration =
        typeof options.duration === 'number'
          ? options.duration
          : this._randomDuration();
      const position =
        typeof options.position === 'function'
          ? options.position(this.box)
          : options.position;
      b = new FlexibleBarrage({
        ...config,
        position,
        duration,
        direction: options.direction,
      });
    }
    return b;
  }

  private _n(type: 'height' | 'width', val: number | string) {
    let n = NaN;
    if (typeof val === 'number') {
      n = val;
    } else if (typeof val === 'string') {
      n = val.endsWith('%')
        ? this.box[type] * (toNumber(val) / 100)
        : toNumber(val);
    }
    assert(n && !Number.isNaN(n), `Invalid "${val}"`);
    assert(
      n <= this.box.height,
      `"${n} > container${toUpperCase(type)}:${
        this.box.height
      }px" is not allowed`,
    );
    return n;
  }

  private _randomDuration() {
    const {
      times: [min, max],
    } = this.options;
    const d = Number(
      max === min ? max : (Math.random() * (max - min) + min).toFixed(0),
    );
    assert(d > 0, `Invalid move time "${d}"`);
    return d;
  }

  private _last(ls: Array<FacileBarrage<T>>, li: number) {
    for (let i = ls.length - 1; i >= 0; i--) {
      const b = ls[i - li];
      if (b && !b.paused && b.loops === 0 && b.type === 'facile') {
        return b;
      }
    }
    return null;
  }

  private _selectTrackIdx(founds: Set<number>): number {
    const idx = Math.floor(Math.random() * this.rows);
    return founds.has(idx) ? this._selectTrackIdx(founds) : idx;
  }

  private _getTrackData(
    founds = new Set<number>(),
    prev?: TrackData<T>,
  ): TrackData<T> | null {
    const { gap, mode } = this.options;
    if (founds.size === this._tracks.length) {
      return mode === 'adaptive' ? prev! : null;
    }
    const i = this._selectTrackIdx(founds);
    const trackData = this._tracks[i];
    if (mode === 'none') return trackData;
    const last = this._last(trackData.list, 0);
    if (!last || last.getMoveDistance() >= (gap as number) + last.getWidth()) {
      return trackData;
    }
    founds.add(i);
    return this._getTrackData(founds, trackData);
  }

  private _collisionPrediction(prv: FacileBarrage<T>, cur: FacileBarrage<T>) {
    const cs = cur.getSpeed();
    const ps = prv.getSpeed();
    const acceleration = cs - ps;
    if (acceleration <= 0) return null;

    const cw = cur.getWidth();
    const pw = prv.getWidth();
    const { gap } = this.options;
    const distance = prv.getMoveDistance() - cw - pw - (gap as number);
    const collisionTime = distance / acceleration;
    if (collisionTime >= cur.duration) return null;

    assert(this.box, 'Container not formatted');
    const remainingTime = (1 - prv.getMovePercent()) * prv.duration;
    const currentFixTime =
      ((cw + (gap as number)) * remainingTime) / this.box.width;
    return remainingTime + currentFixTime;
  }
}
