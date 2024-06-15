import { toLowerCase } from 'aidly';
import { SyncHook, SyncWaterfallHook, PluginSystem } from 'hooks-plugin';
import { createId } from './utils';
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
    movementEnd: new SyncHook<[T]>(),
    movementStart: new SyncHook<[T]>(),
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
    barrageMovementEnd: child.lifecycle.movementEnd,
    barrageMovementStart: child.lifecycle.movementStart,
    // global hooks
    stop: new SyncHook<[]>(),
    start: new SyncHook<[]>(),
    show: new SyncHook<[]>(),
    hide: new SyncHook<[]>(),
    clear: new SyncHook<[]>(),
    resize: new SyncHook<[]>(),
    create: new SyncHook<[]>(),
    render: new SyncHook<[]>(),
    finished: new SyncHook<[]>(),
    push: new SyncHook<[T, boolean]>(),
    memoryWarning: new SyncHook<[number]>(),
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
