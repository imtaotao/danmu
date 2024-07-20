import { assert } from 'aidly';
import { toNumber } from './utils';

export class Box {
  public width = 0;
  public height = 0;
  public node: HTMLDivElement;
  public size = {
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

  public setStyle<
    T extends keyof Omit<CSSStyleDeclaration, 'length' | 'parentRule'>,
  >(key: T, val: CSSStyleDeclaration[T]) {
    this.node.style[key] = val;
  }

  public mount(c: HTMLElement) {
    this.unmount();
    c.appendChild(this.node);
  }

  public unmount() {
    if (this.node.parentNode) {
      this.node.parentNode.removeChild(this.node);
    }
  }

  public updateSize({ x, y }: Partial<Box['size']>) {
    const check = (p: 'x' | 'y') => {
      assert(
        this.size[p].end >= this.size[p].start,
        'The end coordinate must be greater than the start coordinate',
      );
    };
    if (x) {
      if (typeof x.end === 'number') this.size.x.end = x.end;
      if (typeof x.start === 'number') this.size.x.start = x.start;
      check('x');
    }
    if (y) {
      if (typeof y.end === 'number') this.size.y.end = y.end;
      if (typeof y.start === 'number') this.size.y.start = y.start;
      check('y');
    }
  }

  public updateOccluded(url?: string | null) {
    if (url && typeof url === 'string') {
      this.setStyle('maskSize', 'cover');
      this.setStyle('maskImage', `url(${url})`);
      this.setStyle('webkitMaskSize', 'cover');
      this.setStyle('webkitMaskImage', `url(${url})`);
    } else {
      this.setStyle('maskImage', 'none');
      this.setStyle('webkitMaskImage', 'none');
    }
  }

  public format() {
    const w = this.size.x.end - this.size.x.start;
    const h = this.size.y.end - this.size.y.start;
    this.setStyle('width', `${w * 100}%`);
    this.setStyle('height', `${h * 100}%`);
    this.setStyle('left', `${this.size.x.start * 100}%`);
    this.setStyle('top', `${this.size.y.start * 100}%`);
    const styles = getComputedStyle(this.node);
    this.width = toNumber(styles.width);
    this.height = toNumber(styles.height);
  }
}
