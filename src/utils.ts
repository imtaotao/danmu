let id = 1;
export const createId = () => id++;

export const NO_EMIT = Symbol();

const raf =
  typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : setTimeout;

export const transitionProp = 'transition' as const;
export const transitionEndEvent = 'transitionend' as const;
export const transitionDuration = 'transitionDuration' as const;

export const nextFrame = (fn: FrameRequestCallback) => raf(() => raf(fn));

export const now =
  typeof performance.now === 'function' ? () => performance.now() : Date.now;

export const toUpperCase = ([val, ...args]: string) =>
  val.toUpperCase() + args.join('');

export const toLowerCase = ([val, ...args]: string) =>
  val.toLowerCase() + args.join('');

export const hasOwn = (obj: unknown, key: string) =>
  Object.hasOwnProperty.call(obj, key);

export const toNumber = (val: number | string) => {
  return typeof val === 'number'
    ? val
    : typeof val === 'string'
      ? Number(val.replace('px', ''))
      : NaN;
};

export const isRange = ([a, b]: Array<number>, val: number) => {
  if (val === a || val === b) return true;
  const min = Math.min(a, b);
  const max = min === a ? b : a;
  return min < val && val < max;
};

// Give the current task one frame of time (13ms).
// If it exceeds one frame, the remaining tasks will be put into the next frame.
export function loopSlice(l: number, fn: (i: number) => void | boolean) {
  return new Promise<void>((resolve) => {
    let i = -1;
    let start = now();
    const run = () => {
      while (++i < l) {
        if (fn(i) === false) {
          resolve();
          break;
        }
        if (i === l - 1) {
          resolve();
        } else {
          const t = now();
          if (t - start > 13) {
            start = t;
            setTimeout(run);
            break;
          }
        }
      }
    };
    run();
  });
}

export function whenTransitionEnds(node: HTMLElement) {
  return new Promise<void>((resolve) => {
    let called = false;
    const onEnd = () => {
      if (!called) {
        called = true;
        node.removeEventListener(transitionEndEvent, onEnd);
        resolve();
      }
    };
    node.addEventListener(transitionEndEvent, onEnd);
  });
}

// TypeScript cannot use arrowFunctions for assertions.
export function assert(condition: unknown, error?: string): asserts condition {
  if (!condition) {
    throw new Error(error || 'Unexpected error');
  }
}
