import type { Box } from './box';
import type { FacileBarrage } from './barrages/facile';
import type { FlexibleBarrage } from './barrages/flexible';
import type { Manager, ManagerOptions } from './manager';

export type ViewStatus = 'hide' | 'show';

export type BarrageType = 'facile' | 'flexible';

export type Mode = 'none' | 'strict' | 'adaptive';

export type Direction = 'left' | 'right' | 'none';

export type Layer<T> = StashData<T> | FacileBarrage<T>;

export type Barrage<T> = FacileBarrage<T> | FlexibleBarrage<T>;

export type FilterCallback<T> = EachCallback<T>;

export type EachCallback<T> = (
  b: FacileBarrage<T> | FlexibleBarrage<T>,
) => boolean | void;

export interface PushFlexOptions<T> {
  plugin?: BarragePlugin<T>;
  duration?: number;
  direction: Direction;
  position: Position | ((box: Box) => Position);
}

export interface Position {
  x: number;
  y: number;
}

export interface MoveTimer {
  cb: () => void;
  clear: () => void;
}

export interface TrackData<T> {
  list: Array<FacileBarrage<T>>;
  location: [number, number, number];
}

export interface PushData<T> {
  value: T;
  id?: string | number;
}

export interface StashData<T> {
  data: PushData<T>;
  plugin?: BarragePlugin<T>;
}

export interface InfoRecord {
  duration: number;
  pauseTime: number;
  startTime: number;
  prevPauseTime: number;
}

export type StreamHook<
  T,
  K extends keyof Manager<T>['_plSys']['lifecycle'],
> = Parameters<Manager<T>['_plSys']['lifecycle'][K]['on']>[1];

export interface RenderOptions<T> {
  viewStatus: ViewStatus;
  bridgePlugin: BarragePlugin<T>;
  hooks: {
    render: StreamHook<T, 'render'>;
    finished: StreamHook<T, 'finished'>;
    willRender: StreamHook<T, 'willRender'>;
  };
}

export interface ManagerPlugin<T>
  extends Omit<ReturnType<Manager<T>['_plSys']['use']>, 'name'> {
  name?: string;
}

export interface BarragePlugin<T>
  extends Omit<ReturnType<FacileBarrage<T>['_plSys']['use']>, 'name'> {
  name?: string;
}

export interface CreateOption<T> extends Partial<ManagerOptions> {
  plugin?: ManagerPlugin<T>;
}
