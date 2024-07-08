import { now } from 'aidly';
import { FacileBarrage, FacileOptions } from './facile';
import { ids, INTERNAL_FLAG, whenTransitionEnds } from '../utils';
import type { Position, BarrageType, BarragePlugin } from '../types';

export interface FlexibleOptions<T> extends FacileOptions<T> {
  position: Position;
}

export class FlexibleBarrage<T> extends FacileBarrage<T> {
  public type: BarrageType = 'flexible';
  public position: Position;

  public constructor(public options: FlexibleOptions<T>) {
    super(options);
    this.position = options.position;
  }

  public use(plugin: BarragePlugin<T> | ((b: this) => BarragePlugin<T>)) {
    if (typeof plugin === 'function') plugin = plugin(this);
    if (!plugin.name) {
      (plugin as any).name = `__flexible_barrage_plugin_${ids.f++}__`;
    }
    this.plSys.use(plugin as BarragePlugin<T> & { name: string });
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

  public pause() {
    if (!this.moving || this.paused) return;
    this.paused = true;
    this.recorder.prevPauseTime = now();

    if (this.direction === 'none') {
      if (this.moveTimer) this.moveTimer.clear();
    } else {
      this.setStyle('zIndex', '2');
      this.setStyle('transitionDuration', '0ms');
      this.setStyle(
        'transform',
        `translateX(${this.getMoveDistance()}px) translateY(${
          this.position.y
        }px)`,
      );
    }
  }

  public resume() {
    if (!this.moving || !this.paused) return;
    this.paused = false;
    this.recorder.pauseTime += now() - this.recorder.prevPauseTime;
    this.recorder.prevPauseTime = 0;
    const remainingTime = (1 - this.getMovePercent()) * this.duration;

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
      return;
    }
    const ex =
      this.direction === 'left' ? this.options.box.width : -this.getWidth();
    this.setStyle('zIndex', '0');
    this.setStyle('transitionDuration', `${remainingTime}ms`);
    this.setStyle(
      'transform',
      `translateX(${ex}px) translateY(${this.position.y}px)`,
    );
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
        let timer: number | null = setTimeout(onEnd, this.duration);
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
        this.setStyle('transition', `transform linear ${this.duration}ms`);
        this.setStyle(
          'transform',
          `translateX(${ex}px) translateY(${this.position.y}px)`,
        );
        whenTransitionEnds(this.node).then(onEnd);
      }
    });
  }

  public setStartStatus() {
    this.setStyle('zIndex', '0');
    this.setStyle('transform', '');
    this.setStyle('transition', '');
    this.setStyle('position', 'absolute');
    this.setStyle(
      'transform',
      `translateX(${this.position.x}px) translateY(${this.position.y}px)`,
    );
    this._status === 'hide'
      ? this.hide(INTERNAL_FLAG)
      : this.show(INTERNAL_FLAG);
  }
}
