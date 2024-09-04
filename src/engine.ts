import {
  Queue,
  assert,
  hasOwn,
  remove,
  loopSlice,
  isInBounds,
  batchProcess,
} from 'aidly';
import { Container } from './container';
import { FacileDanmaku } from './danmaku/facile';
import { FlexibleDanmaku } from './danmaku/flexible';
import { toNumber, randomIdx, nextFrame, INTERNAL_FLAG } from './utils';
import type {
  Mode,
  TrackData,
  StashData,
  Direction,
  EachCallback,
  Danmaku,
  PushOptions,
  PushFlexOptions,
  DanmakuType,
  DanmakuPlugin,
  RenderOptions,
  InternalStatuses,
} from './types';

export interface EngineOptions {
  mode: Mode;
  rate: number;
  gap: number | string;
  trackHeight: number | string;
  times: [number, number];
  direction: Exclude<Direction, 'none'>;
  limits: {
    view?: number;
    stash: number;
  };
}

export class Engine<T> {
  public rows = 0;
  public container = new Container();
  public tracks = [] as Array<TrackData<T>>;
  private _fx = new Queue();
  private _sets = {
    view: new Set<FacileDanmaku<T>>(),
    flexible: new Set<FlexibleDanmaku<T>>(),
    stash: [] as Array<StashData<T> | FacileDanmaku<T>>,
  };
  // Avoid frequent deletion of danmaku.
  // collect the danmaku that need to be deleted within 2 seconds and delete them together.
  private _addDestroyQueue = batchProcess<Danmaku<T>>({
    ms: 3000,
    processor: (ls) => ls.forEach((d) => d.destroy()),
  });

  public constructor(private _options: EngineOptions) {}

  // We have to make a copy.
  // During the loop, there are too many factors that change danmaku,
  // which makes it impossible to guarantee the stability of the list.
  public clearTrack(i: number) {
    for (const d of Array.from(this.tracks[i].list)) {
      d.destroy();
    }
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
    data: T | FacileDanmaku<T>,
    options: Required<PushOptions<T>>,
    isUnshift?: boolean,
  ) {
    const val = data instanceof FacileDanmaku ? data : { data, options };
    this._sets.stash[isUnshift ? 'unshift' : 'push'](val);
  }

  public updateOptions(newOptions: Partial<EngineOptions>) {
    this._options = Object.assign(this._options, newOptions);
    if (hasOwn(newOptions, 'gap')) {
      this._options.gap = this._toNumber('width', this._options.gap);
    }
    if (hasOwn(newOptions, 'trackHeight')) {
      this.format();
    }
  }

  public clear() {
    this._sets.view.clear();
    this._sets.flexible.clear();
    this._sets.stash.length = 0;
    for (let i = 0; i < this.tracks.length; i++) {
      this.clearTrack(i);
    }
  }

  // `flexible` and `view` are both xx,
  // so deleting some of them in the loop will not affect
  public each(fn: EachCallback<T>) {
    for (const item of this._sets.flexible) {
      if (!item.isEnded) {
        if (fn(item) === false) return;
      }
    }
    for (const item of this._sets.view) {
      if (!item.isEnded) {
        if (fn(item) === false) return;
      }
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
        if (!arr[i].isEnded) {
          if (fn(arr[i]) === false) {
            stop = true;
            return false;
          }
        }
      },
      17,
    ).then(() => {
      if (stop) return;
      const arr = Array.from(this._sets.view);
      return loopSlice(
        arr.length,
        (i) => {
          if (!arr[i].isEnded) {
            return fn(arr[i]);
          }
        },
        17,
      );
    });
  }

  public format() {
    const { width, height } = this.container;
    this.container._format();
    const { gap, trackHeight } = this._options;
    this._options.gap = this._toNumber('width', gap);
    const h = this._toNumber('height', trackHeight);

    if (h <= 0) {
      for (let i = 0; i < this.tracks.length; i++) {
        this.clearTrack(i);
      }
      return;
    }
    const rows = (this.rows = +(this.container.height / h).toFixed(0));

    for (let i = 0; i < rows; i++) {
      const track = this.tracks[i];
      const start = h * i;
      const end = h * (i + 1) - 1;
      const mid = (end - start) / 2 + start;
      const location = [start, mid, end] as [number, number, number];

      if (end > this.container.height) {
        this.rows--;
        if (track) {
          this.clearTrack(i);
          this.tracks.splice(i, 1);
        }
      } else if (track) {
        // If the reused track is larger than the container height,
        // the overflow needs to be deleted.
        if (track.location[2] > this.container.height) {
          this.clearTrack(i);
        } else {
          Array.from(track.list).forEach((d) =>
            d._format(width, height, track),
          );
        }
        track.location = location;
      } else {
        this.tracks.push({
          i,
          location,
          list: [],
        });
      }
    }
    // Delete the extra tracks and the danmaku inside
    if (this.tracks.length > this.rows) {
      for (let i = this.rows; i < this.tracks.length; i++) {
        this.clearTrack(i);
      }
      this.tracks.splice(this.rows, this.tracks.length - this.rows);
    }
    // If `flexible` danmaku is also outside the view, it also needs to be deleted
    for (const d of this._sets.flexible) {
      if (d.position.y > this.container.height) {
        d.destroy();
      } else if (width !== this.container.width) {
        d._format();
      }
    }
  }

  public renderFlexibleDanmaku(
    data: T,
    options: Required<PushFlexOptions<T>>,
    { hooks, statuses, danmakuPlugin }: RenderOptions<T>,
  ) {
    assert(this.container, 'Container not formatted');
    hooks.render.call(null, 'flexible');

    const d = this._create('flexible', data, options, statuses);
    if (d.position.x > this.container.width) return false;
    if (d.position.y > this.container.height) return false;
    if (options.plugin) d.use(options.plugin);
    d.use(danmakuPlugin);

    const { prevent } = hooks.willRender.call(null, {
      type: 'flexible',
      danmaku: d,
      prevent: false,
      trackIndex: null,
    });

    if (this._options.rate > 0 && prevent !== true) {
      const setup = () => {
        d._createNode();
        this._sets.flexible.add(d as FlexibleDanmaku<T>);
        this._setAction(d, statuses).then((isFreeze) => {
          if (isFreeze) {
            console.error(
              'Currently in a freeze state, unable to render "FlexibleDanmaku"',
            );
            return;
          }
          if (d.isLoop) {
            d._setStartStatus();
            setup();
            return;
          }
          d.destroy();
          if (this.len().all === 0) {
            hooks.finished.call(null);
          }
        });
      };
      setup();
      return true;
    }

    return false;
  }

  public renderFacileDanmaku({
    hooks,
    statuses,
    danmakuPlugin,
  }: RenderOptions<T>) {
    const { mode, limits } = this._options;

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
      return loopSlice(l, () =>
        this._consumeFacileDanmaku(statuses, danmakuPlugin, hooks),
      );
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

  private _consumeFacileDanmaku(
    statuses: InternalStatuses,
    danmakuPlugin: DanmakuPlugin<T>,
    hooks: RenderOptions<T>['hooks'],
  ) {
    let d: FacileDanmaku<T>;
    const layer = this._sets.stash.shift();
    if (!layer) return;
    const trackData = this._getTrackData();
    if (!trackData) {
      this._sets.stash.unshift(layer);
      // If there is nothing to render, return `false` to stop the loop.
      return false;
    }

    if (layer instanceof FacileDanmaku) {
      d = layer;
    } else {
      d = this._create('facile', layer.data, layer.options, statuses);
      if (layer.options.plugin) {
        d.use(layer.options.plugin);
      }
      d.use(danmakuPlugin);
    }

    const { prevent } = hooks.willRender.call(null, {
      type: 'facile',
      danmaku: d,
      prevent: false,
      trackIndex: trackData.i,
    });

    // When the rate is less than or equal to 0,
    // the danmaku will never move, but it will be rendered,
    // so just don't render it here.
    if (this._options.rate > 0 && prevent !== true) {
      // First createNode, users may add styles
      d._createNode();
      d._appendNode(this.container.node);
      d._updateTrackData(trackData);

      const setup = () => {
        this._sets.view.add(d);
        this._setAction(d, statuses).then((isStash) => {
          if (isStash) {
            d._reset();
            this._sets.view.delete(d);
            this._sets.stash.unshift(d);
            return;
          }
          if (d.isLoop) {
            d._setStartStatus();
            setup();
            return;
          }
          this._addDestroyQueue(d);
          if (this.len().all === 0) {
            hooks.finished.call(null);
          }
        });
      };
      // Waiting for the style to take effect,
      // we need to get the danmaku screen height.
      let i = 0;
      const triggerSetup = () => {
        nextFrame(() => {
          const height = d.getHeight();
          if (height === 0 && ++i < 20) {
            triggerSetup();
          } else {
            const y = trackData.location[1] - height / 2;
            if (y + height > this.container.height) return;
            d._updatePosition({ y });
            setup();
          }
        });
      };
      triggerSetup();
    }
  }

  private _setAction(cur: Danmaku<T>, internalStatuses: InternalStatuses) {
    return new Promise<boolean>((resolve) => {
      nextFrame(() => {
        if (internalStatuses.freeze === true) {
          resolve(true);
          return;
        }
        const { mode, times } = this._options;
        if (mode !== 'none' && cur.type === 'facile') {
          assert(cur.trackData, 'Danmaku missing "trackData"');
          const prev = this._last(cur.trackData.list, 1);
          if (prev && cur.loops === 0) {
            const fixTime = this._collisionPrediction(
              prev,
              cur as FacileDanmaku<T>,
            );
            if (fixTime !== null) {
              if (isInBounds(times, fixTime)) {
                cur.updateDuration(fixTime, true);
              } else if (mode === 'strict') {
                resolve(true);
                return;
              }
            }
          }
        }
        cur._appendNode(this.container.node);
        nextFrame(() => {
          if (internalStatuses.freeze === true) {
            cur._removeNode(INTERNAL_FLAG);
            resolve(true);
          } else {
            cur._setOff().then(() => resolve(false));
          }
        });
      });
    });
  }

  private _create(
    type: DanmakuType,
    data: T,
    options: Required<PushOptions<T> | PushFlexOptions<T>>,
    internalStatuses: InternalStatuses,
  ): Danmaku<T> {
    assert(this.container, 'Container not formatted');
    const config = {
      data,
      internalStatuses,
      rate: options.rate,
      container: this.container,
      duration: options.duration,
      direction: options.direction,
      delInTrack: (b: Danmaku<T>) => {
        remove(this._sets.view, b);
        type === 'facile'
          ? remove(this._sets.stash, b)
          : remove(this._sets.flexible, b);
      },
    };
    // Create FacileDanmaku
    if (type === 'facile') {
      return new FacileDanmaku(config);
    }
    // Create FlexibleDanmaku
    const d = new FlexibleDanmaku(config);
    const { position } = options as PushFlexOptions<T>;

    // If it is a function, the position will be updated after the node is created,
    // so that the function can get accurate danmaku data.
    if (typeof position === 'function') {
      d.use({
        appendNode: () => {
          const { x, y } = position(d, this.container);
          d._updatePosition({
            x: this._toNumber('width', x),
            y: this._toNumber('height', y),
          });
        },
      });
    } else {
      d._updatePosition({
        x: this._toNumber('width', position.x),
        y: this._toNumber('height', position.y),
      });
    }
    return d;
  }

  private _last(ls: Array<FacileDanmaku<T>>, li: number) {
    for (let i = ls.length - 1; i >= 0; i--) {
      const d = ls[i - li];
      if (d && !d.paused && d.loops === 0 && d.type === 'facile') {
        return d;
      }
    }
    return null;
  }

  private _getTrackData(
    founds = new Set<number>(),
    prev?: TrackData<T>,
  ): TrackData<T> | null {
    if (this.rows === 0) return null;
    const { gap, mode } = this._options;
    if (founds.size === this.tracks.length) {
      return mode === 'adaptive' ? prev! : null;
    }
    const i = randomIdx(founds, this.rows);
    const trackData = this.tracks[i];
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
      last._getMoveDistance() >= (gap as number) + lastWidth
    ) {
      return trackData;
    }
    founds.add(i);
    return this._getTrackData(founds, trackData);
  }

  private _collisionPrediction(prv: FacileDanmaku<T>, cur: FacileDanmaku<T>) {
    const cs = cur._getSpeed();
    const ps = prv._getSpeed();
    const acceleration = cs - ps;
    if (acceleration <= 0) return null;

    const cw = cur.getWidth();
    const pw = prv.getWidth();
    const { gap } = this._options;
    const distance = prv._getMoveDistance() - cw - pw - (gap as number);
    const collisionTime = distance / acceleration;
    if (collisionTime >= cur.duration) return null;

    assert(this.container, 'Container not formatted');
    const remainingTime = (1 - prv._getMovePercent()) * prv.duration;
    const currentFixTime =
      ((cw + (gap as number)) * remainingTime) / this.container.width;
    return remainingTime + currentFixTime;
  }

  private _toNumber(p: 'height' | 'width', val: number | string) {
    let n = typeof val === 'number' ? val : toNumber(val, this.container[p]);
    if (n > this.container[p]) {
      n = this.container[p];
    }
    assert(!Number.isNaN(n), `Invalid "${val}", result is NaN`);
    return n;
  }
}
