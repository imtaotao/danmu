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
    createNode: new SyncHook<[T]>(),
    appendNode: new SyncHook<[T]>(),
    removeNode: new SyncHook<[T]>(),
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
    clear: new SyncHook<[]>(),
    freeze: new SyncHook<[]>(),
    unfreeze: new SyncHook<[]>(),
    finished: new SyncHook<[]>(),
    mount: new SyncHook<[HTMLElement]>(),
    unmount: new SyncHook<[HTMLElement | null]>(),
    init: new SyncHook<[manager: Manager<T>]>(),
    limitWarning: new SyncHook<[DanmakuType, number]>(),
    updateOptions: new SyncHook<[Partial<ManagerOptions>]>(),
    push: new SyncHook<[T | Danmaku<T>, DanmakuType, boolean]>(),
    render: new SyncHook<[DanmakuType]>(),
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
