import {
  Queue,
  assert,
  hasOwn,
  remove,
  loopSlice,
  isNumber,
  isInBounds,
  batchProcess,
  type Nullable,
} from 'aidly';
import { Track } from './track';
import { Container } from './container';
import { FacileDanmaku } from './danmaku/facile';
import { FlexibleDanmaku } from './danmaku/flexible';
import { randomIdx, nextFrame, INTERNAL_FLAG } from './utils';
import type {
  Speed,
  StashData,
  EachCallback,
  Danmaku,
  PushOptions,
  PushFlexOptions,
  DanmakuType,
  DanmakuPlugin,
  RenderOptions,
  EngineOptions,
  InternalStatuses,
} from './types';

export class Engine<T> {
  public rows = 0;
  public container = new Container();
  public tracks = [] as Array<Track<T>>;
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
    processor: (ls) => ls.forEach((dm) => dm.destroy()),
  });

  public constructor(private _options: EngineOptions) {}

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
      this._options.gap = this.container._toNumber('width', this._options.gap);
    }
    if (hasOwn(newOptions, 'trackHeight')) {
      this.format();
    }
  }

  public clear(type?: Nullable<DanmakuType>) {
    if (!type || type === 'facile') {
      for (let i = 0; i < this.tracks.length; i++) {
        this.tracks[i].clear();
      }
      this._sets.view.clear();
      this._sets.stash.length = 0;
    }
    if (!type || type === 'flexible') {
      for (const dm of this._sets.flexible) {
        dm.destroy();
      }
      this._sets.flexible.clear();
    }
  }

  // `flexible` and `view` are both xx,
  // so deleting some of them in the loop will not affect
  public each(fn: EachCallback<T>) {
    for (const dm of this._sets.flexible) {
      if (!dm.isEnded) {
        if (fn(dm) === false) return;
      }
    }
    for (const dm of this._sets.view) {
      if (!dm.isEnded) {
        if (fn(dm) === false) return;
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
    this._options.gap = this.container._toNumber('width', gap);
    const h = this.container._toNumber('height', trackHeight);

    if (h <= 0) {
      for (let i = 0; i < this.tracks.length; i++) {
        this.tracks[i].clear();
      }
      return;
    }
    const rows = (this.rows = +(this.container.height / h).toFixed(0));

    for (let i = 0; i < rows; i++) {
      const track = this.tracks[i];
      const top = h * i;
      const bottom = h * (i + 1) - 1;
      const middle = (bottom - top) / 2 + top;
      const location = { top, middle, bottom };

      if (bottom > this.container.height) {
        this.rows--;
        if (track) {
          this.tracks[i].clear();
          this.tracks.splice(i, 1);
        }
      } else if (track) {
        // If the reused track is larger than the container height,
        // the overflow needs to be deleted.
        if (track.location.middle > this.container.height) {
          this.tracks[i].clear();
        } else {
          track.each((dm) => {
            dm._format(width, height, track);
          });
        }
        track._updateLocation(location);
      } else {
        const track = new Track<T>({
          index: i,
          list: [],
          location,
          container: this.container,
        });
        this.tracks.push(track);
      }
    }
    // Delete the extra tracks and the danmaku inside
    if (this.tracks.length > this.rows) {
      for (let i = this.rows; i < this.tracks.length; i++) {
        this.tracks[i].clear();
      }
      this.tracks.splice(this.rows, this.tracks.length - this.rows);
    }
    // If `flexible` danmaku is also outside the view, it also needs to be deleted
    for (const dm of this._sets.flexible) {
      if (dm.position.y > this.container.height) {
        dm.destroy();
      } else if (width !== this.container.width) {
        dm._format();
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

    const dm = this._create('flexible', data, options, statuses);
    if (dm.position.x > this.container.width) return false;
    if (dm.position.y > this.container.height) return false;
    if (options.plugin) dm.use(options.plugin);
    dm.use(danmakuPlugin);

    const { prevent } = hooks.willRender.call(null, {
      type: 'flexible',
      danmaku: dm,
      prevent: false,
      trackIndex: null,
    });

    if (this._options.rate > 0 && prevent !== true) {
      const setup = () => {
        dm._createNode();
        this._sets.flexible.add(dm as FlexibleDanmaku<T>);
        this._setAction(dm, statuses).then((isFreeze) => {
          if (isFreeze) {
            console.error(
              'Currently in a freeze state, unable to render "FlexibleDanmaku"',
            );
            return;
          }
          if (dm.isLoop) {
            dm._setStartStatus();
            setup();
            return;
          }
          dm.destroy();
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
    let dm: FacileDanmaku<T>;
    const layer = this._sets.stash.shift();
    if (!layer) return;
    const track = this._getTrack();
    if (!track) {
      this._sets.stash.unshift(layer);
      // If there is nothing to render, return `false` to stop the loop.
      return false;
    }

    if (layer instanceof FacileDanmaku) {
      dm = layer;
    } else {
      dm = this._create('facile', layer.data, layer.options, statuses);
      if (layer.options.plugin) {
        dm.use(layer.options.plugin);
      }
      dm.use(danmakuPlugin);
    }

    const { prevent } = hooks.willRender.call(null, {
      type: 'facile',
      danmaku: dm,
      prevent: false,
      trackIndex: track.index,
    });

    // When the rate is less than or equal to 0,
    // the danmaku will never move, but it will be rendered,
    // so just don't render it here.
    if (this._options.rate > 0 && prevent !== true) {
      // First createNode, users may add styles
      dm._createNode();
      dm._appendNode(this.container.node);
      dm._updateTrack(track);

      const setup = () => {
        this._sets.view.add(dm);
        this._setAction(dm, statuses).then((isStash) => {
          if (isStash) {
            dm._reset();
            this._sets.view.delete(dm);
            this._sets.stash.unshift(dm);
            return;
          }
          if (dm.isLoop) {
            dm._setStartStatus();
            setup();
            return;
          }
          this._addDestroyQueue(dm);
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
          const height = dm.getHeight();
          if (height === 0 && ++i < 20) {
            triggerSetup();
          } else {
            const y = track.location.middle - height / 2;
            if (y + height > this.container.height) return;
            dm._updatePosition({ y });
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
        const { mode, durationRange } = this._options;

        if (cur.type === 'facile') {
          const speed = this._calculateSpeed(cur._options.speed);
          if (speed) {
            cur._updateDuration(cur._summaryWidth() / speed, true);
          } else if (mode === 'strict' || mode === 'adaptive') {
            assert(cur.track, 'Track not found');
            const prev = cur.track._last(1);
            if (prev && cur.loops === 0) {
              const fixTime = this._collisionPrediction(
                prev,
                cur as FacileDanmaku<T>,
              );
              if (fixTime !== null) {
                if (isInBounds(durationRange, fixTime)) {
                  cur._updateDuration(fixTime, true);
                } else if (mode === 'strict') {
                  resolve(true);
                  return;
                }
              }
            }
          }
        } else if (cur.type === 'flexible') {
          cur.use({
            appendNode: () => {
              const speed = this._calculateSpeed(cur._options.speed);
              if (speed) {
                cur._updateDuration(
                  (cur.position.x + cur.getWidth()) / speed,
                  true,
                );
              }
            },
          });
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
      speed: options.speed,
      container: this.container,
      duration: options.duration,
      direction: options.direction,
      progress: options.progress,
      delInTrack: (b: Danmaku<T>) => {
        remove(this._sets.view, b);
        type === 'facile'
          ? remove(this._sets.stash, b)
          : remove(this._sets.flexible, b);
      },
    };

    if (type === 'facile') {
      // Create FacileDanmaku
      return new FacileDanmaku(config);
    } else {
      // Create FlexibleDanmaku
      const dm = new FlexibleDanmaku(config);
      const { position } = options as PushFlexOptions<T>;

      // If it is a function, the position will be updated after the node is created,
      // so that the function can get accurate danmaku data.
      if (typeof position === 'function') {
        dm.use({
          appendNode: () => {
            let { x, y } = position(dm, this.container);
            x = this.container._toNumber('width', x);
            y = this.container._toNumber('height', y);
            dm._updatePosition({ x, y });
          },
        });
      } else {
        const x = this.container._toNumber('width', position.x);
        const y = this.container._toNumber('height', position.y);
        dm._updatePosition({ x, y });
      }
      return dm;
    }
  }

  private _calculateSpeed(s?: Speed) {
    if (s && typeof s === 'string') {
      s = this.container._toNumber('width', s);
      assert(
        isNumber(s) && s > 0,
        `The speed must > 0, but the current value is "${s}"`,
      );
    }
    return s as Nullable<number>;
  }

  private _getTrack(
    founds = new Set<number>(),
    prev?: Track<T>,
  ): Track<T> | null {
    if (this.rows === 0) return null;
    const { gap, mode } = this._options;
    if (founds.size === this.tracks.length) {
      return mode === 'adaptive' ? prev || null : null;
    }
    const i = randomIdx(founds, this.rows);
    const track = this.tracks[i];

    if (!track.isLock) {
      if (mode === 'none') {
        return track;
      }
      const last = track._last(0);
      if (!last) {
        return track;
      }
      const lastWidth = last.getWidth();
      if (
        lastWidth > 0 &&
        last._getMoveDistance() >= (gap as number) + lastWidth
      ) {
        return track;
      }
    }
    founds.add(i);
    return this._getTrack(founds, track);
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
}
