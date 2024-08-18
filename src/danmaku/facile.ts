import { now, remove } from 'aidly';
import type { Container } from '../container';
import { createDanmakuLifeCycle } from '../lifeCycle';
import { ids, nextFrame, INTERNAL_FLAG, whenTransitionEnds } from '../utils';
import type {
  StyleKey,
  Position,
  MoveTimer,
  TrackData,
  Direction,
  InfoRecord,
  Danmaku,
  DanmakuType,
  DanmakuPlugin,
  InternalStatuses,
} from '../types';

// The declaration must be displayed,
// otherwise a circular reference error will be reported.
export type PluginSystem<D extends Danmaku<any>> = ReturnType<
  typeof createDanmakuLifeCycle<D>
>;

export interface FacileOptions<T> {
  data: T;
  rate: number;
  duration: number;
  direction: Direction;
  container: Container;
  internalStatuses: InternalStatuses;
  delInTrack: (b: Danmaku<T>) => void;
}

export class FacileDanmaku<T> {
  public data: T;
  public loops = 0;
  public isLoop = false;
  public paused = false;
  public moving = false;
  public isEnded = false;
  public isFixedDuration = false;
  public rate: number;
  public duration: number;
  public recorder: InfoRecord;
  public nextFrame = nextFrame;
  public type: DanmakuType = 'facile';
  public node: HTMLElement | null = null;
  public moveTimer: MoveTimer | null = null;
  public position: Position = { x: 0, y: 0 };
  public trackData: TrackData<T> | null = null;
  public pluginSystem: PluginSystem<Danmaku<T>> =
    createDanmakuLifeCycle<Danmaku<T>>();
  protected _internalStatuses: InternalStatuses;
  protected _initData: { width: number; duration: number };

  public constructor(protected _options: FacileOptions<T>) {
    this.data = _options.data;
    this.rate = _options.rate;
    this.duration = _options.duration;
    this._internalStatuses = _options.internalStatuses;
    this._initData = {
      duration: _options.duration,
      width: _options.container.width,
    };
    this.recorder = {
      pauseTime: 0,
      startTime: 0,
      prevPauseTime: 0,
    };
  }

  /**
   * @internal
   */
  protected _summaryWidth() {
    return this._options.container.width + this.getWidth();
  }

  /**
   * @internal
   */
  protected _delInTrack() {
    this._options.delInTrack(this);
    if (this.trackData) {
      remove(this.trackData.list, this);
    }
  }

  /**
   * @internal
   */
  public _getMovePercent() {
    const { pauseTime, startTime, prevPauseTime } = this.recorder;
    const ct = this.paused ? prevPauseTime : now();
    return (ct - startTime - pauseTime) / this.actualDuration();
  }

  /**
   * @internal
   */
  public _getMoveDistance() {
    if (!this.moving) return 0;
    return this._getMovePercent() * this._summaryWidth();
  }

  /**
   * @internal
   */
  public _getSpeed() {
    const cw = this._summaryWidth();
    if (cw == null) return 0;
    return cw / this.actualDuration();
  }

  /**
   * @internal
   */
  public _createNode() {
    if (this.node) return;
    this.node = document.createElement('div');
    this._setStartStatus();
    (this.node as any).__danmaku__ = this;
    this.pluginSystem.lifecycle.createNode.emit(this);
  }

  /**
   * @internal
   */
  public _appendNode(container: HTMLElement) {
    if (!this.node || this.node.parentNode === container) return;
    container.appendChild(this.node);
    this.pluginSystem.lifecycle.appendNode.emit(this);
  }

  /**
   * @internal
   */
  public _removeNode(_flag?: Symbol) {
    if (!this.node) return;
    const parentNode = this.node.parentNode;
    if (!parentNode) return;
    parentNode.removeChild(this.node);
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.removeNode.emit(this);
    }
  }

  /**
   * @internal
   */
  public _setOff() {
    return new Promise<void>((resolve) => {
      if (!this.node) {
        this.moving = false;
        this.isEnded = true;
        resolve();
        return;
      }
      for (const key in this._internalStatuses.styles) {
        this.setStyle(key as StyleKey, this._internalStatuses.styles[key]);
      }
      const w = this.getWidth();
      const cw = this._options.container.width + w;
      const negative = this.direction === 'left' ? 1 : -1;

      this._internalStatuses.viewStatus === 'hide'
        ? this.hide(INTERNAL_FLAG)
        : this.show(INTERNAL_FLAG);
      this.setStyle('transform', `translateX(${negative * cw}px)`);
      this.setStyle(
        'transition',
        `transform linear ${this.actualDuration()}ms`,
      );
      if (this.direction !== 'none') {
        this.setStyle(this.direction, `-${w}px`);
      }
      this.moving = true;
      this.recorder.startTime = now();
      this.pluginSystem.lifecycle.moveStart.emit(this);
      whenTransitionEnds(this.node).then(() => {
        this.loops++;
        this.moving = false;
        this.isEnded = true;
        this.pluginSystem.lifecycle.moveEnd.emit(this);
        resolve();
      });
    });
  }

  /**
   * @internal
   */
  public _setStartStatus() {
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

  /**
   * @internal
   */
  public _updatePosition(p: Partial<Position>) {
    if (typeof p.x === 'number') {
      this.position.x = p.x;
    }
    if (typeof p.y === 'number') {
      this.position.y = p.y;
      this.setStyle('top', `${p.y}px`);
    }
  }

  /**
   * @internal
   */
  public _updateTrackData(data: TrackData<T> | null) {
    if (data) data.list.push(this);
    this.trackData = data;
  }

  /**
   * @internal
   */
  public _format(oldWidth: number, oldHeight: number, newTrack: TrackData<T>) {
    if (this.isEnded) {
      this.destroy();
      return;
    }
    // Don't let the rendering of danmaku exceed the container
    if (
      this._options.container.height !== oldHeight &&
      this.getHeight() + newTrack.location[2] > this._options.container.height
    ) {
      this.destroy();
      return;
    }
    // As the x-axis varies, the motion area of danmu also changes
    if (this._options.container.width !== oldWidth) {
      const { width, duration } = this._initData;
      const speed = (width + this.getWidth()) / duration;
      this.updateDuration(this._summaryWidth() / speed, false);
      if (!this.paused) {
        this.pause(INTERNAL_FLAG);
        this.resume(INTERNAL_FLAG);
      }
    }
  }

  /**
   * @internal
   */
  public _reset() {
    this.loops = 0;
    this.paused = false;
    this.moving = false;
    this.position = { x: 0, y: 0 };
    this._removeNode();
    this._delInTrack();
    this._setStartStatus();
    this.setStyle('top', '');
    this._updateTrackData(null);
    if (this.moveTimer) {
      this.moveTimer.clear();
      this.moveTimer = null;
    }
    this.recorder = {
      pauseTime: 0,
      startTime: 0,
      prevPauseTime: 0,
    };
    this._initData = {
      duration: this._options.duration,
      width: this._options.container.width,
    };
  }

  public get direction() {
    return this._options.direction;
  }

  // When our total distance remains constant,
  // acceleration is inversely proportional to time.
  public actualDuration() {
    return this.duration / this.rate;
  }

  public setloop() {
    this.isLoop = true;
  }

  public unloop() {
    this.isLoop = false;
  }

  public getHeight() {
    return (this.node && this.node.clientHeight) || 0;
  }

  public getWidth() {
    return (this.node && this.node.clientWidth) || 0;
  }

  public pause(_flag?: Symbol) {
    if (!this.moving || this.paused) return;
    let d = this._getMoveDistance();
    if (Number.isNaN(d)) return;
    const negative = this.direction === 'left' ? 1 : -1;

    this.paused = true;
    this.recorder.prevPauseTime = now();
    this.setStyle('zIndex', '2');
    this.setStyle('transitionDuration', '0ms');
    this.setStyle('transform', `translateX(${d * negative}px)`);
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.pause.emit(this);
    }
  }

  public resume(_flag?: Symbol) {
    if (!this.moving || !this.paused) return;
    const cw = this._summaryWidth();
    const negative = this.direction === 'left' ? 1 : -1;
    const remainingTime = (1 - this._getMovePercent()) * this.actualDuration();

    this.paused = false;
    this.recorder.pauseTime += now() - this.recorder.prevPauseTime;
    this.recorder.prevPauseTime = 0;
    this.setStyle('zIndex', '0');
    this.setStyle('transitionDuration', `${remainingTime}ms`);
    this.setStyle('transform', `translateX(${cw * negative}px)`);
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.resume.emit(this);
    }
  }

  public hide(_flag?: Symbol) {
    this.setStyle('visibility', 'hidden');
    this.setStyle('pointerEvents', 'none');
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.hide.emit(this);
    }
  }

  public show(_flag?: Symbol) {
    this.setStyle('visibility', 'visible');
    this.setStyle('pointerEvents', 'auto');
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.show.emit(this);
    }
  }

  public destroy(mark?: unknown) {
    this.moving = false;
    this._delInTrack();
    this._removeNode();
    if (this.moveTimer) {
      this.moveTimer.clear();
      this.moveTimer = null;
    }
    this.pluginSystem.lifecycle.destroy.emit(this, mark);
    this.node = null;
  }

  public updateDuration(duration: number, updateInitData = true) {
    this.isFixedDuration = true;
    this.duration = duration;
    if (updateInitData) {
      this._initData.duration = duration;
    }
  }

  public setStyle<T extends StyleKey>(key: T, val: CSSStyleDeclaration[T]) {
    if (!this.node) return;
    this.node.style[key] = val;
  }

  public remove(pluginName: string) {
    this.pluginSystem.remove(pluginName);
  }

  public use(plugin: DanmakuPlugin<T> | ((d: this) => DanmakuPlugin<T>)) {
    if (typeof plugin === 'function') plugin = plugin(this);
    if (!plugin.name) {
      plugin.name = `__facile_danmaku_plugin_${ids.danmu++}__`;
    }
    this.pluginSystem.useRefine(plugin);
    return plugin as DanmakuPlugin<T> & { name: string };
  }
}
