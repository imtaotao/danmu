import { toLowerCase } from 'aidly';
import { SyncHook, SyncWaterfallHook, PluginSystem } from 'hooks-plugin';
import type { StreamManager, ManagerOptions } from './manager';
import type { Barrage, BarrageType, BarragePlugin } from './types';
import { createId } from './utils';

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
  const child = createBarrageLifeCycle<Barrage<T>>();

  return new PluginSystem({
    // barrage hooks
    $show: child.lifecycle.show,
    $hide: child.lifecycle.hide,
    $pause: child.lifecycle.pause,
    $resume: child.lifecycle.resume,
    $destroy: child.lifecycle.destroy,
    $moveEnd: child.lifecycle.moveEnd,
    $moveStart: child.lifecycle.moveStart,
    $createNode: child.lifecycle.createNode,
    $appendNode: child.lifecycle.appendNode,
    $removeNode: child.lifecycle.removeNode,
    // global hooks
    stop: new SyncHook<[]>(),
    start: new SyncHook<[]>(),
    show: new SyncHook<[]>(),
    hide: new SyncHook<[]>(),
    clear: new SyncHook<[]>(),
    resize: new SyncHook<[]>(),
    create: new SyncHook<[]>(),
    finished: new SyncHook<[]>(),
    render: new SyncHook<[BarrageType]>(),
    push: new SyncHook<[T, BarrageType, boolean]>(),
    updateOptions: new SyncHook<[ManagerOptions]>(),
    limitWarning: new SyncHook<[BarrageType, number | null]>(),
    willRender: new SyncWaterfallHook<{
      value: T;
      prevent: boolean;
      type: BarrageType;
    }>(),
  });
}

const scope = '$';
const cache = [] as Array<[string, string]>;

export function createBridgePlugin<T>(
  plSys: StreamManager<T>['_plSys'],
): BarragePlugin<T> {
  const hooks = {} as Record<string, unknown>;

  if (cache.length) {
    for (const [k, nk] of cache) {
      hooks[nk] = (...args: Array<unknown>) => {
        return (plSys.lifecycle as any)[k].emit(...args);
      };
    }
  } else {
    const keys = Object.keys(plSys.lifecycle);
    for (const k of keys) {
      if (k.startsWith(scope)) {
        const nk = k.replace(scope, '');
        cache.push([k, nk]);
        hooks[nk] = (...args: Array<unknown>) => {
          return (plSys.lifecycle as any)[k].emit(...args);
        };
      }
    }
  }
  return {
    hooks,
    name: `__global_bridge_${createId()}__`,
  };
}
