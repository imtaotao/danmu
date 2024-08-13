import { map } from 'aidly';
import { ids, toNumber } from './utils';
import type { StyleKey, SizeArea, AreaOptions } from './types';

export class Box {
  public width = 0;
  public height = 0;
  public node: HTMLDivElement;
  public container: HTMLElement | null = null;
  private _parentWidth = 0;
  private _parentHeight = 0;
  private _size = {
    x: { start: 0, end: '100%' } as SizeArea<number | string>,
    y: { start: 0, end: '100%' } as SizeArea<number | string>,
  };

  public constructor() {
    this.node = document.createElement('div');
    this.node.setAttribute('data-danmu-container', String(ids.container++));
    this.setStyle('overflow', 'hidden');
    this.setStyle('position', 'relative');
    this.setStyle('top', '0');
    this.setStyle('left', '0');
  }

  /**
   * @internal
   */
  private _sizeToNumber() {
    const size = Object.create(null) as {
      x: SizeArea<number>;
      y: SizeArea<number>;
    };
    const transform = (v: string | number, all: number) => {
      return typeof v === 'string' ? (v ? toNumber(v, all) : 0) : v;
    };
    size.x = map(this._size.x, (v) =>
      transform(v, this._parentWidth),
    ) as SizeArea<number>;
    size.y = map(this._size.y, (v) =>
      transform(v, this._parentHeight),
    ) as SizeArea<number>;
    return size;
  }

  /**
   * @internal
   */
  public _mount(container: HTMLElement) {
    this._unmount();
    this.container = container;
    this._format();
    this.container.appendChild(this.node);
  }

  /**
   * @internal
   */
  public _unmount() {
    this.container = null;
    if (this.node.parentNode) {
      this.node.parentNode.removeChild(this.node);
    }
  }

  /**
   * @internal
   */
  public _updateSize({ x, y }: AreaOptions) {
    const isLegal = (v: unknown): v is string | number => {
      return typeof v === 'string' || typeof v === 'number';
    };
    if (x) {
      if (isLegal(x.end)) this._size.x.end = x.end;
      if (isLegal(x.start)) this._size.x.start = x.start;
    }
    if (y) {
      if (isLegal(y.end)) this._size.y.end = y.end;
      if (isLegal(y.start)) this._size.y.start = y.start;
    }
  }

  /**
   * @internal
   */
  public _format() {
    if (this.container) {
      const styles = getComputedStyle(this.container);
      this._parentWidth = Number(styles.width.replace('px', ''));
      this._parentHeight = Number(styles.height.replace('px', ''));
    }
    const { x, y } = this._sizeToNumber();
    this.width = x.end - x.start;
    this.height = y.end - y.start;
    this.setStyle('left', `${x.start}px`);
    this.setStyle('top', `${y.start}px`);
    this.setStyle('width', `${this.width}px`);
    this.setStyle('height', `${this.height}px`);
  }

  public setStyle<T extends StyleKey>(key: T, val: CSSStyleDeclaration[T]) {
    this.node.style[key] = val;
  }
}
