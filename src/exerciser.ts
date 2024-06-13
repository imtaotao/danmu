import type { Box, TrackData } from './types';
import type { SimpleBarrage } from './barrages/simple';
import {
  now,
  assert,
  hasOwn,
  isRange,
  toNumber,
  nextFrame,
  whenTransitionEnds,
} from './utils';

export interface ExerciserOptions {
  rowGap: number;
  height: number;
  forceRender: boolean;
  container: HTMLElement;
  times: [number, number];
}

export class Exerciser<T> {
  public rows = 0;
  public box?: Box;
  private _layouts = [] as Array<TrackData<T>>;
  public constructor(private options: ExerciserOptions) {}

  public updateOptions(newOptions: Partial<ExerciserOptions>) {
    this.options = Object.assign(this.options, newOptions);
    if (hasOwn(newOptions, 'height') || hasOwn(newOptions, 'container')) {
      this.format();
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
    const i = this.selectTrackIdx(founds);
    const trackData = this._layouts[i];
    const last = this.last(trackData.bs, 0);
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

  public emit(cur: SimpleBarrage<T>) {
    return new Promise<boolean>((resolve) => {
      assert(cur.trackData);
      const prv = this.last(cur.trackData.bs, 1);
      cur.setStyle('top', `${cur.position.y}px`);

      nextFrame(() => {
        if (prv && prv.moving && !prv.paused && this.options.rowGap > 0) {
          const t = this.collisionPrediction(prv, cur);
          if (t !== null) {
            if (isRange(this.options.times, t)) {
              cur.duration = t;
              cur.recorder.duration = t;
              cur.isChangeDuration = true;
            } else {
              cur.reset();
              cur.setStyle('top', '');
              resolve(false);
              return;
            }
          }
        }
        assert(cur.node);
        cur.initStyles();
        cur.moving = true;
        cur.recorder.startTime = now();
        whenTransitionEnds(cur.node).then(() => resolve(true));
      });
    });
  }

  public format() {
    const { height, container } = this.options;
    const styles = getComputedStyle(container);
    if (this.needFixPosition(styles)) {
      container.style.position = 'relative';
    }

    this.box = {
      el: container,
      w: toNumber(styles.width),
      h: toNumber(styles.height),
    };
    this.rows = +(this.box.h / height).toFixed(0);

    for (let i = 0; i < this.rows; i++) {
      const gaps = [
        height * i, // start
        height * (i + 1) - 1, // end
      ] as [number, number];

      if (this._layouts[i]) {
        this._layouts[i].gaps = gaps;
      } else {
        this._layouts.push({
          bs: [],
          gaps: gaps,
        });
      }
    }
  }

  private needFixPosition(styles: CSSStyleDeclaration) {
    return (
      !styles.position ||
      styles.position === 'none' ||
      styles.position === 'static'
    );
  }

  private last(ls: Array<SimpleBarrage<T>>, li: number) {
    for (let i = ls.length - 1; i >= 0; i--) {
      const b = ls[i - li];
      if (b && !b.paused) return b;
    }
    return null;
  }

  private selectTrackIdx(founds: Array<number>): number {
    const idx = Math.floor(Math.random() * this.rows);
    return founds.includes(idx) ? this.selectTrackIdx(founds) : idx;
  }

  private collisionPrediction(prv: SimpleBarrage<T>, cur: SimpleBarrage<T>) {
    const pw = prv.getWidth();
    const cw = cur.getWidth();
    const ps = prv.getSpeed();
    const cs = cur.getSpeed();

    const acceleration = cs - ps;
    if (acceleration <= 0) return null;

    const distance = prv.getMoveDistance() - cw - pw;
    const meetTime = distance / acceleration;
    if (meetTime >= cur.duration) return null;

    assert(this.box, 'Container not formatted');
    const remainingTime = (1 - prv.getMovePercent()) * prv.duration;
    const currentFixTime = (cw * remainingTime) / this.box.w;
    return remainingTime + currentFixTime;
  }
}
