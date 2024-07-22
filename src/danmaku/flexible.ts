import { now } from 'aidly';
import { FacileDanmaku, FacileOptions } from './facile';
import { ids, INTERNAL_FLAG, whenTransitionEnds } from '../utils';
import type { Position, DanmakuType, DanmakuPlugin } from '../types';

export interface FlexibleOptions<T> extends FacileOptions<T> {
  position?: Position;
}

export class FlexibleDanmaku<T> extends FacileDanmaku<T> {
  public position: Position;
  public type: DanmakuType = 'flexible';

  public constructor(public options: FlexibleOptions<T>) {
    super(options);
    this.position = options.position || { x: 0, y: 0 };
  }

  public use(plugin: DanmakuPlugin<T> | ((b: this) => DanmakuPlugin<T>)) {
    if (typeof plugin === 'function') plugin = plugin(this);
    if (!plugin.name) {
      (plugin as any).name = `__flexible_danmaku_plugin_${ids.danmu++}__`;
    }
    this.plSys.useRefine(plugin);
    return plugin as DanmakuPlugin<T> & { name: string };
  }

  public remove(pluginName: string) {
    this.plSys.remove(pluginName);
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
        `translateX(${this.getMoveDistance()}px) translateY(${
          this.position.y
        }px)`,
      );
    }
    if (_flag !== INTERNAL_FLAG) {
      this.plSys.lifecycle.pause.emit(this);
    }
  }

  public resume(_flag?: Symbol) {
    if (!this.moving || !this.paused) return;
    this.paused = false;
    this.recorder.pauseTime += now() - this.recorder.prevPauseTime;
    this.recorder.prevPauseTime = 0;
    const remainingTime = (1 - this.getMovePercent()) * this.actualDuration();

    if (this.direction === 'none') {
      if (this.moveTimer) {
        let timer: number | null = setTimeout(
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
        this.direction === 'left' ? this.options.box.width : -this.getWidth();
      this.setStyle('zIndex', '1');
      this.setStyle('transitionDuration', `${remainingTime}ms`);
      this.setStyle(
        'transform',
        `translateX(${ex}px) translateY(${this.position.y}px)`,
      );
    }
    if (_flag !== INTERNAL_FLAG) {
      this.plSys.lifecycle.resume.emit(this);
    }
  }

  /**
   * @internal
   */
  public getSpeed() {
    if (this.direction === 'none') return 0;
    const { duration } = this._originData;
    const cw =
      this.direction === 'right'
        ? this.position.x + this.getWidth()
        : this.position.x;
    return cw / duration;
  }

  /**
   * @internal
   */
  public setOff() {
    return new Promise<void>((resolve) => {
      if (!this.node) {
        this.moving = false;
        this.isEnded = true;
        resolve();
        return;
      }
      const onEnd = () => {
        this.moving = false;
        this.isEnded = true;
        if (this.moveTimer) {
          this.moveTimer.clear();
          this.moveTimer = null;
        }
        this.plSys.lifecycle.moveEnd.emit(this);
        resolve();
      };

      this.moving = true;
      this.recorder.startTime = now();
      this.plSys.lifecycle.moveStart.emit(this);

      if (this.direction === 'none') {
        let timer: number | null = setTimeout(onEnd, this.actualDuration());
        this.moveTimer = {
          cb: onEnd,
          clear() {
            clearTimeout(timer as number);
            timer = null;
          },
        };
      } else {
        const ex =
          this.direction === 'left' ? this.options.box.width : -this.getWidth();
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
  public setStartStatus() {
    this.setStyle('zIndex', '1');
    this.setStyle('transform', '');
    this.setStyle('transition', '');
    this.setStyle('position', 'absolute');
    this.setStyle('opacity', String(this._internalStatuses.opacity));
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
  public updatePosition(p: Partial<Position>) {
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

  public getMovePercent(useOriginData?: boolean) {
    const { pauseTime, startTime, prevPauseTime } = this.recorder;
    const ct = this.paused ? prevPauseTime : now();
    const moveTime = ct - startTime - pauseTime;
    return (
      moveTime /
      (useOriginData
        ? this._originData.duration / this.rate
        : this.actualDuration())
    );
  }

  /**
   * @internal
   */
  public getMoveDistance() {
    if (!this.moving) return 0;
    let d;
    let { x } = this.position;
    const diff = this._originData.width - this.options.box.width;

    if (this.direction === 'none') {
      d = x - diff;
    } else {
      const percent = this.getMovePercent(true);
      if (this.direction === 'left') {
        // When the container changes and the direction of movement is to the right,
        // there is no need for any changes
        d = x + (this.options.box.width - x) * percent;
      } else {
        d = x - (x + this.getWidth()) * percent - diff;
      }
    }
    return d;
  }

  /**
   * @internal
   */
  public format() {
    if (this.direction === 'left') return;
    if (this.direction === 'none') {
      this.setStyle(
        'transform',
        `translateX(${this.getMoveDistance()}px) translateY(${
          this.position.y
        }px)`,
      );
      return;
    }
    const diff = this._originData.width - this.options.box.width;
    const cw = this.position.x + this.getWidth();
    this.fixDuration((cw - diff) / this.getSpeed(), false);

    if (this.paused) {
      this.resume(INTERNAL_FLAG);
      this.pause(INTERNAL_FLAG);
    } else {
      this.pause(INTERNAL_FLAG);
      this.resume(INTERNAL_FLAG);
    }
  }
}
