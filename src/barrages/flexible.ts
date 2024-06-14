import { FacileBarrage, FacileOptions } from './facile';

export interface FlexibleOptions<T> extends FacileOptions<T> {
  position: unknown;
}

export class FlexibleBarrage<T> extends FacileBarrage<T> {
  public type = 'flexible';

  public constructor(public options: FlexibleOptions<T>) {
    super(options);
  }
}
