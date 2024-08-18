import { assert, hasOwn, random, isEmptyObject } from 'aidly';
import { FacileDanmaku } from './danmaku/facile';
import { FlexibleDanmaku } from './danmaku/flexible';
import { Engine, type EngineOptions } from './engine';
import { ids, nextFrame, INTERNAL_FLAG } from './utils';
import { createDanmakuPlugin, createManagerLifeCycle } from './lifeCycle';
import type {
  Mode,
  Danmaku,
  DanmakuType,
  StyleKey,
  Direction,
  AreaOptions,
  EachCallback,
  FreezeOptions,
  FilterCallback,
  ManagerPlugin,
  PushOptions,
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
  private _internalStatuses: InternalStatuses = Object.create(null);

  public constructor(public options: ManagerOptions) {
    this._engine = new Engine(options);
    this._internalStatuses.freeze = false;
    this._internalStatuses.viewStatus = 'show';
    this._internalStatuses.styles = Object.create(null);
    this._internalStatuses.styles.opacity = '';
    this.pluginSystem.lifecycle.init.emit(this);
  }

  /**
   * @internal
   */
  private _mergeOptions<U>(pushOptions?: U) {
    const options = pushOptions ? pushOptions : Object.create(null);
    if (!('rate' in options)) {
      options.rate = this.options.rate;
    }
    if (!('direction' in options)) {
      options.direction = this.options.direction;
    }
    if (!('duration' in options)) {
      const duration = random(...this.options.times);
      assert(duration > 0, `Invalid move time "${duration}"`);
      options.duration = duration;
    }
    return options as Required<U>;
  }

  /**
   * @internal
   */
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

  public get container() {
    return this._engine.container;
  }

  public get trackCount() {
    return this._engine.tracks.length;
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

  public isDanmaku(d: unknown): d is Danmaku<T> {
    return d instanceof FacileDanmaku || d instanceof FlexibleDanmaku;
  }

  public each(fn: EachCallback<T>) {
    this._engine.each(fn);
  }

  public asyncEach(fn: EachCallback<T>) {
    return this._engine.asyncEach(fn);
  }

  public clearTarck(i: number) {
    i = i >= 0 ? i : this.trackCount + i;
    this._engine.clearTarck(i);
  }

  public getTrackLocation(i: number) {
    i = i >= 0 ? i : this.trackCount + i;
    const [start, middle, end] = this._engine.tracks[i].location;
    return { start, middle, end };
  }

  public freeze({ preventEvents = [] }: FreezeOptions = {}) {
    let stopFlag: Symbol | undefined;
    let pauseFlag: Symbol | undefined;
    if (preventEvents.includes('stop')) stopFlag = INTERNAL_FLAG;
    if (preventEvents.includes('pause')) pauseFlag = INTERNAL_FLAG;
    this.stopPlaying(stopFlag);
    this.each((d) => d.pause(pauseFlag));
    this._internalStatuses.freeze = true;
    this.pluginSystem.lifecycle.freeze.emit();
  }

  public unfreeze({ preventEvents = [] }: FreezeOptions = {}) {
    let startFlag: Symbol | undefined;
    let resumeFlag: Symbol | undefined;
    if (preventEvents.includes('start')) startFlag = INTERNAL_FLAG;
    if (preventEvents.includes('resume')) resumeFlag = INTERNAL_FLAG;
    this.each((d) => d.resume(resumeFlag));
    this.startPlaying(startFlag);
    this._internalStatuses.freeze = false;
    this.pluginSystem.lifecycle.unfreeze.emit();
  }

  public format() {
    this._engine.format();
    this.pluginSystem.lifecycle.format.emit();
  }

  public mount(
    parentNode?: HTMLElement | string,
    { clear = true }: { clear?: boolean } = {},
  ) {
    if (parentNode) {
      if (typeof parentNode === 'string') {
        const res = document.querySelector(parentNode);
        assert(res, `Invalid "${parentNode}"`);
        parentNode = res as HTMLElement;
      }
      if (this.isPlaying()) {
        clear && this.clear(INTERNAL_FLAG);
      }
      this._engine.container._mount(parentNode);
      this.format();
      this.pluginSystem.lifecycle.mount.emit(parentNode);
    }
  }

  public unmount() {
    const { parentNode } = this.container;
    this.container._unmount();
    this.pluginSystem.lifecycle.unmount.emit(parentNode);
  }

  public clear(_flag?: Symbol) {
    this._engine.clear();
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.clear.emit();
    }
  }

  public updateOptions(newOptions: Partial<ManagerOptions>) {
    this._engine.updateOptions(newOptions);
    this.options = Object.assign(this.options, newOptions);

    if (hasOwn(newOptions, 'interval')) {
      this.stopPlaying(INTERNAL_FLAG);
      this.startPlaying(INTERNAL_FLAG);
    }
    this.pluginSystem.lifecycle.updateOptions.emit(newOptions);
  }

  public startPlaying(_flag?: Symbol) {
    if (this.isPlaying()) return;
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.start.emit();
    }
    const cycle = () => {
      this._renderTimer = setTimeout(cycle, this.options.interval);
      this.render();
    };
    cycle();
  }

  public stopPlaying(_flag?: Symbol) {
    if (!this.isPlaying()) return;
    if (this._renderTimer) {
      clearTimeout(this._renderTimer);
    }
    this._renderTimer = null;
    if (_flag !== INTERNAL_FLAG) {
      this.pluginSystem.lifecycle.stop.emit();
    }
  }

  public show(filter?: FilterCallback<T>) {
    return this._setViewStatus('show', filter);
  }

  public hide(filter?: FilterCallback<T>) {
    return this._setViewStatus('hide', filter);
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

  public unshift(data: T | FacileDanmaku<T>, options?: PushOptions<T>) {
    return this.push(data, options, INTERNAL_FLAG);
  }

  public push(
    data: T | FacileDanmaku<T>,
    options?: PushOptions<T>,
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
    if (!this.isDanmaku(data)) {
      options = this._mergeOptions(options);
    }
    this._engine.add(
      data,
      options as Required<PushOptions<T>>,
      _unshift === INTERNAL_FLAG,
    );
    this.pluginSystem.lifecycle.push.emit(data, 'facile', true);
    return true;
  }

  public pushFlexibleDanmaku(data: T, options: PushFlexOptions<T>) {
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
    const res = this._engine.renderFlexibleDanmaku(
      data,
      this._mergeOptions(options),
      {
        statuses: this._internalStatuses,
        danmakuPlugin: createDanmakuPlugin(this.pluginSystem),
        hooks: {
          finished: () => this.pluginSystem.lifecycle.finished.emit(),
          render: (val) => this.pluginSystem.lifecycle.render.emit(val),
          willRender: (val) => this.pluginSystem.lifecycle.willRender.emit(val),
        },
      },
    );
    if (res) {
      this.pluginSystem.lifecycle.push.emit(data, 'flexible', true);
      return true;
    }
    return false;
  }

  public updateOccludedUrl(
    url?: string | null,
    el?: HTMLElement | string | null,
  ) {
    let set;
    if (el) {
      if (typeof el === 'string') {
        const res = document.querySelector(el);
        assert(res, `Invalid "${el}"`);
        el = res as HTMLElement;
      }
      set = (key: string, val: string) =>
        ((el as HTMLElement).style[key as 'maskImage'] = val);
    } else {
      set = (key: string, val: string) =>
        this.container.setStyle(key as 'maskImage', val);
    }
    if (url) {
      assert(typeof url === 'string', 'The url must be a string');
      set('maskImage', `url("${url}")`);
      set('webkitMaskImage', `url("${url}")`);
      set('maskSize', 'cover');
      set('webkitMaskSize', 'cover');
    } else {
      set('maskImage', 'none');
      set('webkitMaskImage', 'none');
    }
  }

  public render() {
    this._engine.renderFacileDanmaku({
      statuses: this._internalStatuses,
      danmakuPlugin: createDanmakuPlugin(this.pluginSystem),
      hooks: {
        finished: () => this.pluginSystem.lifecycle.finished.emit(),
        render: (val) => this.pluginSystem.lifecycle.render.emit(val),
        willRender: (val) => this.pluginSystem.lifecycle.willRender.emit(val),
      },
    });
  }

  public setDirection(direction: Exclude<Direction, 'none'>) {
    this.updateOptions({ direction });
  }

  public setMode(mode: Mode) {
    this.updateOptions({ mode });
  }

  public setGap(gap: number | string) {
    this.updateOptions({ gap });
  }

  public setTrackHeight(trackHeight: number | string) {
    this.updateOptions({ trackHeight });
  }

  public setInterval(interval: number) {
    this.updateOptions({ interval });
  }

  public setTimes(times: [number, number]) {
    this.updateOptions({ times });
  }

  public setRate(rate: number) {
    if (rate !== this.options.rate) {
      this.updateOptions({ rate });
    }
  }

  public setStyle<T extends StyleKey>(key: T, val: CSSStyleDeclaration[T]) {
    const { styles } = this._internalStatuses;
    if (styles[key] !== val) {
      styles[key] = val;
      this._engine.asyncEach((d) => {
        if (d.moving) {
          d.setStyle(key, val);
        }
      });
    }
  }

  public setOpacity(opacity: number | string) {
    if (typeof opacity === 'string') {
      opacity = Number(opacity);
    }
    if (opacity < 0) {
      opacity = 0;
    } else if (opacity > 1) {
      opacity = 1;
    }
    this.setStyle('opacity', String(opacity));
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
  }

  public setArea(size: AreaOptions) {
    if (!isEmptyObject(size)) {
      this._engine.container._updateSize(size);
      this.format();
    }
  }

  public remove(pluginName: string) {
    this.pluginSystem.remove(pluginName);
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
