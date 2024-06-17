import { Queue } from 'small-queue';
import { assert, hasOwn, remove, loopSlice, isInBounds } from 'aidly';
import { FacileBarrage } from './barrages/facile';
import { FlexibleBarrage } from './barrages/flexible';
import { toNumber, nextFrame } from './utils';
import type {
  Box,
  Mode,
  Layer,
  TrackData,
  Barrage,
  BarrageData,
  Direction,
  ViewStatus,
  EachCallback,
  BarragePlugin,
  RenderOptions,
  RunOptions,
  PushFlexOptions,
} from './types';

export interface EngineOptions {
  mode: Mode;
  gap: number;
  height: number;
  container: HTMLElement;
  times: [number, number];
  direction: Omit<Direction, 'none'>;
}

export class Engine<T> {
  public rows = 0;
  public box?: Box;
  private _fx = new Queue();
  private _tracks = [] as Array<TrackData<T>>;
  private _sets = {
    view: new Set<FacileBarrage<T>>(),
    flexible: new Set<FlexibleBarrage<T>>(),
    stash: [] as Array<BarrageData<T> | FacileBarrage<T>>,
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

  public renderFlexBarrage(data: T, options: PushFlexOptions<T>) {}

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
    const { height, container } = this.options;
    const styles = getComputedStyle(container);

    this.box = {
      el: container,
      width: toNumber(styles.width),
      height: toNumber(styles.height),
    };
    this._fixPosition(styles);
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

  public render({ hooks, viewStatus, bridgePlugin }: RenderOptions<T>) {
    const { mode } = this.options;

    const go = () => {
      let l = this.n().stash;
      if (mode === 'strict' && l > this.rows) l = this.rows;
      if (l <= 0) return;
      hooks.render.call(null);

      return loopSlice(l, () => {
        const b = this._sets.stash.shift();
        if (!b) return;
        const trackData = this._getTrackData();
        if (!trackData) {
          this._sets.stash.unshift(b);
          return false;
        }
        const { prevent } = hooks.willRender.call(null, {
          value: b.data,
          prevent: false,
        });
        if (prevent === true) return;
        this._run({
          hooks,
          layer: b,
          trackData,
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

  private _run({
    layer,
    hooks,
    trackData,
    viewStatus,
    bridgePlugin,
  }: RunOptions<T>) {
    const b =
      layer instanceof FacileBarrage
        ? layer
        : this._newFacileBarrage(layer, viewStatus, bridgePlugin);

    const reset = () => {
      b.reset();
      this._sets.view.delete(b);
      this._sets.stash.unshift(b);
    };
    const set = () => {
      b.updatePosition({ y: trackData.location[0] });
      b.createNode();
      b.appendNode(this.options.container);
      b.updateTrackData(trackData);

      this._sets.view.add(b);
      this._setAction(b, reset).then(() => {
        b.destroy();
        if (this.n().all === 0) {
          hooks.finished.call(null);
        }
      });
    };
    set();
  }

  private _newFacileBarrage(
    layer: Layer<T>,
    viewStatus: ViewStatus,
    bridgePlugin: BarragePlugin<T>,
  ) {
    const {
      direction,
      times: [min, max],
    } = this.options;
    const duration = Number(
      max === min ? max : (Math.random() * (max - min) + min).toFixed(0),
    );
    assert(duration > 0, `Invalid move time "${duration}"`);
    assert(this.box, 'Container not formatted');

    const b = new FacileBarrage<T>({
      duration,
      box: this.box,
      data: layer.data,
      defaultStatus: viewStatus,
      direction: direction as Direction,
      delInTrack: (b) => remove(this._sets.view, b),
    });
    if ((layer as BarrageData<T>).plugin) {
      b.use((layer as BarrageData<T>).plugin!);
    }
    b.use(bridgePlugin);
    return b;
  }

  private _fixPosition(styles: CSSStyleDeclaration) {
    if (
      !styles.position ||
      styles.position === 'none' ||
      styles.position === 'static'
    ) {
      this.options.container.style.position = 'relative';
    }
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
        cur.setEndStyles().then(resolve);
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
