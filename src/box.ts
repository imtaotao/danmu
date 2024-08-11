import { assert } from 'aidly';
import { toNumber } from './utils';
import type { StyleKey } from './types';

export class Box {
  public width = 0;
  public height = 0;
  public node: HTMLDivElement;
  private _size = {
    x: { start: 0, end: 1 },
    y: { start: 0, end: 1 },
  };

  public constructor() {
    this.node = document.createElement('div');
    this.node.setAttribute('data-danmu-container', '1');
    this.setStyle('overflow', 'hidden');
    this.setStyle('position', 'relative');
    this.setStyle('top', '0');
    this.setStyle('left', '0');
  }

  public setStyle<T extends StyleKey>(key: T, val: CSSStyleDeclaration[T]) {
    this.node.style[key] = val;
  }

  /**
   * @internal
   */
  public _mount(c: HTMLElement) {
    this._unmount();
    c.appendChild(this.node);
  }

  /**
   * @internal
   */
  public _unmount() {
    if (this.node.parentNode) {
      this.node.parentNode.removeChild(this.node);
    }
  }

  /**
   * @internal
   */
  public _updateSize({ x, y }: Partial<Box['_size']>) {
    const { _size } = this;
    const check = (p: 'x' | 'y') => {
      assert(
        _size[p].end >= _size[p].start,
        'The end coordinate must be greater than the start coordinate',
      );
    };
    if (x) {
      if (typeof x.end === 'number') _size.x.end = x.end;
      if (typeof x.start === 'number') _size.x.start = x.start;
      check('x');
    }
    if (y) {
      if (typeof y.end === 'number') _size.y.end = y.end;
      if (typeof y.start === 'number') _size.y.start = y.start;
      check('y');
    }
  }

  /**
   * @internal
   */
  public _format() {
    const { _size, node } = this;
    const w = _size.x.end - _size.x.start;
    const h = _size.y.end - _size.y.start;
    this.setStyle('width', `${w * 100}%`);
    this.setStyle('height', `${h * 100}%`);
    this.setStyle('left', `${_size.x.start * 100}%`);
    this.setStyle('top', `${_size.y.start * 100}%`);
    const styles = getComputedStyle(node);
    this.width = toNumber(styles.width, 0);
    this.height = toNumber(styles.height, 0);
  }
}
