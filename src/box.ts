import { toNumber } from './utils';

const createEl = () => {
  const el = document.createElement('div');
  el.style.width = '100%';
  el.style.height = '100%';
  el.style.position = 'relative';
  return el;
};

export class Box {
  public width = 0;
  public height = 0;
  public el = createEl();

  public mount(container: HTMLElement) {
    container.append(this.el);
  }

  public format() {
    const styles = getComputedStyle(this.el);
    this.width = toNumber(styles.width);
    this.height = toNumber(styles.height);
  }
}
