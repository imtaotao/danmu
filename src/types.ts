import type { Manager } from './manager';
import type { FacileBarrage } from './barrages/facile';
import type { FlexibleBarrage } from './barrages/flexible';

export type ViewStatus = 'hide' | 'show';

export type Direction = 'left' | 'right';

export type FilterCallback<T> = EachCallback<T>;

export type Layer<T> = BarrageData<T> | FacileBarrage<T>;

export type Barrage<T> = FacileBarrage<T> | FlexibleBarrage<unknown>;

export type EachCallback<T> = (
  b: FacileBarrage<T> | FlexibleBarrage<unknown>,
) => boolean | void;

export interface TrackData<T> {
  gaps: [number, number];
  list: Array<FacileBarrage<T>>;
}

export interface BarrageData<T> {
  data: T;
  plugin?: FacilePlugin<T>;
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

export type ManagerHook<
  T,
  K extends keyof Manager<T>['_plSys']['lifecycle'],
> = Parameters<Manager<T>['_plSys']['lifecycle'][K]['on']>[1];

export interface RenderOptions<T> {
  viewStatus: ViewStatus;
  bridgePlugin: FacilePlugin<T>;
  hooks: {
    render: ManagerHook<T, 'render'>;
    finished: ManagerHook<T, 'finished'>;
    willRender: ManagerHook<T, 'willRender'>;
  };
}

export interface RunOptions<T> extends RenderOptions<T> {
  layer: Layer<T>;
  trackData: TrackData<T>;
}

export type ManagerPlugin<T> = Omit<
  ReturnType<Manager<T>['_plSys']['use']>,
  'name'
> & { name?: string };

export type FacilePlugin<T> = Omit<
  ReturnType<FacileBarrage<T>['_plSys']['use']>,
  'name'
> & { name?: string };
