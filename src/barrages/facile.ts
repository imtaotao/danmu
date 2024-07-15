import { now, remove } from 'aidly';
import type { Box } from '../box';
import { createBarrageLifeCycle } from '../lifeCycle';
import { ids, nextFrame, INTERNAL_FLAG, whenTransitionEnds } from '../utils';
import type {
  PushData,
  Position,
  MoveTimer,
  TrackData,
  Direction,
  InfoRecord,
  Barrage,
  BarrageType,
  BarragePlugin,
  InternalStatuses,
} from '../types';

// The declaration must be displayed,
// otherwise a circular reference error will be reported.
export type PlSys<T> = ReturnType<
  typeof createBarrageLifeCycle<FacileBarrage<T>>
>;

export interface FacileOptions<T> {
  box: Box;
  duration: number;
  data: PushData<T>;
  direction: Direction;
  internalStatuses: InternalStatuses;
  delInTrack: (b: Barrage<T>) => void;
}

export class FacileBarrage<T> {
  public loops = 0;
  public isLoop = false;
  public paused = false;
  public moving = false;
  public isEnded = false;
  public isFixed = false;
  public rate: number;
  public duration: number;
  public data: PushData<T>;
  public recorder: InfoRecord;
  public nextFrame = nextFrame;
  public type: BarrageType = 'facile';
  public node: HTMLElement | null = null;
  public moveTimer: MoveTimer | null = null;
  public position: Position = { x: 0, y: 0 };
  public trackData: TrackData<T> | null = null;
  public plSys: PlSys<T> = createBarrageLifeCycle<FacileBarrage<T>>();
  protected _internalStatuses: InternalStatuses;

  public constructor(public options: FacileOptions<T>) {
    this.data = options.data;
    this.duration = options.duration;
    this.rate = options.internalStatuses.rate;
    this._internalStatuses = options.internalStatuses;
    this.recorder = {
      pauseTime: 0,
      startTime: 0,
      prevPauseTime: 0,
      duration: this.duration,
    };
  }

  get direction() {
    return this.options.direction;
  }

  public setloop() {
    this.isLoop = true;
  }

  public unloop() {
    this.isLoop = false;
  }

  public use(plugin: BarragePlugin<T> | ((b: this) => BarragePlugin<T>)) {
    if (typeof plugin === 'function') plugin = plugin(this);
    if (!plugin.name) {
      plugin.name = `__facile_barrage_plugin_${ids.f++}__`;
    }
    this.plSys.useRefine(plugin);
  }

  public remove(pluginName: string) {
    this.plSys.remove(pluginName);
  }

  public fixDuration(t: number) {
    this.duration = t;
    this.recorder.duration = t;
    this.isFixed = true;
  }

  public updatePosition(p: Partial<Position>) {
    if (typeof p.x === 'number') {
      this.position.x = p.x;
    }
    if (typeof p.y === 'number') {
      this.position.y = p.y;
      this.setStyle('top', `${p.y}px`);
    }
  }

  public updateTrackData(data: TrackData<T> | null) {
    if (data) data.list.push(this);
    this.trackData = data;
  }

  public updateRate(rate: number) {
    this.rate = rate;
    // TODO: ...
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
    return (ct - startTime - pauseTime) / this.duration;
  }

  public getMoveDistance() {
    if (!this.moving) return 0;
    return this.getMovePercent() * this._summaryWidth();
  }

  public getSpeed() {
    const cw = this._summaryWidth();
    if (cw == null) return 0;
    return cw / this.recorder.duration;
  }

  public pause(_flag?: Symbol) {
    if (!this.moving || this.paused) return;
    let d = this.getMoveDistance();
    if (Number.isNaN(d)) return;

    this.paused = true;
    this.recorder.prevPauseTime = now();
    if (this.direction === 'right') {
      d *= -1;
    }
    this.setStyle('zIndex', '2');
    this.setStyle('transform', `translateX(${d}px)`);
    this.setStyle('transitionDuration', '0ms');
    if (_flag !== INTERNAL_FLAG) {
      this.plSys.lifecycle.pause.emit(this);
    }
  }

  public resume(_flag?: Symbol) {
    if (!this.moving || !this.paused) return;
    const cw = this.options.box.width + this.getWidth();
    const isNegative = this.direction === 'left' ? 1 : -1;
    const remainingTime = (1 - this.getMovePercent()) * this.duration;

    this.paused = false;
    this.recorder.pauseTime += now() - this.recorder.prevPauseTime;
    this.recorder.prevPauseTime = 0;
    this.recorder.duration = remainingTime;
    this.setStyle('zIndex', '0');
    this.setStyle('transform', `translateX(${cw * isNegative}px)`);
    this.setStyle('transitionDuration', `${remainingTime}ms`);
    if (_flag !== INTERNAL_FLAG) {
      this.plSys.lifecycle.resume.emit(this);
    }
  }

  public hide(_flag?: Symbol) {
    this.setStyle('visibility', 'hidden');
    this.setStyle('pointerEvents', 'none');
    if (_flag !== INTERNAL_FLAG) {
      this.plSys.lifecycle.hide.emit(this);
    }
  }

  public show(_flag?: Symbol) {
    this.setStyle('visibility', 'visible');
    this.setStyle('pointerEvents', 'auto');
    if (_flag !== INTERNAL_FLAG) {
      this.plSys.lifecycle.show.emit(this);
    }
  }

  public removeNode(_flag?: Symbol) {
    if (!this.node) return;
    const parentNode = this.node.parentNode;
    if (!parentNode) return;
    parentNode.removeChild(this.node);
    if (_flag !== INTERNAL_FLAG) {
      this.plSys.lifecycle.removeNode.emit(this);
    }
  }

  public destroy() {
    this.moving = false;
    this._delInTrack();
    this.removeNode();
    if (this.moveTimer) {
      this.moveTimer.clear();
      this.moveTimer = null;
    }
    this.plSys.lifecycle.destroy.emit(this);
    this.node = null;
  }

  // Clear state and cache, keep node
  public reset() {
    this.paused = false;
    this.moving = false;
    this.position = { x: 0, y: 0 };
    this.removeNode();
    this._delInTrack();
    this.setStartStatus();
    this.setStyle('top', '');
    this.updateTrackData(null);
    if (this.moveTimer) {
      this.moveTimer.clear();
      this.moveTimer = null;
    }
    this.recorder = {
      pauseTime: 0,
      startTime: 0,
      prevPauseTime: 0,
      duration: this.duration,
    };
  }

  public createNode() {
    if (this.node) return;
    this.node = document.createElement('div');
    this.setStartStatus();
    this.plSys.lifecycle.createNode.emit(this);
  }

  public appendNode(container: HTMLElement) {
    if (!this.node || this.node.parentNode === container) return;
    container.appendChild(this.node);
    this.plSys.lifecycle.appendNode.emit(this);
  }

  public setStyle<
    T extends keyof Omit<CSSStyleDeclaration, 'length' | 'parentRule'>,
  >(key: T, val: CSSStyleDeclaration[T]) {
    if (!this.node) return;
    this.node.style[key] = val;
  }

  public setOff() {
    return new Promise<void>((resolve) => {
      if (!this.node) {
        this.moving = false;
        this.isEnded = true;
        resolve();
        return;
      }
      const w = this.getWidth();
      const cw = this.options.box.width + w;
      const isNegative = this.direction === 'left' ? 1 : -1;

      this._internalStatuses.viewStatus === 'hide'
        ? this.hide(INTERNAL_FLAG)
        : this.show(INTERNAL_FLAG);
      this.setStyle('opacity', '');
      this.setStyle('transform', `translateX(${isNegative * cw}px)`);
      this.setStyle('transition', `transform linear ${this.duration}ms`);
      if (this.direction !== 'none') {
        this.setStyle(this.direction, `-${w}px`);
      }
      this.moving = true;
      this.recorder.startTime = now();
      this.plSys.lifecycle.moveStart.emit(this);
      whenTransitionEnds(this.node).then(() => {
        this.moving = false;
        this.isEnded = true;
        this.plSys.lifecycle.moveEnd.emit(this);
        resolve();
      });
    });
  }

  public setStartStatus() {
    this._internalStatuses.viewStatus === 'hide'
      ? this.hide(INTERNAL_FLAG)
      : this.show(INTERNAL_FLAG);
    this.setStyle('zIndex', '0');
    this.setStyle('opacity', '0');
    this.setStyle('transform', '');
    this.setStyle('transition', '');
    this.setStyle('position', 'absolute');
    this.setStyle('top', `${this.position.y}px`);
    if (this.direction !== 'none') {
      this.setStyle(this.direction, '0');
    }
  }

  private _summaryWidth() {
    return this.options.box.width + this.getWidth();
  }

  protected _delInTrack() {
    if (!this.trackData) return;
    remove(this.trackData.list, this);
    this.options.delInTrack(this);
  }
}
