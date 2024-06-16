import { hasOwn } from 'aidly';
import { Engine, type EngineOptions } from './engine';
import { NO_EMIT, createId } from './utils';
import { createBridgePlugin, createManagerLifeCycle } from './lifeCycle';
import type {
  ViewStatus,
  EachCallback,
  FilterCallback,
  FacilePlugin,
  StreamPlugin,
} from './types';

export interface StreamOptions extends EngineOptions {
  interval: number;
  stashLimit: number;
}

export class StreamManager<T extends unknown> {
  public version = __VERSION__;
  private _engine: Engine<T>;
  private _viewStatus: ViewStatus = 'show';
  private _renderTimer: number | null = null;
  private _plSys = createManagerLifeCycle<T>();

  public constructor(public options: StreamOptions) {
    this._engine = new Engine(options);
  }

  public n() {
    return this._engine.n();
  }

  public playing() {
    return this._renderTimer !== null;
  }

  public each(fn: EachCallback<T>) {
    return this._engine.each(fn);
  }

  public asyncEach(fn: EachCallback<T>) {
    return this._engine.asyncEach(fn);
  }

  public getContainer() {
    return this._engine.box;
  }

  public format() {
    this._engine.format();
    this._plSys.lifecycle.resize.emit();
  }

  public clear() {
    this.stopPlaying();
    this.each((b) => b.removeNode());
    this._engine.clear();
    this._plSys.lifecycle.clear.emit();
  }

  public usePlugin(plugin: StreamPlugin<T>) {
    plugin.name = plugin.name || `__runtime_plugin_${createId()}__`;
    this._plSys.use(plugin as StreamPlugin<T> & { name: string });
  }

  public updateOptions(newOptions: Partial<StreamOptions>) {
    this._engine.updateOptions(newOptions);
    this.options = Object.assign(this.options, newOptions);

    if (hasOwn(newOptions, 'interval')) {
      this.stopPlaying(NO_EMIT);
      this.startPlaying(NO_EMIT);
    }
    this._plSys.lifecycle.updateOptions.emit(this.options);
  }

  public show(filter?: FilterCallback<T>) {
    return this._changeViewStatus('show', filter);
  }

  public hide(filter?: FilterCallback<T>) {
    return this._changeViewStatus('hide', filter);
  }

  public push(data: T, plugin?: FacilePlugin<T>) {
    if (!this._canSend()) return false;
    this._engine.add(data, plugin, true);
    this._plSys.lifecycle.push.emit(data, true);
    return true;
  }

  public unshift(data: T, plugin?: FacilePlugin<T>) {
    if (!this._canSend()) return false;
    this._engine.add(data, plugin, false);
    this._plSys.lifecycle.push.emit(data, false);
    return true;
  }

  public startPlaying(_flag?: Symbol) {
    if (this.playing()) return;
    if (!this._engine.box) {
      this._engine.format();
    }
    this._plSys.lock();
    if (_flag !== NO_EMIT) {
      this._plSys.lifecycle.start.emit();
    }
    const cycle = () => {
      this._renderTimer = setTimeout(cycle, this.options.interval);
      this.render();
    };
    cycle();
  }

  public stopPlaying(_flag?: Symbol) {
    if (!this.playing()) return;
    if (this._renderTimer) {
      clearTimeout(this._renderTimer);
    }
    this._renderTimer = null;
    if (_flag !== NO_EMIT) {
      this._plSys.lifecycle.stop.emit();
    }
    this._plSys.unlock();
  }

  public render() {
    if (!this.playing()) return;
    this._engine.render({
      viewStatus: this._viewStatus,
      bridgePlugin: createBridgePlugin(this._plSys),
      hooks: {
        render: () => this._plSys.lifecycle.render.emit(),
        finished: () => this._plSys.lifecycle.finished.emit(),
        willRender: (val) => this._plSys.lifecycle.willRender.emit(val),
      },
    });
  }

  private _canSend() {
    const { stashLimit } = this.options;
    const res = this._engine.n().stash >= stashLimit;
    if (res) {
      const hook = this._plSys.lifecycle.stashWarning;
      if (hook.isEmpty()) {
        console.warn(
          'The number of danmu in temporary storage exceeds the limit.' +
            `(${stashLimit})`,
        );
      } else {
        hook.emit(stashLimit);
      }
    }
    return !res;
  }

  private _changeViewStatus(status: ViewStatus, filter?: FilterCallback<T>) {
    return new Promise<void>((resolve) => {
      if (this._viewStatus === status) {
        resolve();
        return;
      }
      this._viewStatus = status;
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
