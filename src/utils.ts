import { raf } from 'aidly';

let id = 1;
export const createId = () => id++;

export const NO_EMIT = Symbol();

export const nextFrame = (fn: FrameRequestCallback) => raf(() => raf(fn));

export const toNumber = (val: number | string) => {
  return typeof val === 'number'
    ? val
    : typeof val === 'string'
      ? Number(val.replace('px', ''))
      : NaN;
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
