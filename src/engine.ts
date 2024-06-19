import { Queue } from 'small-queue';
import { assert, hasOwn, remove, loopSlice, isInBounds } from 'aidly';
import { Box } from './box';
import { nextFrame } from './utils';
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
  RunOptions,
  RenderOptions,
  PushFlexOptions,
} from './types';

export interface EngineOptions {
  mode: Mode;
  gap: number;
  height: number;
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

  public constructor(public options: EngineOptions) {}

  public n() {
    const { stash, view, flexible } = this._sets;
    return {
      stash: stash.length,
      flexible: flexible.size,
      view: view.size + flexible.size,
      all: view.size + flexible.size + stash.length,
    };
  }

  public add(data: T, plugin?: BarragePlugin<T>, isPush?: boolean) {
    this._sets.stash[isPush ? 'push' : 'unshift']({ data, plugin });
  }

  public updateOptions(newOptions: Partial<EngineOptions>) {
    this.options = Object.assign(this.options, newOptions);
    if (hasOwn(newOptions, 'height') || hasOwn(newOptions, 'container')) {
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
    const { height } = this.options;
    this.box.format();
    this.rows = +(this.box.height / height).toFixed(0);

    for (let i = 0; i < this.rows; i++) {
      const location = [
        height * i, // start
        height * (i + 1) - 1, // end
      ] as [number, number];

      if (this._tracks[i]) {
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
    hooks.render.call(null, 'flexible');
    const { prevent } = hooks.willRender.call(null, {
      value: data,
      prevent: false,
      type: 'flexible',
    });
    if (prevent === true) return;
    assert(this.box, 'Container not formatted');
    const b = this._create('flexible', data, viewStatus, {
      position,
      duration,
      direction,
    });
    if (plugin) b.use(plugin);
    b.use(bridgePlugin);

    const setup = () => {
      b.createNode();
      b.appendNode(this.box.el);
      this._sets.view.add(b);
      this._setAction(b).then(() => {
        if (b.isLoop) {
          b.setStartStatus();
          setup();
        } else {
          b.destroy();
          if (this.n().all === 0) {
            hooks.finished.call(null);
          }
        }
      });
    };
    setup();
  }

  public render({ hooks, viewStatus, bridgePlugin }: RenderOptions<T>) {
    const { mode, limits } = this.options;

    const go = () => {
      const n = this.n();
      let l = n.stash;
      if (typeof limits.view === 'number') {
        const max = limits.view - n.view;
        if (l > max) l = max;
      }
      if (mode === 'strict' && l > this.rows) {
        l = this.rows;
      }
      if (l <= 0) return;

      hooks.render.call(null, 'facile');

      return loopSlice(l, () => {
        const b = this._sets.stash.shift();
        if (!b) return;
        const { prevent } = hooks.willRender.call(null, {
          value: b.data,
          prevent: false,
          type: 'facile',
        });
        if (prevent === true) return;
        return this._run({
          hooks,
          layer: b,
          viewStatus,
          bridgePlugin,
        });
      });
    };
    if (mode === 'strict') {
      this._fx.add((next) => {
        const p = go();
        p ? p.then(next) : next();
      });
    } else {
      go();
    }
  }

  private _run({ layer, hooks, viewStatus, bridgePlugin }: RunOptions<T>) {
    const trackData = this._getTrackData();
    if (!trackData) {
      this._sets.stash.unshift(layer);
      return false;
    }
    const b =
      layer instanceof FacileBarrage
        ? layer
        : this._create('facile', layer.data, viewStatus);

    const onReset = () => {
      b.reset();
      this._sets.view.delete(b);
      this._sets.stash.unshift(b);
    };
    const onEnd = () => {
      if (b.isLoop) {
        b.setStartStatus();
        remove(trackData.list, b);
        setup();
      } else {
        b.destroy();
        if (this.n().all === 0) {
          hooks.finished.call(null);
        }
      }
    };
    const setup = () => {
      b.updatePosition({ y: trackData.location[0] });
      b.updateTrackData(trackData);
      b.createNode();
      b.appendNode(this.box.el);
      this._sets.view.add(b);
      this._setAction(b, onReset).then(onEnd);
    };

    if ((layer as StashData<T>).plugin) {
      b.use((layer as StashData<T>).plugin!);
    }
    b.use(bridgePlugin);
    setup();
    return true;
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
      if (b && !b.paused && b.type === 'facile') {
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
  ): TrackData<T> | null | undefined {
    const { gap, mode } = this.options;
    if (founds.size === this._tracks.length) {
      return mode === 'adaptive' ? prev : null;
    }
    const i = this._selectTrackIdx(founds);
    const trackData = this._tracks[i];
    if (mode === 'none') return trackData;
    const last = this._last(trackData.list, 0);
    if (!last || last.getMoveDistance() >= gap + last.getWidth()) {
      return trackData;
    }
    founds.add(i);
    return this._getTrackData(founds, trackData);
  }

  private _setAction(cur: Barrage<T>, stash?: () => void) {
    return new Promise<void>((resolve) => {
      nextFrame(() => {
        const { mode, times } = this.options;
        if (mode !== 'none' && cur.type === 'facile') {
          assert(cur.trackData);
          const prev = this._last(cur.trackData.list, 1);
          if (prev) {
            const fixTime = this._collisionPrediction(prev, cur);
            if (fixTime !== null) {
              if (isInBounds(times, fixTime)) {
                cur.fixDuration(fixTime);
              } else if (mode === 'strict') {
                stash && stash(); // Must be synchronous behavior
                resolve();
                return;
              }
            }
          }
        }
        cur.setOff().then(resolve);
      });
    });
  }

  private _collisionPrediction(prv: FacileBarrage<T>, cur: FacileBarrage<T>) {
    const cs = cur.getSpeed();
    const ps = prv.getSpeed();
    const acceleration = cs - ps;
    if (acceleration <= 0) return null;

    const cw = cur.getWidth();
    const pw = prv.getWidth();
    const { gap } = this.options;
    const distance = prv.getMoveDistance() - cw - pw - gap;
    const collisionTime = distance / acceleration;
    if (collisionTime >= cur.duration) return null;

    assert(this.box, 'Container not formatted');
    const remainingTime = (1 - prv.getMovePercent()) * prv.duration;
    const currentFixTime = ((cw + gap) * remainingTime) / this.box.width;
    return remainingTime + currentFixTime;
  }
}
