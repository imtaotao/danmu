import { FacileBarrage } from './barrages/facile';
import { FlexibleBarrage } from './barrages/flexible';
import type {
  Box,
  TrackData,
  BarrageData,
  RunOptions,
  Direction,
  ViewStatus,
  FacilePlugin,
} from './types';
import { assert, hasOwn, isRange, toNumber, nextFrame } from './utils';

export interface EngineOptions {
  rowGap: number;
  height: number;
  direction: Direction;
  forceRender: boolean;
  container: HTMLElement;
  times: [number, number];
}

export class Engine<T> {
  public rows = 0;
  public box?: Box;
  private _layouts = [] as Array<TrackData<T>>;
  private _sets = {
    show: new Set<FacileBarrage<T>>(),
    complex: new Set<FlexibleBarrage<unknown>>(),
    stash: [] as Array<BarrageData<T> | FacileBarrage<T>>,
  };

  public constructor(public options: EngineOptions) {}

  public n() {
    const { stash, show, complex } = this._sets;
    return {
      stash: stash.length,
      complex: complex.size,
      display: show.size + complex.size,
      all: show.size + complex.size + stash.length,
    };
  }

  public updateOptions(newOptions: Partial<EngineOptions>) {
    this.options = Object.assign(this.options, newOptions);
    if (hasOwn(newOptions, 'height') || hasOwn(newOptions, 'container')) {
      this.format();
    }
  }

  public format() {
    const { height, container } = this.options;
    const styles = getComputedStyle(container);
    if (this._needFixPosition(styles)) {
      container.style.position = 'relative';
    }

    this.box = {
      el: container,
      width: toNumber(styles.width),
      height: toNumber(styles.height),
    };
    this.rows = +(this.box.height / height).toFixed(0);

    for (let i = 0; i < this.rows; i++) {
      const gaps = [
        height * i, // start
        height * (i + 1) - 1, // end
      ] as [number, number];

      if (this._layouts[i]) {
        this._layouts[i].gaps = gaps;
      } else {
        this._layouts.push({
          list: [],
          gaps: gaps,
        });
      }
    }
  }

  public getTrackData(founds: Array<number> = []): TrackData<T> | null {
    const { rowGap } = this.options;
    if (founds.length === this._layouts.length) {
      if (this.options.forceRender) {
        const i = Math.floor(Math.random() * this.rows);
        return this._layouts[i];
      }
      return null;
    }
    const i = this._selectTrackIdx(founds);
    const trackData = this._layouts[i];
    const last = this._last(trackData.list, 0);
    founds.push(i);

    if (rowGap <= 0 || !last) {
      return trackData;
    }
    if (!last.moving) {
      return this.getTrackData(founds);
    }
    const distance = last.getMoveDistance();
    const spacing = rowGap > 0 ? rowGap + last.getWidth() : rowGap;
    return distance > spacing ? trackData : this.getTrackData(founds);
  }

  public run(args: RunOptions<T>) {
    const b =
      args.layer instanceof FacileBarrage
        ? args.layer
        : this._create({
            layer: args.layer,
            viewStatus: args.viewStatus,
            bridgePlugin: args.bridgePlugin,
          });
    if (!b) return;

    b.createNode();
    b.appendNode(this.options.container);
    b.updateTrackData(args.trackData);
    b.position.y = args.trackData.gaps[0];
    b.setStyle('top', `${b.position.y}px`);
    this._sets.show.add(b);

    this._setAction(b).then((isStash) => {
      if (isStash) {
        b.reset();
        b.setStyle('top', '');
        this._sets.show.delete(b);
        this._sets.stash.unshift(b);
      } else {
        b.destroy();
        if (this.n().all === 0) {
          a.finished();
        }
      }
    });
  }

  private _needFixPosition(styles: CSSStyleDeclaration) {
    return (
      !styles.position ||
      styles.position === 'none' ||
      styles.position === 'static'
    );
  }

  private _last(ls: Array<FacileBarrage<T>>, li: number) {
    for (let i = ls.length - 1; i >= 0; i--) {
      const b = ls[i - li];
      if (b && !b.paused) return b;
    }
    return null;
  }

  private _selectTrackIdx(founds: Array<number>): number {
    const idx = Math.floor(Math.random() * this.rows);
    return founds.includes(idx) ? this._selectTrackIdx(founds) : idx;
  }

  private _create(
    a: Pick<RunOptions<T>, 'layer' | 'viewStatus' | 'bridgePlugin'>,
  ) {
    const {
      direction,
      times: [min, max],
    } = this.options;
    const t = Number(
      max === min ? max : (Math.random() * (max - min) + min).toFixed(0),
    );
    if (t <= 0) return null;
    assert(this.box, 'Container not formatted');

    const b = new FacileBarrage<T>({
      direction,
      duration: t,
      box: this.box,
      data: a.layer.data,
      defaultStatus: a.viewStatus,
      delInTrack: (b) => this._sets.show.delete(b),
    });
    if ((a.layer as BarrageData<T>).plugin) {
      b.use((a.layer as BarrageData<T>).plugin!);
    }
    b.use(a.bridgePlugin);
    return b;
  }

  private _setAction(cur: FacileBarrage<T>) {
    return new Promise<boolean | void>((resolve) => {
      nextFrame(() => {
        assert(cur.trackData);
        const prv = this._last(cur.trackData.list, 1);
        if (prv && prv.moving && !prv.paused && this.options.rowGap > 0) {
          const t = this._collisionPrediction(prv, cur);
          if (t !== null) {
            if (isRange(this.options.times, t)) {
              cur.fixDuration(t);
            } else {
              resolve(true);
              return;
            }
          }
        }
        assert(cur.node);
        cur.setEndStyles().then(resolve);
      });
    });
  }

  private _collisionPrediction(prv: FacileBarrage<T>, cur: FacileBarrage<T>) {
    const pw = prv.getWidth();
    const cw = cur.getWidth();
    const ps = prv.getSpeed();
    const cs = cur.getSpeed();

    const acceleration = cs - ps;
    if (acceleration <= 0) return null;

    const distance = prv.getMoveDistance() - cw - pw;
    const collisionTime = distance / acceleration;
    if (collisionTime >= cur.duration) return null;

    assert(this.box, 'Container not formatted');
    const remainingTime = (1 - prv.getMovePercent()) * prv.duration;
    const currentFixTime = (cw * remainingTime) / this.box.width;
    return remainingTime + currentFixTime;
  }
}
