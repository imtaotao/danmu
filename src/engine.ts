import {
  Queue,
  assert,
  hasOwn,
  remove,
  random,
  loopSlice,
  isInBounds,
  batchProcess,
} from 'aidly';
import { Box } from './box';
import { FacileDanmaku } from './danmaku/facile';
import { FlexibleDanmaku } from './danmaku/flexible';
import { toNumber, randomIdx, nextFrame, INTERNAL_FLAG } from './utils';
import type {
  Mode,
  PushData,
  TrackData,
  StashData,
  Direction,
  EachCallback,
  Danmaku,
  DanmakuType,
  DanmakuPlugin,
  RenderOptions,
  PushFlexOptions,
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
  public box = new Box();
  public tracks = [] as Array<TrackData<T>>;
  private _fx = new Queue();
  private _sets = {
    view: new Set<FacileDanmaku<T>>(),
    flexible: new Set<FlexibleDanmaku<T>>(),
    stash: [] as Array<StashData<T> | FacileDanmaku<T>>,
  };
  // Avoid frequent deletion of bullet comments.
  // collect the bullet comments that need to be deleted within 2 seconds and delete them together.
  private _addDestoryQueue = batchProcess<Danmaku<T>>({
    ms: 3000,
    processor: (ls) => ls.forEach((d) => d.destroy()),
  });

  public constructor(private _options: EngineOptions) {}

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

  // We have to make a copy.
  // During the loop, there are too many factors that change danmaku,
  // which makes it impossible to guarantee the stability of the list.
  public clearTarck(i: number) {
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
    data: PushData<T> | FacileDanmaku<T>,
    plugin?: DanmakuPlugin<T>,
    isUnshift?: boolean,
  ) {
    const val = data instanceof FacileDanmaku ? data : { data, plugin };
    this._sets.stash[isUnshift ? 'unshift' : 'push'](val);
  }

  public updateOptions(newOptions: Partial<EngineOptions>) {
    this._options = Object.assign(this._options, newOptions);
    if (hasOwn(newOptions, 'gap')) {
      this._options.gap = this.n('width', this._options.gap);
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
      this.clearTarck(i);
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
    const { width, height } = this.box;
    // Need to format the container first
    this.box._format();
    const { gap, trackHeight } = this._options;
    this._options.gap = this.n('width', gap);
    const h = this.n('height', trackHeight);

    if (h <= 0) {
      for (let i = 0; i < this.tracks.length; i++) {
        this.clearTarck(i);
      }
      return;
    }
    const rows = (this.rows = +(this.box.height / h).toFixed(0));

    for (let i = 0; i < rows; i++) {
      const track = this.tracks[i];
      const start = h * i;
      const end = h * (i + 1) - 1;
      const mid = (end - start) / 2 + start;
      const location = [start, mid, end] as [number, number, number];

      if (end > this.box.height) {
        this.rows--;
        if (track) {
          this.clearTarck(i);
          this.tracks.splice(i, 1);
        }
      } else if (track) {
        // If the reused track is larger than the container height,
        // the overflow needs to be deleted.
        if (track.location[2] > this.box.height) {
          this.clearTarck(i);
        } else {
          Array.from(track.list).forEach((d) =>
            d._format(width, height, track),
          );
        }
        track.location = location;
      } else {
        this.tracks.push({
          location,
          list: [],
        });
      }
    }
    // Delete the extra tracks and the danmaku inside
    if (this.tracks.length > this.rows) {
      for (let i = this.rows; i < this.tracks.length; i++) {
        this.clearTarck(i);
      }
      this.tracks.splice(this.rows, this.tracks.length - this.rows);
    }
    // If `flexible` danmaku is also outside the view, it also needs to be deleted
    for (const d of this._sets.flexible) {
      if (d.position.y > this.box.height) {
        d.destroy();
      } else if (width !== this.box.width) {
        d._format();
      }
    }
  }

  public renderFlexibleDanmaku(
    data: PushData<T>,
    {
      hooks,
      position,
      duration,
      direction,
      statuses,
      plugin,
      danmakuPlugin,
    }: RenderOptions<T> & PushFlexOptions<T>,
  ) {
    assert(this.box, 'Container not formatted');
    hooks.render.call(null, 'flexible');

    const d = this._create('flexible', data, statuses, {
      position,
      duration,
      direction,
    });
    if (d.position.x > this.box.width) return false;
    if (d.position.y > this.box.height) return false;
    if (plugin) d.use(plugin);
    d.use(danmakuPlugin);

    const { prevent } = hooks.willRender.call(null, {
      danmaku: d,
      prevent: false,
      type: 'flexible',
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
            d.loops++;
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
      return loopSlice(l, () => this._consume(statuses, danmakuPlugin, hooks));
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
      d = this._create('facile', layer.data, statuses);
      if (layer.plugin) d.use(layer.plugin);
      d.use(danmakuPlugin);
    }

    const { prevent } = hooks.willRender.call(null, {
      danmaku: d,
      prevent: false,
      type: 'facile',
    });

    // When the rate is less than or equal to 0,
    // the bullet comment will never move, but it will be rendered,
    // so just don't render it here.
    if (this._options.rate > 0 && prevent !== true) {
      // First createNode, users may add styles
      d._createNode();
      d._appendNode(this.box.node);
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
            d.loops++;
            d._setStartStatus();
            setup();
            return;
          }
          this._addDestoryQueue(d);
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
            if (y + height > this.box.height) return;
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
                cur._fixDuration(fixTime, true);
              } else if (mode === 'strict') {
                resolve(true);
                return;
              }
            }
          }
        }
        cur._appendNode(this.box.node);
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
    data: PushData<T>,
    internalStatuses: InternalStatuses,
    options?: Omit<PushFlexOptions<T>, 'plugin'>,
  ): Danmaku<T> {
    assert(this.box, 'Container not formatted');
    const config = {
      data,
      duration: 0,
      box: this.box,
      internalStatuses,
      rate: this._options.rate,
      direction: this._options.direction as Direction,
      delInTrack: (b: Danmaku<T>) => {
        remove(this._sets.view, b);
        type === 'facile'
          ? remove(this._sets.stash, b)
          : remove(this._sets.flexible, b);
      },
    };

    // Create FacileDanmaku
    if (type === 'facile') {
      config.duration = this._randomDuration();
      return new FacileDanmaku(config);
    }
    // Create FlexibleDanmaku
    assert(options, 'Unexpected Error');
    const { direction, position, duration = this._randomDuration() } = options;
    config.duration = duration;
    direction && (config.direction = direction);
    const d = new FlexibleDanmaku(config);

    // If it is a function, the postion will be updated after the node is created,
    // so that the function can get accurate bullet comment data.
    if (typeof position !== 'function') {
      d._updatePosition(position);
    } else {
      d.use({
        appendNode: () => {
          assert(
            typeof position === 'function',
            '"position" must be a function',
          );
          d._updatePosition(position(d, this.box));
        },
      });
    }
    return d;
  }

  private _randomDuration() {
    const t = random(...this._options.times);
    assert(t > 0, `Invalid move time "${t}"`);
    return t;
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

    assert(this.box, 'Container not formatted');
    const remainingTime = (1 - prv._getMovePercent()) * prv.duration;
    const currentFixTime =
      ((cw + (gap as number)) * remainingTime) / this.box.width;
    return remainingTime + currentFixTime;
  }
}
