import { assert, hasOwn } from 'aidly';
import { FacileBarrage } from './barrages/facile';
import { FlexibleBarrage } from './barrages/flexible';
import { Engine, type EngineOptions } from './engine';
import { ids, toNumber, INTERNAL_FLAG } from './utils';
import { createBridgePlugin, createManagerLifeCycle } from './lifeCycle';
import type {
  Barrage,
  BarrageType,
  BarragePlugin,
  PushData,
  EachCallback,
  FilterCallback,
  ViewStatus,
  ManagerPlugin,
  PushFlexOptions,
} from './types';
import { Box } from './box';

export interface ManagerOptions extends EngineOptions {
  interval: number;
}

export class Manager<T extends unknown> {
  public version = __VERSION__;
  private _engine: Engine<T>;
  private _viewStatus: ViewStatus = 'show';
  private _renderTimer: number | null = null;
  private _container: HTMLElement | null = null;
  public plSys = createManagerLifeCycle<T>();

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

  public isShow() {
    return this._viewStatus === 'show';
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
    this.plSys.lifecycle.format.emit();
    return this;
  }

  public mount(container?: HTMLElement | string) {
    if (!container) return this;
    if (typeof container === 'string') {
      this._container = document.querySelector(container);
    } else {
      this._container = container;
    }
    assert(this._container, `Invalid "${container}"`);
    if (this.playing()) this.clear(INTERNAL_FLAG);
    this._engine.box.mount(this._container);
    this._engine.format();
    return this;
  }

  public clear(_flag?: Symbol) {
    // No need to use `destroy` to save loop times
    this.each((b) => b.removeNode());
    this._engine.clear();
    if (_flag !== INTERNAL_FLAG) {
      this.plSys.lifecycle.clear.emit();
    }
    return this;
  }

  public use(plugin: ManagerPlugin<T> | ((m: this) => ManagerPlugin<T>)) {
    if (typeof plugin === 'function') plugin = plugin(this);
    if (!plugin.name) {
      plugin.name = `__runtime_plugin_${ids.r++}__`;
    }
    this.plSys.use(plugin as ManagerPlugin<T> & { name: string });
    return this;
  }

  public remove(pluginName: string) {
    this.plSys.remove(pluginName);
    return this;
  }

  public updateOptions(newOptions: Partial<ManagerOptions>) {
    this._engine.updateOptions(newOptions);
    this.options = Object.assign(this.options, newOptions);

    if (hasOwn(newOptions, 'interval')) {
      this.stopPlaying(INTERNAL_FLAG);
      this.startPlaying(INTERNAL_FLAG);
    }
    this.plSys.lifecycle.updateOptions.emit(newOptions);
    return this;
  }

  public startPlaying(_flag?: Symbol) {
    if (this.playing()) return this;
    this.plSys.lock();
    if (_flag !== INTERNAL_FLAG) {
      this.plSys.lifecycle.start.emit();
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
    if (_flag !== INTERNAL_FLAG) {
      this.plSys.lifecycle.stop.emit();
    }
    this.plSys.unlock();
    return this;
  }

  public show(filter?: FilterCallback<T>) {
    return this._setViewStatus('show', filter).then(() => this);
  }

  public hide(filter?: FilterCallback<T>) {
    return this._setViewStatus('hide', filter).then(() => this);
  }

  public canPush(type: BarrageType) {
    let res = true;
    const isFacile = type === 'facile';
    const { limits } = this.options;
    const { stash, view } = this._engine.len();

    if (isFacile) {
      res = stash < limits.stash;
    } else if (typeof limits.view === 'number') {
      res = view < limits.view;
    }
    return res;
  }

  public unshift(
    data: PushData<T> | FacileBarrage<T>,
    plugin?: BarragePlugin<T>,
  ) {
    return this.push(data, plugin, INTERNAL_FLAG);
  }

  public push(
    data: PushData<T> | FacileBarrage<T>,
    plugin?: BarragePlugin<T>,
    _unshift?: Symbol,
  ) {
    if (!this.canPush('facile')) {
      const { stash } = this.options.limits;
      const hook = this.plSys.lifecycle.limitWarning;
      !hook.isEmpty()
        ? hook.emit('facile', stash)
        : console.warn(
            `The number of danmu in temporary storage exceeds the limit (${stash})`,
          );
      return false;
    }
    if (this.isBarrage(data) && plugin) {
      console.warn('When you add a barrage, the second parameter is invalid.');
    }
    this._engine.add(data, plugin, _unshift === INTERNAL_FLAG);
    this.plSys.lifecycle.push.emit(data, 'facile', true);
    return true;
  }

  public pushFlexBarrage(data: PushData<T>, options: PushFlexOptions<T>) {
    if (!this.playing()) return false;
    if (typeof options.duration === 'number' && options.duration < 0) {
      return false;
    }
    if (!this.canPush('flexible')) {
      const { view } = this.options.limits;
      const hook = this.plSys.lifecycle.limitWarning;
      !hook.isEmpty()
        ? hook.emit('flexible', view || 0)
        : console.warn(
            `The number of views barrage exceeds the limit (${view})`,
          );
      return false;
    }
    const res = this._engine.renderFlexibleBarrage(data, {
      ...options,
      viewStatus: this._viewStatus,
      bridgePlugin: createBridgePlugin(this.plSys),
      hooks: {
        finished: () => this.plSys.lifecycle.finished.emit(),
        render: (val) => this.plSys.lifecycle.render.emit(val),
        willRender: (val) => this.plSys.lifecycle.willRender.emit(val),
      },
    });
    if (res) {
      this.plSys.lifecycle.push.emit(data, 'flexible', true);
      return true;
    }
    return false;
  }

  public render() {
    if (!this.playing()) return this;
    this._engine.renderFacileBarrage({
      viewStatus: this._viewStatus,
      bridgePlugin: createBridgePlugin(this.plSys),
      hooks: {
        finished: () => this.plSys.lifecycle.finished.emit(),
        render: (val) => this.plSys.lifecycle.render.emit(val),
        willRender: (val) => this.plSys.lifecycle.willRender.emit(val),
      },
    });
    return this;
  }

  public setArea({ width, height }: { width?: string; height?: string }) {
    const size = Object.create(null) as Box['size'];
    if (width) size.x = toNumber(width) / 100;
    if (height) size.y = toNumber(height) / 100;
    if (Object.keys(size).length > 0) {
      this._engine.box.updateSize(size);
      this._engine.format();
    }
    return this;
  }

  private _setViewStatus(status: ViewStatus, filter?: FilterCallback<T>) {
    return new Promise<void>((resolve) => {
      if (this._viewStatus === status) {
        resolve();
        return;
      }
      this._viewStatus = status;
      this.plSys.lifecycle[status].emit();
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
