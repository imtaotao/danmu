import { SyncHook, SyncWaterfallHook, PluginSystem } from 'hooks-plugin';
import { ids } from './utils';
import type { Manager, ManagerOptions } from './manager';
import type { PushData, Barrage, BarrageType, BarragePlugin } from './types';

export function createBarrageLifeCycle<T extends Barrage<any>>() {
  return new PluginSystem({
    hide: new SyncHook<[T]>(),
    show: new SyncHook<[T]>(),
    pause: new SyncHook<[T]>(),
    resume: new SyncHook<[T]>(),
    destroy: new SyncHook<[T]>(),
    moveEnd: new SyncHook<[T]>(),
    moveStart: new SyncHook<[T]>(),
    createNode: new SyncHook<[T]>(),
    appendNode: new SyncHook<[T]>(),
    removeNode: new SyncHook<[T]>(),
  });
}

export function createManagerLifeCycle<T>() {
  const { lifecycle } = createBarrageLifeCycle<Barrage<T>>();
  return new PluginSystem({
    // Barrage hooks
    $show: lifecycle.show,
    $hide: lifecycle.hide,
    $pause: lifecycle.pause,
    $resume: lifecycle.resume,
    $destroy: lifecycle.destroy,
    $moveEnd: lifecycle.moveEnd,
    $moveStart: lifecycle.moveStart,
    $createNode: lifecycle.createNode,
    $appendNode: lifecycle.appendNode,
    $removeNode: lifecycle.removeNode,
    // Global hooks
    mount: new SyncHook<[]>(),
    format: new SyncHook<[]>(),
    start: new SyncHook<[]>(),
    stop: new SyncHook<[]>(),
    show: new SyncHook<[]>(),
    hide: new SyncHook<[]>(),
    clear: new SyncHook<[]>(),
    freeze: new SyncHook<[]>(),
    unfreeze: new SyncHook<[]>(),
    finished: new SyncHook<[]>(),
    init: new SyncHook<[manager: Manager<T>]>(),
    limitWarning: new SyncHook<[BarrageType, number]>(),
    updateOptions: new SyncHook<[Partial<ManagerOptions>]>(),
    push: new SyncHook<[PushData<T> | Barrage<T>, BarrageType, boolean]>(),
    render: new SyncHook<[BarrageType]>(),
    willRender: new SyncWaterfallHook<{
      prevent: boolean;
      type: BarrageType;
      barrage: Barrage<T>;
    }>(),
  });
}

const scope = '$';
const cache = [] as Array<[string, string]>;

export function createBridgePlugin<T>(
  plSys: Manager<T>['plSys'],
): BarragePlugin<T> {
  const plugin = {
    name: `__bridge_plugin_${ids.b++}__`,
  } as Record<string, unknown>;

  if (cache.length) {
    for (const [k, nk] of cache) {
      plugin[nk] = (...args: Array<unknown>) => {
        return (plSys.lifecycle as any)[k].emit(...args);
      };
    }
  } else {
    const keys = Object.keys(plSys.lifecycle);
    for (const k of keys) {
      if (k.startsWith(scope)) {
        const nk = k.replace(scope, '');
        cache.push([k, nk]);
        plugin[nk] = (...args: Array<unknown>) => {
          return (plSys.lifecycle as any)[k].emit(...args);
        };
      }
    }
  }
  return plugin;
}
