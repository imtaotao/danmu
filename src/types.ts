import type { StreamManager } from './manager';
import type { FacileBarrage } from './barrages/facile';
import type { FlexibleOptions, FlexibleBarrage } from './barrages/flexible';

export type ViewStatus = 'hide' | 'show';

export type Direction = 'left' | 'right' | 'none';

export type Mode = 'none' | 'strict' | 'adaptive';

export type FilterCallback<T> = EachCallback<T>;

export type Layer<T> = BarrageData<T> | FacileBarrage<T>;

export type Barrage<T> = FacileBarrage<T> | FlexibleBarrage<T>;

export type EachCallback<T> = (
  b: FacileBarrage<T> | FlexibleBarrage<T>,
) => boolean | void;

export type PushFlexOptions<T> = Omit<
  FlexibleOptions<T>,
  'box' | 'data' | 'defaultStatus' | 'delInTrack'
> & {
  plugin?: BarragePlugin<T>;
};

export interface Position {
  x: number;
  y: number;
}

export interface TrackData<T> {
  location: [number, number];
  list: Array<FacileBarrage<T>>;
}

export interface BarrageData<T> {
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

export type StreamPlugin<T> = Omit<
  ReturnType<StreamManager<T>['_plSys']['use']>,
  'name'
> & { name?: string };

export type BarragePlugin<T> = Omit<
  ReturnType<FacileBarrage<T>['_plSys']['use']>,
  'name'
> & { name?: string };
