import {
  Queue,
  assert,
  hasOwn,
  remove,
  random,
  loopSlice,
  isInBounds,
} from 'aidly';
import { Box } from './box';
import { FacileBarrage } from './barrages/facile';
import { FlexibleBarrage, type FlexibleOptions } from './barrages/flexible';
import { toNumber, randomIdx, nextFrame } from './utils';
import type {
  Mode,
  PushData,
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

  public constructor(public options: EngineOptions) {}

  public n(attr: 'height' | 'width', val: number | string) {
    let n =
      typeof val === 'number'
        ? val
        : typeof val === 'string'
        ? val.endsWith('%')
          ? this.box[attr] * (toNumber(val) / 100)
          : toNumber(val)
        : NaN;
    if (n > this.box[attr]) n = this.box[attr];
    assert(!Number.isNaN(n), `Invalid "${n}: ${val}"`);
    return n;
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
    data: PushData<T> | FacileBarrage<T>,
    plugin?: BarragePlugin<T>,
    isUnshift?: boolean,
  ) {
    const val = data instanceof FacileBarrage ? data : { data, plugin };
    this._sets.stash[isUnshift ? 'unshift' : 'push'](val);
  }

  public updateOptions(newOptions: Partial<EngineOptions>) {
    this.options = Object.assign(this.options, newOptions);
    if (hasOwn(newOptions, 'gap')) {
      this.options.gap = this.n('width', this.options.gap);
    }
    if (hasOwn(newOptions, 'trackHeight')) {
      this.format();
    }
  }

  public clear() {
    this._sets.view.clear();
    this._sets.flexible.clear();
    this._sets.stash.length = 0;
  }

  // `flexible` and `view` are both xx,
  // so deleting some of them in the loop will not affect
  public each(fn: EachCallback<T>) {
    for (const item of this._sets.flexible) {
      if (fn(item) === false) return;
    }
    for (const item of this._sets.view) {
      if (fn(item) === false) return;
    }
  }

  // Because there are copies brought by `Array.from`,
  // deleting it in all loops will not affect
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
    const { gap, trackHeight } = this.options;
    this.options.gap = this.n('width', gap);
    const h = this.n('height', trackHeight);
    assert(h > 0, `Invalid trackHeight "${h}"`);
    const rows = (this.rows = +(this.box.height / h).toFixed(0));

    for (let i = 0; i < rows; i++) {
      const start = h * i;
      const end = h * (i + 1) - 1;
      const mid = (end - start) / 2 + start;
      const location = [start, mid, end] as [number, number, number];

      if (end > this.box.height) {
        this.rows--;
        if (this._tracks[i]) {
          this._tracks.splice(i, 1);
        }
      } else if (this._tracks[i]) {
        // If the reused track is larger than the container height,
        // the overflow needs to be deleted.
        if (this._tracks[i].location[2] > this.box.height) {
          this._clearTarck(i);
        }
        this._tracks[i].location = location;
      } else {
        this._tracks.push({
          location,
          list: [],
        });
      }
    }
    // Delete the extra tracks and the barrages inside
    if (this._tracks.length > this.rows) {
      for (let i = this.rows; i < this._tracks.length; i++) {
        this._clearTarck(i);
      }
      this._tracks.splice(this.rows, this._tracks.length - this.rows);
    }
    // If `flexible` barrage is also outside the view, it also needs to be deleted
    for (const b of this._sets.flexible) {
      if (b.position.y > this.box.height) {
        b.destroy();
      }
    }
  }

  public renderFlexibleBarrage(
    data: PushData<T>,
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
    if (b.position.x > this.box.width) return false;
    if (b.position.y > this.box.height) return false;
    if (plugin) b.use(plugin);
    b.use(bridgePlugin);

    const { prevent } = hooks.willRender.call(null, {
      barrage: b,
      prevent: false,
      type: 'flexible',
    });
    if (prevent === true) {
      return false;
    }

    const setup = () => {
      b.createNode();
      this._sets.flexible.add(b as FlexibleBarrage<T>);
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
    return true;
  }

  public renderFacileBarrage({
    hooks,
    viewStatus,
    bridgePlugin,
  }: RenderOptions<T>) {
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
      b.appendNode(this.box.node);
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
        const { mode, times } = this.options;
        if (mode !== 'none' && cur.type === 'facile') {
          assert(cur.trackData, 'Barrage missing "tracData"');
          const prev = this._last(cur.trackData.list, 1);
          if (prev && cur.loops === 0) {
            const fixTime = this._collisionPrediction(
              prev,
              cur as FacileBarrage<T>,
            );
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
        cur.appendNode(this.box.node);
        nextFrame(() => {
          cur.setOff().then(() => resolve(false));
        });
      });
    });
  }

  private _create(
    type: BarrageType,
    data: PushData<T>,
    viewStatus: ViewStatus,
    options?: Omit<PushFlexOptions<T>, 'plugin'>,
  ): Barrage<T> {
    assert(this.box, 'Container not formatted');
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

    // Create FacileBarrage
    if (type === 'facile') {
      config.duration = this._randomDuration();
      return new FacileBarrage(config);
    } else {
      // Create FlexibleBarrage
      assert(options, 'Unexpected Error');
      const { direction, duration, position } = options;
      config.direction = direction;
      config.duration =
        typeof duration === 'number' ? duration : this._randomDuration();

      const b = new FlexibleBarrage(config);
      // If it is a function, the postion will be updated after the node is created,
      // so that the function can get accurate bullet comment data.
      if (typeof position !== 'function') {
        b.updatePosition(position);
      } else {
        b.use({
          appendNode: () => {
            assert(
              typeof position === 'function',
              '"position" must be a function',
            );
            b.updatePosition(position(this.box, b));
          },
        });
      }
      return b;
    }
  }

  private _randomDuration() {
    const t = random(...this.options.times);
    assert(t > 0, `Invalid move time "${t}"`);
    return t;
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

  // We have to make a copy.
  // During the loop, there are too many factors that change barrages,
  // which makes it impossible to guarantee the stability of the list.
  private _clearTarck(i: number) {
    for (const b of Array.from(this._tracks[i].list)) {
      b.destroy();
    }
  }

  private _getTrackData(
    founds = new Set<number>(),
    prev?: TrackData<T>,
  ): TrackData<T> | null {
    if (this.rows === 0) return null;
    const { gap, mode } = this.options;
    if (founds.size === this._tracks.length) {
      return mode === 'adaptive' ? prev! : null;
    }
    const i = randomIdx(founds, this.rows);
    const trackData = this._tracks[i];
    if (mode === 'none') {
      return trackData;
    }
    const last = this._last(trackData.list, 0);
    if (!last) {
      return trackData;
    }
    const lastWidth = last.getWidth();
    if (
      lastWidth > 0 &&
      last.getMoveDistance() >= (gap as number) + lastWidth
    ) {
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
