import type { Box, TrackData } from "../exerciser";
import { now, toUpperCase, transitionProp, transitionDuration } from "../utils";

export interface SimpleBarrageOptions {
  box: Box;
  direction: "left" | "right";
  defaultStatus: "hide" | "show";
  delInTrack?: (b: SimpleBarrage) => void;
}

export class SimpleBarrage {
  public paused = true;
  public moving = false;
  public duration = 0;
  public position = { y: 0 };
  public isChangeDuration = false;
  public node: HTMLElement | null = null;
  public trackData: TrackData | null = null;
  public status: "hide" | "show" | null = null;
  public recorder = {
    pauseTime: 0,
    startTime: 0,
    prevPauseTime: 0,
    duration: this.duration,
  };

  public constructor(private options: SimpleBarrageOptions) {
    this.status = options.defaultStatus;
    this.trackData = { bs: [], gaps: [0, 0] };
  }

  get direction() {
    return this.options.direction;
  }

  public getHeight() {
    return (this.node && this.node.clientHeight) || 0;
  }

  public getWidth() {
    return (this.node && this.node.clientWidth) || 0;
  }

  public getMovePercent() {
    const { pauseTime, startTime, prevPauseTime } = this.recorder;
    const ct = this.paused ? prevPauseTime : now();
    return (ct - startTime - pauseTime) / 1000 / this.duration;
  }

  public getMoveDistance() {
    if (!this.moving) return 0;
    const percent = this.getMovePercent();
    return percent * this.options.box.w + this.getWidth();
  }

  public getSpeed() {
    const cw = this.options.box.w + this.getWidth();
    if (this.recorder.duration == null || cw == null) {
      return 0;
    }
    return cw / this.recorder.duration;
  }

  public pause() {
    if (!this.moving || this.paused) return;
    let d = this.getMoveDistance();
    if (Number.isNaN(d)) return;
    this.paused = true;
    this.recorder.prevPauseTime = now();
    if (this.direction === "right") {
      d *= -1;
    }
    this.setStyle(transitionDuration as "transitionDuration", "0s");
    this.setStyle("transform" as "transitionDuration", `translateX(${d}px)`);
  }

  public resume() {
    if (!this.moving || !this.paused) return;
    const cw = this.options.box.w + this.getWidth();
    const isNegative = this.direction === "left" ? 1 : -1;
    const remainingTime = (1 - this.getMovePercent()) * this.duration;

    this.paused = false;
    this.recorder.pauseTime += now() - this.recorder.prevPauseTime;
    this.recorder.prevPauseTime = 0;
    this.recorder.duration = remainingTime;

    this.setStyle(
      transitionDuration as "transitionDuration",
      `${remainingTime}s`,
    );
    this.setStyle("transform", `translateX(${cw * isNegative}px)`);
  }

  public hide() {
    this.status = "hide";
    this.setStyle("visibility", "hidden");
    this.setStyle("pointerEvents", "none");
  }

  public show() {
    this.status = "show";
    this.setStyle("visibility", "visible");
    this.setStyle("pointerEvents", "auto");
  }

  public initStyles() {
    const w = this.getWidth();
    const cw = this.options.box.w + w;
    const isNegative = this.direction === "left" ? 1 : -1;

    this.status === "hide" ? this.hide() : this.show();
    this.setStyle("opacity", "1");
    this.setStyle("transform", `translateX(${isNegative * cw}px)`);
    this.setStyle(
      transitionProp as "transition",
      `transform linear ${this.duration}s`,
    );
    this.setStyle(
      `margin${toUpperCase(this.direction)}` as "marginLeft" | "marginRight",
      `-${w}px`,
    );
  }

  public removeFromContainer() {
    if (!this.node) return;
    const parentNode = this.node.parentNode;
    if (!parentNode) return;
    parentNode.removeChild(this.node);
  }

  public destroy() {
    this.moving = false;
    this.delInTrack();
    this.removeFromContainer();
    this.node = null;
  }

  public reset() {
    this.paused = false;
    this.moving = false;
    this.trackData = null;
    this.position = { y: 0 };
    this.recorder = {
      pauseTime: 0,
      startTime: 0,
      prevPauseTime: 0,
      duration: this.duration,
    };
    this.removeFromContainer();
  }

  public createNode() {
    this.node = document.createElement("div");
  }

  public appendToContainer(container: HTMLElement) {
    if (!this.node) return;
    container.appendChild(this.node);
  }

  public setStyle<
    T extends keyof Omit<CSSStyleDeclaration, "length" | "parentRule">,
  >(key: T, val: CSSStyleDeclaration[T]) {
    if (!this.node) return;
    this.node.style[key] = val;
  }

  private delInTrack() {
    if (!this.trackData) return;
    const { bs } = this.trackData;
    if (bs.length > 0) {
      const i = bs.indexOf(this);
      if (~i) bs.splice(i, 1);
    }
    if (this.options.delInTrack) {
      this.options.delInTrack(this);
    }
  }
}
