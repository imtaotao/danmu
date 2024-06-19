import { raf } from 'aidly';

export const NO_EMIT = Symbol();

export const ids = {
  r: 1,
  f: 1,
  b: 1,
};

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
