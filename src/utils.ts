import { raf, once, execMathExpression } from 'aidly';

export const INTERNAL_FLAG = Symbol();

export const ids = {
  danmu: 1,
  bridge: 1,
  runtime: 1,
};

export const nextFrame = (fn: FrameRequestCallback) => raf(() => raf(fn));

export const randomIdx = (founds: Set<number>, rows: number): number => {
  const idx = Math.floor(Math.random() * rows);
  return founds.has(idx) ? randomIdx(founds, rows) : idx;
};

export const toNumber = (val: string, all: number) => {
  return execMathExpression(val, {
    units: {
      px: (n) => n,
      '%': (n) => (Number(n) / 100) * all,
    },
  });
};

export const whenTransitionEnds = (node: HTMLElement) => {
  return new Promise<void>((resolve) => {
    const onEnd = once(() => {
      node.removeEventListener('transitionend', onEnd);
      resolve();
    });
    node.addEventListener('transitionend', onEnd);
  });
};
