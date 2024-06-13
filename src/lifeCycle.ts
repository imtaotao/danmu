import {
  SyncHook,
  AsyncHook,
  SyncWaterfallHook,
  PluginSystem,
} from "hooks-plugin";
import type { BarrageData } from "./types";
import type { ManagerOptions, Manager } from "./manager";
import type { SimpleBarrage } from "./barrages/simple";

export function createManagerLifeCycle<T, C = Manager<T>>(context: C) {
  return new PluginSystem({
    stop: new SyncHook<[], C>(context),
    start: new SyncHook<[], C>(context),
    send: new AsyncHook<[T], C>(context),
    clear: new SyncHook<[], C>(context),
    resize: new SyncHook<[], C>(context),
    create: new AsyncHook<[], C>(context),
    render: new AsyncHook<[], C>(context),
    finished: new SyncHook<[], C>(context),
    capacityWarning: new SyncHook<[], C>(context),
    updateOptions: new SyncHook<[ManagerOptions], C>(context),
    willRender: new SyncWaterfallHook<
      { prevent: boolean; value: SimpleBarrage<T> | BarrageData<T> },
      C
    >(context),
  });
}

export function createBarrageLifeCycle() {}
