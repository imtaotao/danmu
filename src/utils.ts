import { raf, once, mathExprEvaluate } from 'aidly';
import { Distribution } from './types';

export const INTERNAL_FLAG = Symbol();

export const ids = {
  danmu: 1,
  bridge: 1,
  runtime: 1,
  container: 1,
};

export const nextFrame = (fn: FrameRequestCallback) => raf(() => raf(fn));

export const getTrackIdx = (
  founds: Set<number>,
  rows: number,
  distribution: Distribution = 'random',
): number => {
  if (distribution === 'order') {
    for (let i = 0; i < rows; i++) {
      if (!founds.has(i)) {
        return i;
      }
    }
  }
  const n = Math.floor(Math.random() * rows);
  return founds.has(n) ? getTrackIdx(founds, rows, distribution) : n;
};

export const toNumber = (val: string, all: number) => {
  return mathExprEvaluate(val, {
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
