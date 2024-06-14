import type { Manager } from './manager';
import type { SimpleBarrage } from './barrages/simple';
import type { ComplicatedBarrage } from './barrages/complicated';

export type ViewStatus = 'hide' | 'show';

export type Direction = 'left' | 'right';

export type FilterCallback<T> = EachCallback<T>;

export type EachCallback<T> = (
  b: SimpleBarrage<T> | ComplicatedBarrage<unknown>,
) => boolean | void;

export interface TrackData<T> {
  gaps: [number, number];
  list: Array<SimpleBarrage<T>>;
}

export interface BarrageData<T> {
  data: T;
  plugin?: SimpleBarragePlugin<T>;
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

export type SimpleBarragePlugin<T> = Omit<
  ReturnType<SimpleBarrage<T>['_plSys']['use']>,
  'name'
> & { name?: string };
