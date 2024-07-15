import type { HooksOn, RefinePlugin } from 'hooks-plugin';
import type { Box } from './box';
import type { FacileBarrage } from './barrages/facile';
import type { FlexibleBarrage } from './barrages/flexible';
import type { Manager, ManagerOptions } from './manager';

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

export type ManagerPlugin<T> = RefinePlugin<Manager<T>['plSys']['lifecycle']>;

export type BarragePlugin<T> = RefinePlugin<
  FacileBarrage<T>['plSys']['lifecycle']
>;

export type InternalStatuses = {
  rate: number;
  freeze: boolean;
  viewStatus: 'hide' | 'show';
};

export interface PushFlexOptions<T> {
  plugin?: BarragePlugin<T>;
  duration?: number;
  direction: Direction;
  position: Position | ((box: Box, b: Barrage<T>) => Position);
}

export interface Position {
  x: number;
  y: number;
}

export interface MoveTimer {
  cb: () => void;
  clear: () => void;
}

export interface AreaOptions {
  x?: { start?: string; end?: string };
  y?: { start?: string; end?: string };
}

export interface FreezeOptions {
  preventEvents?: Array<'pause' | 'stop' | 'resume' | 'start' | (string & {})>;
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

export interface RenderOptions<T> {
  statuses: InternalStatuses;
  bridgePlugin: BarragePlugin<T>;
  hooks: HooksOn<Manager<T>['plSys'], ['render', 'finished', 'willRender']>;
}

export interface CreateOption<T> extends Partial<ManagerOptions> {
  plugin?: ManagerPlugin<T>;
}
