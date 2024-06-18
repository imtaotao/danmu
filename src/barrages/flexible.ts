import { now } from 'aidly';
import { FacileBarrage, FacileOptions } from './facile';
import { NO_EMIT, whenTransitionEnds } from '../utils';
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

  public use(plugin: BarragePlugin<T>) {
    plugin.name = plugin.name || `__flexible_barrage_plugin__`;
    this._plSys.use(plugin as BarragePlugin<T> & { name: string });
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

  public exportSnapshot() {}

  public setEndStyles() {
    return new Promise<void>((resolve) => {
      this.moving = true;
      this.recorder.startTime = now();

      if (this.direction === 'none') {
        const cb = () => {
          if (this.moveTimer) {
            this.moveTimer.clear();
            this.moveTimer = null;
          }
          this.moving = false;
          this.isEnded = true;
          resolve();
        };
        let timer: number | null = setTimeout(cb, this.duration);
        this.moveTimer = {
          cb,
          clear() {
            clearTimeout(timer as number);
            timer = null;
          },
        };
        return;
      }
      if (!this.node) {
        this.moving = false;
        this.isEnded = true;
        resolve();
        return;
      }
      this._plSys.lifecycle.moveStart.emit(this);
      const ex =
        this.direction === 'left' ? this.options.box.width : -this.getWidth();
      this.setStyle('transition', `transform linear ${this.duration}ms`);
      this.setStyle(
        'transform',
        `translateX(${ex}px) translateY(${this.position.y}px)`,
      );
      whenTransitionEnds(this.node).then(() => {
        this.moving = false;
        this.isEnded = true;
        this._plSys.lifecycle.moveEnd.emit(this);
        resolve();
      });
    });
  }

  protected _initStyles() {
    this.setStyle('zIndex', '0');
    this.setStyle('position', 'absolute');
    this.setStyle('display', 'inline-block');
    this.setStyle(
      'transform',
      `translateX(${this.position.x}px) translateY(${this.position.y}px)`,
    );
    this._status === 'hide' ? this.hide(NO_EMIT) : this.show(NO_EMIT);
  }
}
