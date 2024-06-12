import type { TrackData } from "../moveAlgorithm";

export interface SimpleBarrageOptions {}

export class SimpleBarrage {
  public paused = true;
  public moving = false;
  public duration = 0;
  public position = { y: 0 };
  public isChangeDuration = false;
  public direction: "left" | "right" = "right";
  public trackData: TrackData = { bs: [], gaps: [0, 0] };
  public node: HTMLElement = document.createElement("div");
  public recorder = {
    pt: 0, // 总共暂停了多少时间
    st: 0, // 开始移动的时间
    ppt: 0, // 上次暂停的时间
    cd: 0, // 当前实时运动时间，因为每次暂停会重置 transition duration
  };

  public constructor(private options: SimpleBarrageOptions) {}

  public getWidth() {
    return 0;
  }

  public getMoveDistance() {
    return 0;
  }

  public getMovePercent() {
    return 0;
  }

  public getSpeed() {
    return 0;
  }

  public reset() {}

  public setStyle(key: keyof CSSStyleDeclaration, val: unknown) {}
}
