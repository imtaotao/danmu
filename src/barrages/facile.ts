import { now, remove } from 'aidly';
import { createBarrageLifeCycle } from '../lifeCycle';
import { ids, NO_EMIT, whenTransitionEnds } from '../utils';
import type {
  Box,
  Position,
  MoveTimer,
  TrackData,
  ViewStatus,
  Direction,
  InfoRecord,
  Barrage,
  BarrageType,
  BarragePlugin,
} from '../types';

// The declaration must be displayed,
// otherwise a circular reference error will be reported.
export type PlSys<T> = ReturnType<
  typeof createBarrageLifeCycle<FacileBarrage<T>>
>;

export interface FacileOptions<T> {
  box: Box;
  data: T;
  duration: number;
  direction: Direction;
  defaultStatus: ViewStatus;
  delInTrack: (b: Barrage<T>) => void;
}

export class FacileBarrage<T> {
  public data: T;
  public loops = 0;
  public isLoop = false;
  public paused = false;
  public moving = false;
  public isEnded = false;
  public isFixed = false;
  public duration: number;
  public recorder: InfoRecord;
  public type: BarrageType = 'facile';
  public node: HTMLElement | null = null;
  public moveTimer: MoveTimer | null = null;
  public position: Position = { x: 0, y: 0 };
  public trackData: TrackData<T> | null = null;
  protected _status: ViewStatus | null = null;
  protected _plSys: PlSys<T> = createBarrageLifeCycle<FacileBarrage<T>>();

  public constructor(public options: FacileOptions<T>) {
    this.data = options.data;
    this.duration = options.duration;
    this._status = options.defaultStatus;
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

  public use(plugin: BarragePlugin<T>) {
    plugin.name = plugin.name || `__facile_barrage_plugin_${ids.f++}__`;
    this._plSys.use(plugin as BarragePlugin<T> & { name: string });
  }

  public fixDuration(t: number) {
    this.duration = t;
    this.recorder.duration = t;
    this.isFixed = true;
  }

  public setloop() {
    this.isLoop = true;
  }

  public unloop() {
    this.isLoop = false;
  }

  public updatePosition(p: Partial<Position>) {
    if (typeof p.x === 'number') this.position.x = p.x;
    if (typeof p.y === 'number') {
      this.position.y = p.y;
      this.setStyle('top', `${p.y}px`);
    }
  }

  public updateTrackData(data: TrackData<T> | null) {
    if (data) data.list.push(this);
    this.trackData = data;
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

  public pause() {
    if (!this.moving || this.paused) return;
    let d = this.getMoveDistance();
    if (Number.isNaN(d)) return;

    this.paused = true;
    this.recorder.prevPauseTime = now();
    if (this.direction === 'right') {
      d *= -1;
    }
    this.setStyle('zIndex', '3');
    this.setStyle('transform', `translateX(${d}px)`);
    this.setStyle('transitionDuration', '0ms');
    this._plSys.lifecycle.pause.emit(this);
  }

  public resume() {
    if (!this.moving || !this.paused) return;
    const cw = this.options.box.width + this.getWidth();
    const isNegative = this.direction === 'left' ? 1 : -1;
    const remainingTime = (1 - this.getMovePercent()) * this.duration;

    this.paused = false;
    this.recorder.pauseTime += now() - this.recorder.prevPauseTime;
    this.recorder.prevPauseTime = 0;
    this.recorder.duration = remainingTime;
    this.setStyle('zIndex', '1');
    this.setStyle('transform', `translateX(${cw * isNegative}px)`);
    this.setStyle('transitionDuration', `${remainingTime}ms`);
    this._plSys.lifecycle.resume.emit(this);
  }

  public hide(_flag?: Symbol) {
    this._status = 'hide';
    this.setStyle('visibility', 'hidden');
    this.setStyle('pointerEvents', 'none');
    if (_flag !== NO_EMIT) {
      this._plSys.lifecycle.hide.emit(this);
    }
  }

  public show(_flag?: Symbol) {
    this._status = 'show';
    this.setStyle('visibility', 'visible');
    this.setStyle('pointerEvents', 'auto');
    if (_flag !== NO_EMIT) {
      this._plSys.lifecycle.show.emit(this);
    }
  }

  public removeNode() {
    if (!this.node) return;
    const parentNode = this.node.parentNode;
    if (!parentNode) return;
    parentNode.removeChild(this.node);
    this._plSys.lifecycle.removeNode.emit(this);
  }

  public destroy() {
    this.moving = false;
    this._delInTrack();
    this.removeNode();
    if (this.moveTimer) {
      this.moveTimer.clear();
      this.moveTimer = null;
    }
    this._plSys.lifecycle.destroy.emit(this);
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
    this._plSys.lock();
    this.setStartStatus();
    this._plSys.lifecycle.createNode.emit(this);
  }

  public appendNode(container: HTMLElement) {
    if (!this.node || this.node.parentNode === container) return;
    container.appendChild(this.node);
    this._plSys.lifecycle.appendNode.emit(this);
  }

  public exportSnapshot() {}

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

      this._status === 'hide' ? this.hide(NO_EMIT) : this.show(NO_EMIT);
      this.setStyle('opacity', '1');
      this.setStyle('transform', `translateX(${isNegative * cw}px)`);
      this.setStyle('transition', `transform linear ${this.duration}ms`);
      if (this.direction !== 'none') {
        this.setStyle(this.direction, `-${w}px`);
      }
      this.moving = true;
      this.recorder.startTime = now();
      this._plSys.lifecycle.moveStart.emit(this);
      whenTransitionEnds(this.node).then(() => {
        this.moving = false;
        this.isEnded = true;
        this._plSys.lifecycle.moveEnd.emit(this);
        resolve();
      });
    });
  }

  public setStartStatus() {
    this._status === 'hide' ? this.hide(NO_EMIT) : this.show(NO_EMIT);
    this.setStyle('zIndex', '1');
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
