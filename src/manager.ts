import { assert, hasOwn, isEmptyObject } from 'aidly';
import { FacileDanmaku } from './danmaku/facile';
import { FlexibleDanmaku } from './danmaku/flexible';
import { Engine, type EngineOptions } from './engine';
import { ids, toNumber, nextFrame, INTERNAL_FLAG } from './utils';
import { createDanmakuPlugin, createManagerLifeCycle } from './lifeCycle';
import type {
  Mode,
  Danmaku,
  DanmakuType,
  DanmakuPlugin,
  PushData,
  Direction,
  AreaOptions,
  EachCallback,
  FreezeOptions,
  FilterCallback,
  ManagerPlugin,
  PushFlexOptions,
  InternalStatuses,
} from './types';

export interface ManagerOptions extends EngineOptions {
  interval: number;
}

export class Manager<
  T extends unknown,
  S extends Record<any, unknown> = Record<PropertyKey, unknown>,
> {
  public version = __VERSION__;
  public nextFrame = nextFrame;
  public statuses: S = Object.create(null);
  public pluginSystem = createManagerLifeCycle<T>();
  private _engine: Engine<T>;
  private _renderTimer: number | null = null;
  private _container: HTMLElement | null = null;
  private _internalStatuses: InternalStatuses = Object.create(null);

  public constructor(public options: ManagerOptions) {
    this._engine = new Engine(options);
    this._internalStatuses.opacity = 1;
    this._internalStatuses.freeze = false;
    this._internalStatuses.viewStatus = 'show';
    this.pluginSystem.lifecycle.init.emit(this);
  }

  private _render() {
    if (!this.isPlaying()) return this;
    this._engine.renderFacileDanmaku({
      statuses: this._internalStatuses,
      danmakuPlugin: createDanmakuPlugin(this.pluginSystem),
      hooks: {
        finished: () => this.pluginSystem.lifecycle.finished.emit(),
        render: (val) => this.pluginSystem.lifecycle.render.emit(val),
        willRender: (val) => this.pluginSystem.lifecycle.willRender.emit(val),
      },
    });
    return this;
  }

  private _setViewStatus(
    status: InternalStatuses['viewStatus'],
    filter?: FilterCallback<T>,
  ) {
    return new Promise<void>((resolve) => {
      if (this._internalStatuses.viewStatus === status) {
        resolve();
        return;
      }
      this._internalStatuses.viewStatus = status;
      this.pluginSystem.lifecycle[status].emit();
      this._engine
        .asyncEach((b) => {
          if (this._internalStatuses.viewStatus === status) {
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

  public get box() {
    return this._engine.box;
  }

  public len() {
    return this._engine.len();
  }

  public isShow() {
    return this._internalStatuses.viewStatus === 'show';
  }

  public isFreeze() {
    return this._internalStatuses.freeze === true;
  }

  public isPlaying() {
    return this._renderTimer !== null;
  }

  public isDanmaku(b: unknown): b is Danmaku<T> {
    return b instanceof FacileDanmaku || b instanceof FlexibleDanmaku;
  }

  public each(fn: EachCallback<T>) {
    this._engine.each(fn);
    return this;
  }

  public asyncEach(fn: EachCallback<T>) {
    return this._engine.asyncEach(fn).then(() => this);
  }

  public freeze({ preventEvents = [] }: FreezeOptions = {}) {
    let stopFlag: Symbol | undefined;
    let pauseFlag: Symbol | undefined;
    if (preventEvents.includes('stop')) stopFlag = INTERNAL_FLAG;
    if (preventEvents.includes('pause')) pauseFlag = INTERNAL_FLAG;
    this.stopPlaying(stopFlag);
    this.each((b) => b.pause(pauseFlag));
    this._internalStatuses.freeze = true;
    this.pluginSystem.lifecycle.freeze.emit();
  }

  public unfreeze({ preventEvents = [] }: FreezeOptions = {}) {
    let startFlag: Symbol | undefined;
    let resumeFlag: Symbol | undefined;
    if (preventEvents.includes('start')) startFlag = INTERNAL_FLAG;
    if (preventEvents.includes('resume')) resumeFlag = INTERNAL_FLAG;
    this.each((b) => b.resume(resumeFlag));
    this.startPlaying(startFlag);
    this._internalStatuses.freeze = false;
    this.pluginSystem.lifecycle.unfreeze.emit();
  }

  public format() {
    this._engine.format();
    this.pluginSystem.lifecycle.format.emit();
    return this;
  }

  public mount(
    container?: HTMLElement | string,
    { clear = true }: { clear?: boolean } = {},
  ) {
    if (!container) return this;
    if (typeof container === 'string') {
      this._container = document.querySelector(container);
    } else {
      this._container = container;
    }
    assert(this._container, `Invalid "${container}"`);
    if (this.isPlaying()) {
      clear && this.clear(INTERNAL_FLAG);
    }
    this._engine.box._mount(this._container);
    this.format();
    this.pluginSystem.lifecycle.mount.emit();
    return this;
  }

  public unmount() {
    this.box._unmount();
    this._container = null;
    this.pluginSystem.lifecycle.unmount.emit();
    return this;
  }

  public clear(_flag?: Symbol) {
    // No need to use `destroy` to save loop times
    this.each((b) => b._removeNode());
    this._engine.clear();
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.clear.emit();
    }
    return this;
  }

  public updateOptions(newOptions: Partial<ManagerOptions>) {
    this._engine.updateOptions(newOptions);
    this.options = Object.assign(this.options, newOptions);

    if (hasOwn(newOptions, 'interval')) {
      this.stopPlaying(INTERNAL_FLAG);
      this.startPlaying(INTERNAL_FLAG);
    }
    this.pluginSystem.lifecycle.updateOptions.emit(newOptions);
    return this;
  }

  public startPlaying(_flag?: Symbol) {
    if (this.isPlaying()) return this;
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.start.emit();
    }
    const cycle = () => {
      this._renderTimer = setTimeout(cycle, this.options.interval);
      this._render();
    };
    cycle();
    return this;
  }

  public stopPlaying(_flag?: Symbol) {
    if (!this.isPlaying()) return this;
    if (this._renderTimer) {
      clearTimeout(this._renderTimer);
    }
    this._renderTimer = null;
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.stop.emit();
    }
    return this;
  }

  public show(filter?: FilterCallback<T>) {
    return this._setViewStatus('show', filter).then(() => this);
  }

  public hide(filter?: FilterCallback<T>) {
    return this._setViewStatus('hide', filter).then(() => this);
  }

  public canPush(type: DanmakuType) {
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
    data: PushData<T> | FacileDanmaku<T>,
    plugin?: DanmakuPlugin<T>,
  ) {
    return this.push(data, plugin, INTERNAL_FLAG);
  }

  public push(
    data: PushData<T> | FacileDanmaku<T>,
    plugin?: DanmakuPlugin<T>,
    _unshift?: Symbol,
  ) {
    if (!this.canPush('facile')) {
      const { stash } = this.options.limits;
      const hook = this.pluginSystem.lifecycle.limitWarning;
      !hook.isEmpty()
        ? hook.emit('facile', stash)
        : console.warn(
            `The number of danmu in temporary storage exceeds the limit (${stash})`,
          );
      return false;
    }
    if (this.isDanmaku(data) && plugin) {
      console.warn('When you add a danmaku, the second parameter is invalid.');
    }
    this._engine.add(data, plugin, _unshift === INTERNAL_FLAG);
    this.pluginSystem.lifecycle.push.emit(data, 'facile', true);
    return true;
  }

  public pushFlexibleDanmaku(data: PushData<T>, options: PushFlexOptions<T>) {
    if (!this.isPlaying()) return false;
    if (typeof options.duration === 'number' && options.duration < 0) {
      return false;
    }
    if (!this.canPush('flexible')) {
      const { view } = this.options.limits;
      const hook = this.pluginSystem.lifecycle.limitWarning;
      !hook.isEmpty()
        ? hook.emit('flexible', view || 0)
        : console.warn(
            `The number of views danmaku exceeds the limit (${view})`,
          );
      return false;
    }
    const res = this._engine.renderFlexibleDanmaku(data, {
      ...options,
      statuses: this._internalStatuses,
      danmakuPlugin: createDanmakuPlugin(this.pluginSystem),
      hooks: {
        finished: () => this.pluginSystem.lifecycle.finished.emit(),
        render: (val) => this.pluginSystem.lifecycle.render.emit(val),
        willRender: (val) => this.pluginSystem.lifecycle.willRender.emit(val),
      },
    });
    if (res) {
      this.pluginSystem.lifecycle.push.emit(data, 'flexible', true);
      return true;
    }
    return false;
  }

  public updateOccludedUrl(url?: string | null, el?: HTMLElement | null) {
    const setStyle = (
      key: 'maskSize' | 'maskImage' | 'webkitMaskSize' | 'webkitMaskImage',
      val: string,
    ) => {
      if (el) {
        el.style[key] = val;
      } else {
        this.box.setStyle(key, val);
      }
    };
    if (url) {
      assert(typeof url === 'string', 'The url must be a string');
      setStyle('maskImage', `url("${url}")`);
      setStyle('webkitMaskImage', `url("${url}")`);
      setStyle('maskSize', 'cover');
      setStyle('webkitMaskSize', 'cover');
    } else {
      setStyle('maskImage', 'none');
      setStyle('webkitMaskImage', 'none');
    }
    return this;
  }

  public setDirection(direction: Direction) {
    return this.updateOptions({ direction });
  }

  public setMode(mode: Mode) {
    return this.updateOptions({ mode });
  }

  public setGap(gap: number | string) {
    return this.updateOptions({ gap });
  }

  public setTrackHeight(trackHeight: number | string) {
    return this.updateOptions({ trackHeight });
  }

  public setInterval(interval: number) {
    return this.updateOptions({ interval });
  }

  public setTimes(times: [number, number]) {
    return this.updateOptions({ times });
  }

  public setRate(rate: number) {
    if (rate !== this.options.rate) {
      this.updateOptions({ rate });
    }
    return this;
  }

  public setOpacity(opacity: number) {
    if (opacity < 0) opacity = 0;
    else if (opacity > 1) opacity = 1;
    if (opacity !== this._internalStatuses.opacity) {
      this._internalStatuses.opacity = opacity;
      this._engine.asyncEach((b) => {
        if (b.moving) {
          b.setStyle('opacity', String(opacity));
        }
      });
    }
    return this;
  }

  public setLimits({ view, stash }: { view?: number; stash?: number }) {
    let needUpdate = false;
    const limits = Object.assign({}, this.options.limits);
    if (typeof view === 'number') {
      needUpdate = true;
      limits.view = view;
    }
    if (typeof stash === 'number') {
      needUpdate = true;
      limits.stash = stash;
    }
    if (needUpdate) {
      this.updateOptions({ limits });
    }
    return this;
  }

  public setArea({ x, y }: AreaOptions) {
    const size = Object.create(null);
    if (x) {
      if (!size.x) size.x = Object.create(null);
      if (x.end) size.x.end = toNumber(x.end) / 100;
      if (x.start) size.x.start = toNumber(x.start) / 100;
    }
    if (y) {
      if (!size.y) size.y = Object.create(null);
      if (y.end) size.y.end = toNumber(y.end) / 100;
      if (y.start) size.y.start = toNumber(y.start) / 100;
    }
    if (!isEmptyObject(size)) {
      this._engine.box._updateSize(size);
      this.format();
    }
    return this;
  }

  public remove(pluginName: string) {
    this.pluginSystem.remove(pluginName);
    return this;
  }

  public use(plugin: ManagerPlugin<T> | ((m: this) => ManagerPlugin<T>)) {
    if (typeof plugin === 'function') plugin = plugin(this);
    if (!plugin.name) {
      plugin.name = `__runtime_plugin_${ids.runtime++}__`;
    }
    this.pluginSystem.useRefine(plugin);
    return plugin as ManagerPlugin<T> & { name: string };
  }
}
