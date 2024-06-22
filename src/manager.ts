import { assert, hasOwn } from 'aidly';
import { ids, NO_EMIT } from './utils';
import { FacileBarrage } from './barrages/facile';
import { FlexibleBarrage } from './barrages/flexible';
import { Engine, type EngineOptions } from './engine';
import { createBridgePlugin, createManagerLifeCycle } from './lifeCycle';
import type {
  Barrage,
  BarrageType,
  BarragePlugin,
  EachCallback,
  FilterCallback,
  ViewStatus,
  StreamPlugin,
  SnapshotData,
  PushFlexOptions,
} from './types';

export interface ManagerOptions extends EngineOptions {
  interval: number;
}

export class StreamManager<T extends unknown> {
  public version = __VERSION__;
  private _engine: Engine<T>;
  private _viewStatus: ViewStatus = 'show';
  private _renderTimer: number | null = null;
  private _container: HTMLElement | null = null;
  private _plSys = createManagerLifeCycle<T>();

  public constructor(public options: ManagerOptions) {
    this._engine = new Engine(options);
  }

  public len() {
    return this._engine.len();
  }

  public box() {
    return this._engine.box;
  }

  public playing() {
    return this._renderTimer !== null;
  }

  public isBarrage(b: unknown): b is Barrage<T> {
    return b instanceof FacileBarrage || b instanceof FlexibleBarrage;
  }

  public each(fn: EachCallback<T>) {
    this._engine.each(fn);
    return this;
  }

  public asyncEach(fn: EachCallback<T>) {
    return this._engine.asyncEach(fn).then(() => this);
  }

  public format() {
    this._engine.format();
    this._plSys.lifecycle.format.emit();
    return this;
  }

  public mount(container?: HTMLElement | string | null) {
    if (container) {
      this._container =
        typeof container === 'string'
          ? document.querySelector(container)
          : container;
    }
    assert(this._container, `Invalid "${container}"`);
    this._engine.box.mount(this._container);
    this._engine.format();
    return this;
  }

  public clear() {
    // No need to use `destroy` to save loop times
    this.each((b) => b.removeNode());
    this._engine.clear();
    this._plSys.lifecycle.clear.emit();
    return this;
  }

  public usePlugin(plugin: StreamPlugin<T>) {
    plugin.name = plugin.name || `__runtime_plugin_${ids.r++}__`;
    this._plSys.use(plugin as StreamPlugin<T> & { name: string });
    return this;
  }

  public updateOptions(newOptions: Partial<ManagerOptions>) {
    this._engine.updateOptions(newOptions);
    this.options = Object.assign(this.options, newOptions);

    if (hasOwn(newOptions, 'interval')) {
      this.stopPlaying(NO_EMIT);
      this.startPlaying(null, NO_EMIT);
    }
    this._plSys.lifecycle.updateOptions.emit(newOptions);
    return this;
  }

  public startPlaying(snapshot?: SnapshotData | null, _flag?: Symbol) {
    if (this.playing()) return this;
    this._plSys.lock();
    if (_flag !== NO_EMIT) {
      this._plSys.lifecycle.start.emit();
    }
    const cycle = () => {
      this._renderTimer = setTimeout(cycle, this.options.interval);
      this.render();
    };
    cycle();
    return this;
  }

  public stopPlaying(_flag?: Symbol) {
    if (!this.playing()) return this;
    if (this._renderTimer) {
      clearTimeout(this._renderTimer);
    }
    this._renderTimer = null;
    if (_flag !== NO_EMIT) {
      this._plSys.lifecycle.stop.emit();
    }
    this._plSys.unlock();
    return this;
  }

  public show(filter?: FilterCallback<T>) {
    return this._changeViewStatus('show', filter).then(() => this);
  }

  public hide(filter?: FilterCallback<T>) {
    return this._changeViewStatus('hide', filter).then(() => this);
  }

  public push(data: T | FacileBarrage<T>, plugin?: BarragePlugin<T>) {
    if (!this._canSend('facile')) return false;
    if (this.isBarrage(data) && plugin) {
      console.warn(
        'When you add a barrage, the second parameter is invalid. ' +
          'You should use `barrage.use({})`.',
      );
    }
    this._engine.add(data, plugin, true);
    this._plSys.lifecycle.push.emit(data, 'facile', true);
    return true;
  }

  public unshift(data: T | FacileBarrage<T>, plugin?: BarragePlugin<T>) {
    if (!this._canSend('facile')) return false;
    if (this.isBarrage(data) && plugin) {
      console.warn(
        'When you add a barrage, the second parameter is invalid. ' +
          'You should use `barrage.use({})`.',
      );
    }
    this._engine.add(data, plugin, false);
    this._plSys.lifecycle.push.emit(data, 'facile', false);
    return true;
  }

  public pushFlexBarrage(data: T, options: PushFlexOptions<T>) {
    if (!this._canSend('flexible') || !this.playing()) return false;
    if (typeof options.duration === 'number' && options.duration < 0) {
      return false;
    }
    this._engine.renderFlexBarrage(data, {
      ...options,
      viewStatus: this._viewStatus,
      bridgePlugin: createBridgePlugin(this._plSys),
      hooks: {
        finished: () => this._plSys.lifecycle.finished.emit(),
        render: (val) => this._plSys.lifecycle.render.emit(val),
        willRender: (val) => this._plSys.lifecycle.willRender.emit(val),
      },
    });
    this._plSys.lifecycle.push.emit(data, 'flexible', true);
    return true;
  }

  public render() {
    if (!this.playing()) return this;
    this._engine.render({
      viewStatus: this._viewStatus,
      bridgePlugin: createBridgePlugin(this._plSys),
      hooks: {
        finished: () => this._plSys.lifecycle.finished.emit(),
        render: (val) => this._plSys.lifecycle.render.emit(val),
        willRender: (val) => this._plSys.lifecycle.willRender.emit(val),
      },
    });
    return this;
  }

  public setArea(x?: number, y?: number) {
    return this;
  }

  public exportSnapshot() {}

  private _canSend(type: BarrageType) {
    let res = true;
    const isFacile = type === 'facile';
    const { limits } = this.options;
    const { stash, view } = this._engine.len();

    if (isFacile) {
      res = stash < limits.stash;
    } else if (typeof limits.view === 'number') {
      res = view < limits.view;
    }
    if (!res && isFacile) {
      const hook = this._plSys.lifecycle.limitWarning;
      if (hook.isEmpty()) {
        console.warn(
          'The number of danmu in temporary storage exceeds the limit.' +
            `(${limits.stash})`,
        );
      } else {
        hook.emit(type, isFacile ? limits.stash : null);
      }
    }
    return res;
  }

  private _changeViewStatus(status: ViewStatus, filter?: FilterCallback<T>) {
    return new Promise<void>((resolve) => {
      if (this._viewStatus === status) {
        resolve();
        return;
      }
      this._viewStatus = status;
      this._plSys.lifecycle[status].emit();
      this._engine
        .asyncEach((b) => {
          if (this._viewStatus === status) {
            if (!filter || filter(b) !== true) {
              b[status]();
            }
          } else {
            return false;
          }
        })
        .then(resolve);
    });
  }
}
