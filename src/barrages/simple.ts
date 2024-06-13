import { createBarrageLifeCycle } from '../lifeCycle';
import {
  now,
  createId,
  toUpperCase,
  transitionProp,
  transitionDuration,
} from '../utils';
import type {
  Box,
  TrackData,
  ViewStatus,
  Direction,
  InfoRecord,
  SimpleBarragePlugin,
} from '../types';

export interface SimpleBarrageOptions<T> {
  box: Box;
  data: T;
  duration: number;
  direction: Direction;
  defaultStatus: ViewStatus;
  delInTrack?: (b: SimpleBarrage<T>) => void;
}

// The declaration must be displayed,
// otherwise a circular reference error will be reported.
type PlSys<T> = ReturnType<typeof createBarrageLifeCycle<SimpleBarrage<T>>>;

export class SimpleBarrage<T> {
  public data: T;
  public type = 'simple';
  public duration: number;
  public paused = true;
  public moving = false;
  public position = { y: 0 };
  public recorder: InfoRecord;
  public isChangeDuration = false;
  public node: HTMLElement | null = null;
  public trackData: TrackData<T> | null = null;
  private _status: ViewStatus | null = null;
  private _plSys: PlSys<T> = createBarrageLifeCycle<SimpleBarrage<T>>();

  public constructor(private options: SimpleBarrageOptions<T>) {
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

  public use(plugin: SimpleBarragePlugin<T>) {
    plugin.name = plugin.name || `__simple_barrage_plugin_${createId()}__`;
    this._plSys.use(plugin as SimpleBarragePlugin<T> & { name: string });
  }

  public updateTrackData(data: TrackData<T> | null) {
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
    if (this.direction === 'right') {
      d *= -1;
    }
    this.setStyle(transitionDuration as 'transitionDuration', '0s');
    this.setStyle('transform' as 'transitionDuration', `translateX(${d}px)`);
    this._plSys.lifecycle.pause.emit(this);
  }

  public resume() {
    if (!this.moving || !this.paused) return;
    const cw = this.options.box.w + this.getWidth();
    const isNegative = this.direction === 'left' ? 1 : -1;
    const remainingTime = (1 - this.getMovePercent()) * this.duration;

    this.paused = false;
    this.recorder.pauseTime += now() - this.recorder.prevPauseTime;
    this.recorder.prevPauseTime = 0;
    this.recorder.duration = remainingTime;

    this.setStyle(
      transitionDuration as 'transitionDuration',
      `${remainingTime}ms`,
    );
    this.setStyle('transform', `translateX(${cw * isNegative}px)`);
    this._plSys.lifecycle.resume.emit(this);
  }

  public hide() {
    this._status = 'hide';
    this.setStyle('visibility', 'hidden');
    this.setStyle('pointerEvents', 'none');
    this._plSys.lifecycle.hide.emit(this);
  }

  public show() {
    this._status = 'show';
    this.setStyle('visibility', 'visible');
    this.setStyle('pointerEvents', 'auto');
    this._plSys.lifecycle.show.emit(this);
  }

  public initStyles() {
    const w = this.getWidth();
    const cw = this.options.box.w + w;
    const isNegative = this.direction === 'left' ? 1 : -1;

    this._status === 'hide' ? this.hide() : this.show();
    this.setStyle('opacity', '1');
    this.setStyle('transform', `translateX(${isNegative * cw}px)`);
    this.setStyle(
      transitionProp as 'transition',
      `transform linear ${this.duration}ms`,
    );
    this.setStyle(
      `margin${toUpperCase(this.direction)}` as 'marginLeft' | 'marginRight',
      `-${w}px`,
    );
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
    this.delInTrack();
    this.removeNode();
    this._plSys.lifecycle.destroy.emit(this);
    this.node = null;
  }

  public reset() {
    this.removeNode();
    this.node = null;
    this.paused = false;
    this.moving = false;
    this.position = { y: 0 };
    this.updateTrackData(null);
    this.recorder = {
      pauseTime: 0,
      startTime: 0,
      prevPauseTime: 0,
      duration: this.duration,
    };
  }

  public createNode() {
    this._plSys.lock();
    this.node = document.createElement('div');
    this._plSys.lifecycle.createNode.emit(this);
  }

  public appendNode(container: HTMLElement) {
    if (!this.node) return;
    container.appendChild(this.node);
    this._plSys.lifecycle.appendNode.emit(this);
  }

  public setStyle<
    T extends keyof Omit<CSSStyleDeclaration, 'length' | 'parentRule'>,
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
