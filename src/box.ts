import { toNumber } from './utils';

export class Box {
  public width = 0;
  public height = 0;
  public el: HTMLDivElement;
  public size = { x: 1, y: 1 };

  public constructor() {
    this.el = document.createElement('div');
    this.el.style.overflow = 'hidden';
    this.el.style.position = 'relative';
    this.el.style.top = '0';
    this.el.style.left = '0';
  }

  public mount(c: HTMLElement) {
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    c.appendChild(this.el);
  }

  public updateSize({ x, y }: Partial<Box['size']>) {
    if (typeof x === 'number') this.size.x = x;
    if (typeof y === 'number') this.size.y = y;
  }

  public format() {
    this.el.style.width = `${this.size.x * 100}%`;
    this.el.style.height = `${this.size.y * 100}%`;
    const styles = getComputedStyle(this.el);
    this.width = toNumber(styles.width);
    this.height = toNumber(styles.height);
  }
}
