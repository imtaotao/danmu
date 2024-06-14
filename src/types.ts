import type { Manager } from './manager';
import type { FacileBarrage } from './barrages/facile';
import type { FlexibleBarrage } from './barrages/flexible';

export type ViewStatus = 'hide' | 'show';

export type Direction = 'left' | 'right';

export type FilterCallback<T> = EachCallback<T>;

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
  w: number;
  h: number;
  el: HTMLElement;
}

export interface InfoRecord {
  duration: number;
  pauseTime: number;
  startTime: number;
  prevPauseTime: number;
}

export type ManagerPlugin<T> = Omit<
  ReturnType<Manager<T>['_plSys']['use']>,
  'name'
> & { name?: string };

export type FacilePlugin<T> = Omit<
  ReturnType<FacileBarrage<T>['_plSys']['use']>,
  'name'
> & { name?: string };
