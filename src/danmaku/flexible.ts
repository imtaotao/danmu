import { now } from 'aidly';
import { FacileDanmaku, FacileOptions } from './facile';
import { ids, INTERNAL_FLAG, whenTransitionEnds } from '../utils';
import type { StyleKey, Position, DanmakuType, DanmakuPlugin } from '../types';

export interface FlexibleOptions<T> extends FacileOptions<T> {
  position?: Position;
}

export class FlexibleDanmaku<T> extends FacileDanmaku<T> {
  public position: Position;
  public type: DanmakuType = 'flexible';

  public constructor(protected _options: FlexibleOptions<T>) {
    super(_options);
    this.position = _options.position || { x: 0, y: 0 };
  }

  /**
   * @internal
   */
  public _getSpeed() {
    if (this.direction === 'none') return 0;
    const { duration } = this._initData;
    const cw =
      this.direction === 'right'
        ? this.position.x + this.getWidth()
        : this.position.x;
    return cw / duration;
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
      const onEnd = () => {
        this.loops++;
        this.moving = false;
        this.isEnded = true;
        if (this.moveTimer) {
          this.moveTimer.clear();
          this.moveTimer = null;
        }
        this.pluginSystem.lifecycle.moveEnd.emit(this);
        resolve();
      };

      for (const key in this._internalStatuses.styles) {
        this.setStyle(key as StyleKey, this._internalStatuses.styles[key]);
      }
      this.moving = true;
      this.recorder.startTime = now();
      this.pluginSystem.lifecycle.moveStart.emit(this);

      if (this.direction === 'none') {
        let timer: unknown | null = setTimeout(onEnd, this.actualDuration());
        this.moveTimer = {
          cb: onEnd,
          clear() {
            clearTimeout(timer as number);
            timer = null;
          },
        };
      } else {
        const ex =
          this.direction === 'left'
            ? this._options.container.width
            : -this.getWidth();
        this.setStyle(
          'transition',
          `transform linear ${this.actualDuration()}ms`,
        );
        this.setStyle(
          'transform',
          `translateX(${ex}px) translateY(${this.position.y}px)`,
        );
        whenTransitionEnds(this.node).then(onEnd);
      }
    });
  }

  /**
   * @internal
   */
  public _setStartStatus() {
    this.setStyle('zIndex', '1');
    this.setStyle('transform', '');
    this.setStyle('transition', '');
    this.setStyle('position', 'absolute');
    this.setStyle(
      'transform',
      `translateX(${this.position.x}px) translateY(${this.position.y}px)`,
    );
    this._internalStatuses.viewStatus === 'hide'
      ? this.hide(INTERNAL_FLAG)
      : this.show(INTERNAL_FLAG);
  }

  /**
   * @internal
   */
  public _updatePosition(p: Partial<Position>) {
    let needUpdateStyle = false;
    if (typeof p.x === 'number') {
      this.position.x = p.x;
      needUpdateStyle = true;
    }
    if (typeof p.y === 'number') {
      this.position.y = p.y;
      needUpdateStyle = true;
    }
    if (needUpdateStyle) {
      this.setStyle(
        'transform',
        `translateX(${this.position.x}px) translateY(${this.position.y}px)`,
      );
    }
  }

  /**
   * @internal
   */
  public _getMovePercent(useInitData?: boolean) {
    const { pauseTime, startTime, prevPauseTime } = this.recorder;
    const ct = this.paused ? prevPauseTime : now();
    const moveTime = ct - startTime - pauseTime;
    return (
      moveTime /
      (useInitData
        ? this._initData.duration / this.rate
        : this.actualDuration())
    );
  }

  /**
   * @internal
   */
  public _getMoveDistance() {
    if (!this.moving) return 0;
    let d;
    let { x } = this.position;
    const diff = this._initData.width - this._options.container.width;

    if (this.direction === 'none') {
      d = x - diff;
    } else {
      const percent = this._getMovePercent(true);
      if (this.direction === 'left') {
        // When the container changes and the direction of movement is to the right,
        // there is no need for any changes
        d = x + (this._options.container.width - x) * percent;
      } else {
        d = x - (x + this.getWidth()) * percent - diff;
      }
    }
    return d;
  }

  /**
   * @internal
   */
  public _format() {
    if (this.direction === 'left') return;
    if (this.direction === 'none') {
      this.setStyle(
        'transform',
        `translateX(${this._getMoveDistance()}px) translateY(${
          this.position.y
        }px)`,
      );
      return;
    }
    const diff = this._initData.width - this._options.container.width;
    const cw = this.position.x + this.getWidth();
    this.updateDuration((cw - diff) / this._getSpeed(), false);

    if (this.paused) {
      this.resume(INTERNAL_FLAG);
      this.pause(INTERNAL_FLAG);
    } else {
      this.pause(INTERNAL_FLAG);
      this.resume(INTERNAL_FLAG);
    }
  }

  public pause(_flag?: Symbol) {
    if (!this.moving || this.paused) return;
    this.paused = true;
    this.recorder.prevPauseTime = now();

    if (this.direction === 'none') {
      if (this.moveTimer) this.moveTimer.clear();
    } else {
      this.setStyle('zIndex', '3');
      this.setStyle('transitionDuration', '0ms');
      this.setStyle(
        'transform',
        `translateX(${this._getMoveDistance()}px) translateY(${
          this.position.y
        }px)`,
      );
    }
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.pause.emit(this);
    }
  }

  public resume(_flag?: Symbol) {
    if (!this.moving || !this.paused) return;
    this.paused = false;
    this.recorder.pauseTime += now() - this.recorder.prevPauseTime;
    this.recorder.prevPauseTime = 0;
    const remainingTime = (1 - this._getMovePercent()) * this.actualDuration();

    if (this.direction === 'none') {
      if (this.moveTimer) {
        let timer: unknown | null = setTimeout(
          this.moveTimer.cb || (() => {}),
          remainingTime,
        );
        this.moveTimer.clear = () => {
          clearTimeout(timer as number);
          timer = null;
        };
      }
    } else {
      const ex =
        this.direction === 'left'
          ? this._options.container.width
          : -this.getWidth();
      this.setStyle('zIndex', '1');
      this.setStyle('transitionDuration', `${remainingTime}ms`);
      this.setStyle(
        'transform',
        `translateX(${ex}px) translateY(${this.position.y}px)`,
      );
    }
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.resume.emit(this);
    }
  }

  public remove(pluginName: string) {
    this.pluginSystem.remove(pluginName);
  }

  public use(plugin: DanmakuPlugin<T> | ((danmaku: this) => DanmakuPlugin<T>)) {
    if (typeof plugin === 'function') plugin = plugin(this);
    if (!plugin.name) {
      (plugin as any).name = `__flexible_danmaku_plugin_${ids.danmu++}__`;
    }
    this.pluginSystem.useRefine(plugin);
    return plugin as DanmakuPlugin<T> & { name: string };
  }
}
