let id = 1;
export const createId = () => id++;

const raf = window.requestAnimationFrame
  ? window.requestAnimationFrame.bind(window)
  : setTimeout;

export let transitionProp = "transition";
export let transitionEndEvent = "transitionend";
export let transitionDuration = "transitionDuration";

if (
  window.ontransitionend === undefined &&
  window.onwebkittransitionend !== undefined
) {
  transitionProp = "WebkitTransition";
  transitionEndEvent = "webkitTransitionEnd";
  transitionDuration = "webkitTransitionDuration";
}

export const nextFrame = (fn: FrameRequestCallback) => raf(() => raf(fn));

export const upperCase = ([val, ...args]: Array<string>) =>
  val.toUpperCase() + args.join("");

export const assert = (
  condition: unknown,
  error?: string,
): asserts condition => {
  if (!condition) {
    throw new Error(error);
  }
};

export const toNumber = (val: number | string) => {
  return typeof val === "number"
    ? val
    : typeof val === "string"
      ? Number(val.replace("px", ""))
      : NaN;
};

export const isRange = ([a, b]: Array<number>, val: number) => {
  if (val === a || val === b) return true;
  const min = Math.min(a, b);
  const max = min === a ? b : a;
  return min < val && val < max;
};

export function timeSlice(l: number, fn: () => void | boolean) {
  let i = -1;
  let start = performance.now();
  const run = () => {
    while (++i < l) {
      if (fn() === false) break;
      const cur = performance.now();
      if (cur - start > 13) {
        start = cur;
        setTimeout(run);
        break;
      }
    }
  };
  run();
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
