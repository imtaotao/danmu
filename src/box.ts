import { toNumber } from './utils';

export class Box {
  public width = 0;
  public height = 0;
  public node: HTMLDivElement;
  public size = { x: 1, y: 1 };

  public constructor() {
    this.node = document.createElement('div');
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
    if (this.node.parentNode) {
      this.node.parentNode.removeChild(this.node);
    }
    c.appendChild(this.node);
  }

  public updateSize({ x, y }: Partial<Box['size']>) {
    if (typeof x === 'number') this.size.x = x;
    if (typeof y === 'number') this.size.y = y;
  }

  public format() {
    this.setStyle('width', `${this.size.x * 100}%`);
    this.setStyle('height', `${this.size.y * 100}%`);
    const styles = getComputedStyle(this.node);
    this.width = toNumber(styles.width);
    this.height = toNumber(styles.height);
  }
}
