import type { Manager } from "./manager";
import type { SimpleBarrage } from "./barrages/simple";
import {
  isRange,
  toNumber,
  nextFrame,
  toUpperCase,
  transitionProp,
  whenTransitionEnds,
} from "./utils";

export interface TrackData {
  bs: Array<SimpleBarrage>;
  gaps: [number, number];
}

export interface AlgorithmOptions {
  rowGap: number;
  height: number;
  isShow: number;
  times: [number, number];
  forceRender: boolean;
  container: HTMLElement;
}

export class MoveAlgorithm {
  private rows = 0;
  private layouts = [] as Array<TrackData>;
  private box: { w: number; h: number; el: HTMLElement };

  public constructor(private options: AlgorithmOptions) {
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

  public emit(cur: SimpleBarrage, context: Manager<unknown>) {
    return new Promise((resolve) => {
      const { isShow } = this.options;
      const node = cur.node;
      const prv = this.last(cur.trackData.bs, 1);
      cur.setStyle("top", `${cur.position.y}px`);

      nextFrame(() => {
        const w = cur.getWidth();
        const cw = this.box.w + w;
        const isNegative = cur.direction === "left" ? 1 : -1;

        if (prv && prv.moving && !prv.paused && this.options.rowGap > 0) {
          const ft = this.collisionPrediction(prv, cur);
          if (ft !== null) {
            if (isRange(this.options.times, ft)) {
              cur.duration = ft;
              cur.recorder.cd = ft;
              cur.isChangeDuration = true;
            } else {
              cur.reset();
              cur.setStyle("top", null);
              context.bs.s.unshift(cur);
              return;
            }
          }
        }
        cur.setStyle("opacity", "1");
        cur.setStyle("pointerEvents", isShow ? "auto" : "none");
        cur.setStyle("visibility", isShow ? "visible" : "hidden");
        cur.setStyle("transform", `translateX(${isNegative * cw}px)`);
        cur.setStyle(
          transitionProp as "transition",
          `transform linear ${cur.duration}s`,
        );
        cur.setStyle(
          `margin${toUpperCase(cur.direction)}` as "marginLeft" | "marginRight",
          `-${w}px`,
        );
        cur.moving = true;
        cur.recorder.st = Date.now();
        resolve(whenTransitionEnds(node));
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
    const ps = prv.getSpeed();
    const cw = cur.getWidth();
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
