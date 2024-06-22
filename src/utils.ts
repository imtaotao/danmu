import { raf } from 'aidly';

export const NO_EMIT = Symbol();

export const ids = {
  r: 1,
  f: 1,
  b: 1,
};

export const nextFrame = (fn: FrameRequestCallback) => raf(() => raf(fn));

export const toNumber = (val: number | string) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    return Number(val.replace(/^(\d+(\.\d+)?)(px|%)$/, (_, $1) => $1));
  }
  return NaN;
};

export function whenTransitionEnds(node: HTMLElement) {
  return new Promise<void>((resolve) => {
    let called = false;
    const onEnd = () => {
      if (!called) {
        called = true;
        node.removeEventListener('transitionend', onEnd);
        resolve();
      }
    };
    node.addEventListener('transitionend', onEnd);
  });
}
