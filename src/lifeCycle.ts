import {
  SyncHook,
  AsyncHook,
  SyncWaterfallHook,
  PluginSystem,
} from 'hooks-plugin';
import { createId, toLowerCase } from './utils';
import type { Barrage, FacilePlugin } from './types';
import type { Manager, ManagerOptions } from './manager';

export function createBarrageLifeCycle<T extends Barrage<any>>() {
  return new PluginSystem({
    hide: new SyncHook<[T]>(),
    show: new SyncHook<[T]>(),
    pause: new SyncHook<[T]>(),
    resume: new SyncHook<[T]>(),
    destroy: new SyncHook<[T]>(),
    createNode: new SyncHook<[T]>(),
    appendNode: new SyncHook<[T]>(),
    removeNode: new SyncHook<[T]>(),
  });
}

export function createManagerLifeCycle<T>() {
  const child = createBarrageLifeCycle<Barrage<T>>();

  return new PluginSystem({
    // barrage hooks
    barrageShow: child.lifecycle.show,
    barrageHide: child.lifecycle.hide,
    barragePause: child.lifecycle.pause,
    barrageResume: child.lifecycle.resume,
    barrageDestroy: child.lifecycle.destroy,
    barrageCreateNode: child.lifecycle.createNode,
    barrageAppendNode: child.lifecycle.appendNode,
    barrageRemoveNode: child.lifecycle.removeNode,
    // global hooks
    stop: new SyncHook<[], null>(),
    start: new SyncHook<[], null>(),
    show: new SyncHook<[], null>(),
    hide: new SyncHook<[], null>(),
    clear: new SyncHook<[], null>(),
    resize: new SyncHook<[], null>(),
    create: new AsyncHook<[], null>(),
    render: new AsyncHook<[], null>(),
    finished: new SyncHook<[], null>(),
    push: new AsyncHook<[T, boolean], null>(),
    capacityWarning: new SyncHook<[], null>(),
    updateOptions: new SyncHook<[ManagerOptions]>(),
    willRender: new SyncWaterfallHook<{
      value: T;
      prevent: boolean;
    }>(),
  });
}

const scope = 'barrage';
const cache = [] as Array<[string, string]>;

export function createBridgePlugin<T>(
  plSys: Manager<T>['_plSys'],
): FacilePlugin<T> {
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
        const nk = toLowerCase(k.replace(scope, ''));
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
