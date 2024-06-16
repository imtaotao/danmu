import type { Position } from '../types';
import { FacileBarrage, FacileOptions } from './facile';

export interface FlexibleOptions<T> extends FacileOptions<T> {
  position: Position;
}

export class FlexibleBarrage<T> extends FacileBarrage<T> {
  public type = 'flexible';
  public position: Position;

  public constructor(public options: FlexibleOptions<T>) {
    super(options);
    this.position = options.position;
  }

  public getMoveDistance() {
    return 0;
  }

  public pause() {}

  public resume() {}

  public setEndStyles() {
    return new Promise<void>((resolve) => {});
  }

  public destroy() {}

  protected _initStyles() {}
}
