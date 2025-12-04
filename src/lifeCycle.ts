import type { Nullable } from 'aidly';
import {
  SyncHook,
  AsyncHook,
  SyncWaterfallHook,
  PluginSystem,
} from 'hooks-plugin';
import { ids } from './utils';
import type { Manager } from './manager';
import type {
  Danmaku,
  DanmakuType,
  DanmakuPlugin,
  ManagerOptions,
} from './types';

export function createDanmakuLifeCycle<T extends Danmaku<any>>() {
  return new PluginSystem({
    hide: new SyncHook<[T]>(),
    show: new SyncHook<[T]>(),
    pause: new SyncHook<[T]>(),
    resume: new SyncHook<[T]>(),
    beforeMove: new SyncHook<[T]>(),
    moved: new SyncHook<[T]>(),
    reachEdge: new SyncHook<[T]>(),
    createNode: new SyncHook<[T, HTMLElement]>(),
    appendNode: new SyncHook<[T, HTMLElement]>(),
    removeNode: new SyncHook<[T, HTMLElement]>(),
    beforeDestroy: new AsyncHook<[T, unknown]>(),
    destroyed: new SyncHook<[T, unknown]>(),
  });
}

export function createManagerLifeCycle<T>() {
  const { lifecycle } = createDanmakuLifeCycle<Danmaku<T>>();
  return new PluginSystem({
    // Danmaku hooks
    $show: lifecycle.show,
    $hide: lifecycle.hide,
    $pause: lifecycle.pause,
    $resume: lifecycle.resume,
    $beforeMove: lifecycle.beforeMove,
    $moved: lifecycle.moved,
    $reachEdge: lifecycle.reachEdge,
    $createNode: lifecycle.createNode,
    $appendNode: lifecycle.appendNode,
    $removeNode: lifecycle.removeNode,
    $beforeDestroy: lifecycle.beforeDestroy,
    $destroyed: lifecycle.destroyed,
    // Global hooks
    format: new SyncHook<[]>(),
    start: new SyncHook<[]>(),
    stop: new SyncHook<[]>(),
    show: new SyncHook<[]>(),
    hide: new SyncHook<[]>(),
    freeze: new SyncHook<[]>(),
    unfreeze: new SyncHook<[]>(),
    finished: new SyncHook<[]>(),
    clear: new SyncHook<[Nullable<DanmakuType>]>(),
    mount: new SyncHook<[HTMLElement]>(),
    unmount: new SyncHook<[HTMLElement | null]>(),
    init: new SyncHook<[manager: Manager<T>]>(),
    limitWarning: new SyncHook<[DanmakuType, number]>(),
    push: new SyncHook<[T | Danmaku<T>, DanmakuType, boolean]>(),
    render: new SyncHook<[DanmakuType]>(),
    updateOptions: new SyncHook<
      [Partial<ManagerOptions>, Nullable<keyof ManagerOptions>]
    >(),
    willRender: new SyncWaterfallHook<{
      type: DanmakuType;
      prevent: boolean;
      danmaku: Danmaku<T>;
      trackIndex: null | number;
    }>(),
  });
}

const scope = '$';
const cache = [] as Array<[string, string]>;

export function createDanmakuPlugin<T>(
  plSys: Manager<T>['pluginSystem'],
): DanmakuPlugin<T> {
  const plugin = {
    name: `__danmaku_plugin_${ids.bridge++}__`,
  } as Record<string, unknown>;

  if (cache.length) {
    for (const [k, nk] of cache) {
      // Use named function to make it identifiable as a bridge function
      plugin[nk] = function __danmaku_bridge_fn(...args: Array<unknown>) {
        return (plSys.lifecycle as any)[k].emit(...args);
      };
    }
  } else {
    const keys = Object.keys(plSys.lifecycle);
    for (const k of keys) {
      if (k.startsWith(scope)) {
        const nk = k.replace(scope, '');
        cache.push([k, nk]);
        // Use named function to make it identifiable as a bridge function
        plugin[nk] = function __danmaku_bridge_fn(...args: Array<unknown>) {
          return (plSys.lifecycle as any)[k].emit(...args);
        };
      }
    }
  }
  return plugin;
}

/**
 * Check if a hook has real user listeners (excluding bridge functions)
 *
 * Bridge functions are automatically created by createDanmakuPlugin to forward
 * danmaku instance events to manager-level hooks. They are named '__danmaku_bridge_fn'.
 * This function filters them out to detect if there are actual user-registered listeners.
 *
 * @param hook - The hook to check (SyncHook or AsyncHook)
 * @returns true if there are real user listeners (non-bridge functions), false otherwise
 */
function hasRealListeners<T extends unknown[]>(
  hook: SyncHook<T> | AsyncHook<T>,
) {
  if (hook.isEmpty()) return false;

  for (const listener of hook.listeners) {
    if (listener.name !== '__danmaku_bridge_fn') {
      return true;
    }
  }

  return false;
}

/**
 * Check if there are any real user listeners interested in a specific lifecycle hook
 *
 * This function checks both:
 * 1. Danmaku instance listeners - registered via push({ plugin: { reachEdge() {} } })
 * 2. Manager listeners - registered via create({ plugin: { $reachEdge() {} } })
 *
 * It's useful for performance optimization to avoid unnecessary operations when
 * no one is listening to a specific event.
 *
 * @param danmakuHook - The hook on danmaku instance
 * @param managerPluginSystem - The manager's plugin system
 * @param managerHookName - The name of the hook on manager
 * @returns true if there are real user listeners on either danmaku or manager, false otherwise
 *
 * @example
 * ```ts
 * // In danmaku instance
 * const hasListeners = hasAnyRealListeners(
 *   this.pluginSystem.lifecycle.reachEdge,
 *   this._options.managerPluginSystem,
 *   '$reachEdge'
 * );
 *
 * if (!hasListeners) {
 *   // Skip expensive operations like requestAnimationFrame monitoring
 *   return;
 * }
 * ```
 */
export function hasAnyRealListeners<
  T extends unknown[],
  U extends ReturnType<typeof createManagerLifeCycle<any>>,
>(
  danmakuHook: SyncHook<T> | AsyncHook<T>,
  managerPluginSystem: U | undefined,
  managerHookName: keyof U['lifecycle'],
): boolean {
  const hasDanmakuUserListeners = hasRealListeners(danmakuHook);
  type K = keyof ReturnType<typeof createManagerLifeCycle<any>>['lifecycle'];

  const hasManagerListeners =
    managerPluginSystem !== undefined &&
    managerPluginSystem.lifecycle[managerHookName as K] !== undefined &&
    !managerPluginSystem.lifecycle[managerHookName as K].isEmpty();

  return hasDanmakuUserListeners || hasManagerListeners;
}
