import type { HooksOn, RefinePlugin } from 'hooks-plugin';
import type { Box } from './box';
import type { FacileDanmaku } from './danmaku/facile';
import type { FlexibleDanmaku } from './danmaku/flexible';
import type { Manager, ManagerOptions } from './manager';

export type DanmakuType = 'facile' | 'flexible';

export type Mode = 'none' | 'strict' | 'adaptive';

export type Direction = 'left' | 'right' | 'none';

export type Layer<T> = StashData<T> | FacileDanmaku<T>;

export type Danmaku<T> = FacileDanmaku<T> | FlexibleDanmaku<T>;

export type FilterCallback<T> = EachCallback<T>;

export type EachCallback<T> = (
  b: FacileDanmaku<T> | FlexibleDanmaku<T>,
) => boolean | void;

export type ValueType<M extends Manager<any>> = Extract<
  Parameters<M['push']>[0],
  PushData<unknown>
>['value'];

export type ManagerPlugin<T> = RefinePlugin<
  Manager<T>['pluginSystem']['lifecycle']
>;

export type DanmakuPlugin<T> = RefinePlugin<
  FacileDanmaku<T>['pluginSystem']['lifecycle']
>;

export type InternalStatuses = {
  freeze: boolean;
  opacity: number;
  viewStatus: 'hide' | 'show';
};

export interface PushFlexOptions<T> {
  plugin?: DanmakuPlugin<T>;
  duration?: number;
  direction?: Direction;
  position: Position | ((box: Box, b: Danmaku<T>) => Position);
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
  list: Array<FacileDanmaku<T>>;
  location: [number, number, number];
}

export interface PushData<T> {
  value: T;
  id?: string | number;
}

export interface StashData<T> {
  data: PushData<T>;
  plugin?: DanmakuPlugin<T>;
}

export interface InfoRecord {
  pauseTime: number;
  startTime: number;
  prevPauseTime: number;
}

export interface RenderOptions<T> {
  statuses: InternalStatuses;
  danmakuPlugin: DanmakuPlugin<T>;
  hooks: HooksOn<
    Manager<T>['pluginSystem'],
    ['render', 'finished', 'willRender']
  >;
}

export interface CreateOption<T> extends Partial<ManagerOptions> {
  plugin?: ManagerPlugin<T>;
}
