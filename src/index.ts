import { assert } from 'aidly';
import { Manager } from './manager';
import type { CreateOption } from './types';

const formatOptions = <T>(options?: CreateOption<T>) => {
  const newOptions = Object.assign(
    {
      gap: 0,
      rate: 1,
      limits: {},
      interval: 500,
      mode: 'strict',
      direction: 'right',
      trackHeight: '20%',
      durationRange: [4000, 6000],
    },
    options,
  );
  assert(newOptions.gap >= 0, 'Gap must be greater than or equal to 0');
  if (typeof newOptions.limits.stash !== 'number') {
    newOptions.limits.stash = Infinity;
  }
  return newOptions;
};

export function create<
  T extends unknown,
  S extends Record<any, unknown> = Record<PropertyKey, unknown>,
>(options?: CreateOption<T>) {
  const opts = formatOptions<T>(options);
  const manager = new Manager<T, S>(opts);
  if (opts.plugin) {
    const plugins = Array.isArray(opts.plugin) ? opts.plugin : [opts.plugin];
    for (const plugin of plugins) {
      manager.use(plugin);
    }
    manager.pluginSystem.lifecycle.init.emit(manager);
  }
  return manager;
}

export type { Track } from './track';
export type { Manager } from './manager';
export type { HookOn, HooksOn, Plugin, HookType } from 'hooks-plugin';
export type {
  Mode,
  Distribution,
  Speed,
  StyleKey,
  Position,
  PushOptions,
  PushFlexOptions,
  Location,
  ValueType,
  Direction,
  Danmaku,
  DanmakuType,
  DanmakuPlugin,
  ManagerPlugin,
  ManagerOptions,
  CreateOption,
} from './types';
