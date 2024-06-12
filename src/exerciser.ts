import type { SimpleBarrage } from "./barrages/simple";
import {
  now,
  assert,
  isRange,
  toNumber,
  nextFrame,
  whenTransitionEnds,
} from "./utils";

export interface TrackData {
  bs: Array<SimpleBarrage>;
  gaps: [number, number];
}

export interface Box {
  w: number;
  h: number;
  el: HTMLElement;
}

export interface ExerciserOptions {
  rowGap: number;
  height: number;
  forceRender: boolean;
  container: HTMLElement;
  times: [number, number];
}

export class Exerciser {
  public rows = 0;
  public box: Box;
  private layouts = [] as Array<TrackData>;

  public constructor(private options: ExerciserOptions) {
    this.box = this.initLayouts();
  }

  public resize() {
    this.box = this.initLayouts();
  }

  public getTrackData(founds: Array<number> = []): TrackData | null {
    const { rowGap } = this.options;
    if (founds.length === this.layouts.length) {
      if (this.options.forceRender) {
        const i = Math.floor(Math.random() * this.rows);
        return this.layouts[i];
      }
      return null;
    }
    const i = this.selectTrackIdx(founds);
    const trackData = this.layouts[i];
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

  public emit(cur: SimpleBarrage) {
    return new Promise<boolean>((resolve) => {
      assert(cur.trackData, "x");
      const prv = this.last(cur.trackData.bs, 1);
      cur.setStyle("top", `${cur.position.y}px`);

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
              cur.setStyle("top", "");
              resolve(false);
              return;
            }
          }
        }
        assert(cur.node, "x");
        cur.initStyles();
        cur.moving = true;
        cur.recorder.startTime = now();
        whenTransitionEnds(cur.node).then(() => resolve(true));
      });
    });
  }

  private needFixPosition(styles: CSSStyleDeclaration) {
    return (
      !styles.position ||
      styles.position === "none" ||
      styles.position === "static"
    );
  }

  private initLayouts() {
    const { height, container } = this.options;
    const styles = getComputedStyle(container);
    if (this.needFixPosition(styles)) {
      container.style.position = "relative";
    }
    const box = {
      el: container,
      w: toNumber(styles.width),
      h: toNumber(styles.height),
    };
    this.rows = +(box.h / height).toFixed(0);
    for (let i = 0; i < this.rows; i++) {
      const gaps = [
        height * i, // start
        height * (i + 1) - 1, // end
      ] as [number, number];

      if (this.layouts[i]) {
        this.layouts[i].gaps = gaps;
      } else {
        this.layouts.push({
          bs: [],
          gaps: gaps,
        });
      }
    }
    return box;
  }

  private last(ls: Array<SimpleBarrage>, li: number) {
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

  private collisionPrediction(prv: SimpleBarrage, cur: SimpleBarrage) {
    const pw = prv.getWidth();
    const cw = cur.getWidth();
    const ps = prv.getSpeed();
    const cs = cur.getSpeed();

    const acceleration = cs - ps;
    if (acceleration <= 0) return null;

    const distance = prv.getMoveDistance() - cw - pw;
    const meetTime = distance / acceleration;
    if (meetTime >= cur.duration) return null;

    const remainingTime = (1 - prv.getMovePercent()) * prv.duration;
    const currentFixTime = (cw * remainingTime) / this.box.w;
    return remainingTime + currentFixTime;
  }
}
