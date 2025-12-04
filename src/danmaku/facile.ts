import { now } from 'aidly';
import type { Track } from '../track';
import type { Container } from '../container';
import {
  createDanmakuLifeCycle,
  type createManagerLifeCycle,
  hasAnyRealListeners,
} from '../lifeCycle';
import { ids, nextFrame, INTERNAL_FLAG, whenTransitionEnds } from '../utils';
import type {
  Speed,
  StyleKey,
  Position,
  MoveTimer,
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
  progress?: number;
  data: T;
  rate: number;
  speed: Speed;
  duration: number;
  direction: Direction;
  container: Container;
  internalStatuses: InternalStatuses;
  delInTrack: (b: Danmaku<T>) => void;
  managerPluginSystem?: ReturnType<typeof createManagerLifeCycle<T>>;
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
  public track: Track<T> | null = null;
  public node: HTMLElement | null = null;
  public moveTimer: MoveTimer | null = null;
  public position: Position = { x: 0, y: 0 };
  public pluginSystem: PluginSystem<Danmaku<T>> =
    createDanmakuLifeCycle<Danmaku<T>>();

  protected _internalStatuses: InternalStatuses;
  protected _initData: { width: number; duration: number };
  protected _hasReachedEdge = false;

  public constructor(public _options: FacileOptions<T>) {
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
  protected _delInTrack() {
    this._options.delInTrack(this);
    if (this.track) {
      this.track._remove(this);
    }
  }

  /**
   * @internal
   */
  public _summaryWidth() {
    return this._options.container.width + this.getWidth();
  }

  /**
   * @internal
   */
  public _getMovePercent() {
    const { pauseTime, startTime, prevPauseTime } = this.recorder;
    const ct = this.paused ? prevPauseTime : now();
    const movePercent = (ct - startTime - pauseTime) / this.actualDuration();
    if (this._options.progress && this._options.progress > 0) {
      return movePercent + this._options.progress;
    }
    return movePercent;
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
    this.pluginSystem.lifecycle.createNode.emit(this, this.node);
  }

  /**
   * @internal
   */
  public _appendNode(container: HTMLElement) {
    if (!this.node || this.node.parentNode === container) return;
    container.appendChild(this.node);
    this.pluginSystem.lifecycle.appendNode.emit(this, this.node);
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
      this.pluginSystem.lifecycle.removeNode.emit(this, this.node);
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

      const actualDuration = this.actualDuration();
      this.setStyle('transform', `translateX(${negative * cw}px)`);
      this.setStyle('transition', `transform linear ${actualDuration}ms`);

      if (this._options.progress && this._options.progress > 0) {
        const remainingTime = this._options.progress * actualDuration;
        this.setStyle('transitionDelay', `${-1 * remainingTime}ms`);
      }

      if (this.direction !== 'none') {
        this.setStyle(this.direction, `-${w}px`);
      }
      this.moving = true;
      this.recorder.startTime = now();
      this.pluginSystem.lifecycle.beforeMove.emit(this);

      if (this.direction !== 'none') {
        this._hasReachedEdge = false;
        this._monitorEdge();
      }

      whenTransitionEnds(this.node).then(() => {
        this.loops++;
        this.moving = false;
        this.isEnded = true;
        this.pluginSystem.lifecycle.moved.emit(this);
        resolve();
      });
    });
  }

  /**
   * @internal
   */
  protected _monitorEdge() {
    if (!this.node || !this.moving) return;

    // Check if there are any real user listeners interested in edge detection:
    // 1. Danmaku instance listeners: Could be from push({ plugin: { reachEdge() {} } })
    // 2. Manager listeners: Could be from create({ plugin: { $reachEdge() {} } })
    if (
      !hasAnyRealListeners(
        this.pluginSystem.lifecycle.reachEdge,
        this._options.managerPluginSystem,
        '$reachEdge',
      )
    )
      return;

    const check = () => {
      if (this._hasReachedEdge || !this.moving || this.paused || !this.node)
        return;

      const containerRect =
        this._options.container.node?.getBoundingClientRect();

      if (!containerRect) return;

      const rect = this.node.getBoundingClientRect();

      // Edge detection logic:
      // 1. direction === 'left': danmaku moves from left to right, detect when right edge touches container's right edge
      //    - Initial position: danmaku starts outside container left side (left: -${width}px)
      //    - Moves right via translateX, triggers when rect.right approaches containerRect.right
      //    - Condition: rect.right >= containerRect.right - threshold
      //
      // 2. direction === 'right': danmaku moves from right to left, detect when left edge touches container's left edge
      //    - Initial position: danmaku starts outside container right side (right: -${width}px)
      //    - Moves left via translateX, triggers when rect.left approaches containerRect.left
      //    - Condition: rect.left <= containerRect.left + threshold
      //
      // threshold: Set to 1px to provide a tolerance range
      //    - Due to animation frame rate and floating point precision, danmaku position might skip exact edge values
      //    - Using threshold ensures the event triggers when danmaku is near the edge (±1px), preventing missed detections
      const threshold = 1;
      const hasReached =
        this.direction === 'left'
          ? rect.right >= containerRect.right - threshold
          : rect.left <= containerRect.left + threshold;

      if (hasReached) {
        this._hasReachedEdge = true;
        this.pluginSystem.lifecycle.reachEdge.emit(this);
        return;
      }

      requestAnimationFrame(check);
    };

    // Execute check immediately to avoid missing edge detection due to `requestAnimationFrame` delay
    check();
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
  public _updateTrack(track: Track<T> | null) {
    this.track = track;
    if (track) {
      track._add(this);
    }
  }

  /**
   * @internal
   */
  public _updateDuration(duration: number, updateInitData = true) {
    this.isFixedDuration = true;
    this.duration = duration;
    if (updateInitData) {
      this._initData.duration = duration;
    }
  }

  /**
   * @internal
   */
  public _format(oldWidth: number, oldHeight: number, newTrack: Track<T>) {
    if (this.isEnded) {
      this.destroy();
      return;
    }
    // Don't let the rendering of danmaku exceed the container
    if (
      this._options.container.height !== oldHeight &&
      this.getHeight() + newTrack.location.bottom >
        this._options.container.height
    ) {
      this.destroy();
      return;
    }
    // As the x-axis varies, the motion area of danmu also changes
    if (this._options.container.width !== oldWidth) {
      const { width, duration } = this._initData;
      const speed = (width + this.getWidth()) / duration;
      this._updateDuration(this._summaryWidth() / speed, false);
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
    this._updateTrack(null);
    this.setStyle('top', '');
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
    this.setStyle('transitionDelay', '');

    if (this.direction !== 'none' && !this._hasReachedEdge) {
      this._monitorEdge();
    }

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

  public async destroy(mark?: unknown) {
    await this.pluginSystem.lifecycle.beforeDestroy.emit(this, mark);
    this.moving = false;
    this._delInTrack();
    this._removeNode();
    if (this.moveTimer) {
      this.moveTimer.clear();
      this.moveTimer = null;
    }
    this.pluginSystem.lifecycle.destroyed.emit(this, mark);
    this.node = null;
  }

  public setStyle<T extends StyleKey>(key: T, val: CSSStyleDeclaration[T]) {
    if (!this.node) return;
    this.node.style[key] = val;
  }

  public remove(pluginName: string) {
    this.pluginSystem.remove(pluginName);
  }

  public use(plugin: DanmakuPlugin<T> | ((danmaku: this) => DanmakuPlugin<T>)) {
    if (typeof plugin === 'function') plugin = plugin(this);
    if (!plugin.name) {
      plugin.name = `__facile_danmaku_plugin_${ids.danmu++}__`;
    }
    this.pluginSystem.useRefine(plugin);
    return plugin as DanmakuPlugin<T> & { name: string };
  }
}
