import { now } from 'aidly';
import { type PlSys, FacileDanmaku, FacileOptions } from './facile';
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
      (plugin as any).name = `__flexible_danmaku_plugin_${ids.f++}__`;
    }
    this.plSys.useRefine(plugin);
    return plugin as DanmakuPlugin<T> & { name: string };
  }

  public remove(pluginName: string) {
    this.plSys.remove(pluginName);
  }

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

  public getMoveDistance() {
    if (!this.moving) return 0;
    const { x } = this.position;
    if (this.direction === 'none') return x;
    const percent = this.getMovePercent();
    return this.direction === 'left'
      ? x + (this.options.box.width - this.position.x) * percent
      : x - (x + this.getWidth()) * percent;
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

  public setStartStatus() {
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
}
