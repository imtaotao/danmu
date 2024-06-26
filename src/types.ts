import type { Plugin } from 'hooks-plugin';
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

export type ValueType<M extends Manager<any>> = Extract<
  Parameters<M['push']>[0],
  PushData<unknown>
>['value'];

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

export type ManagerHook<
  T,
  K extends keyof Manager<T>['_plSys']['lifecycle'],
> = Parameters<Manager<T>['_plSys']['lifecycle'][K]['on']>[1];

export interface RenderOptions<T> {
  viewStatus: ViewStatus;
  bridgePlugin: BarragePlugin<T>;
  hooks: {
    render: ManagerHook<T, 'render'>;
    finished: ManagerHook<T, 'finished'>;
    willRender: ManagerHook<T, 'willRender'>;
  };
}

export interface ManagerPlugin<T>
  extends Omit<Plugin<Manager<T>['_plSys']['lifecycle']>, 'name'> {
  name?: string;
}

export interface BarragePlugin<T>
  extends Omit<Plugin<FacileBarrage<T>['_plSys']['lifecycle']>, 'name'> {
  name?: string;
}

export interface CreateOption<T> extends Partial<ManagerOptions> {
  plugin?: ManagerPlugin<T>;
}
