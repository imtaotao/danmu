export interface BoxOptions {}

export class Box {
  public el = document.createElement('div');

  public constructor(public options: BoxOptions) {}

  public mount(container: HTMLElement) {}

  private _format() {}
}
