import type { FacileBarrage } from './barrages/facile';
import type { FlexibleBarrage } from './barrages/flexible';
import type { StreamManager, ManagerOptions } from './manager';

export type BarrageType = 'facile' | 'flexible';

export type ViewStatus = 'hide' | 'show';

export type Direction = 'left' | 'right' | 'none';

export type Mode = 'none' | 'strict' | 'adaptive';

export type Barrage<T> = FacileBarrage<T> | FlexibleBarrage<T>;

export type FilterCallback<T> = EachCallback<T>;

export type Layer<T> = StashData<T> | FacileBarrage<T>;

export type EachCallback<T> = (
  b: FacileBarrage<T> | FlexibleBarrage<T>,
) => boolean | void;

export type CreateOption<T> = Partial<ManagerOptions> & {
  plugin?: StreamPlugin<T>;
};

export type StreamPlugin<T> = Omit<
  ReturnType<StreamManager<T>['_plSys']['use']>,
  'name'
> & { name?: string };

export type BarragePlugin<T> = Omit<
  ReturnType<FacileBarrage<T>['_plSys']['use']>,
  'name'
> & { name?: string };

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
  location: [number, number];
  list: Array<FacileBarrage<T>>;
}

export interface StashData<T> {
  data: T;
  plugin?: BarragePlugin<T>;
}

export interface Box {
  width: number;
  height: number;
  el: HTMLElement;
}

export interface InfoRecord {
  duration: number;
  pauseTime: number;
  startTime: number;
  prevPauseTime: number;
}

export type StreamHook<
  T,
  K extends keyof StreamManager<T>['_plSys']['lifecycle'],
> = Parameters<StreamManager<T>['_plSys']['lifecycle'][K]['on']>[1];

export interface RenderOptions<T> {
  viewStatus: ViewStatus;
  bridgePlugin: BarragePlugin<T>;
  hooks: {
    render: StreamHook<T, 'render'>;
    finished: StreamHook<T, 'finished'>;
    willRender: StreamHook<T, 'willRender'>;
  };
}

export interface RunOptions<T> extends RenderOptions<T> {
  layer: Layer<T>;
  trackData: TrackData<T>;
}

export interface SnapshotData {}
