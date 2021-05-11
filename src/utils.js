export function warning (condition, message) {
  if (condition) return
  throw new Error(`Warning: ${message}`)
}

export function callHook (hooks, name, args = []) {
  if (hooks && typeof hooks[name] === 'function') {
    return hooks[name].apply(null, args)
  }
  return null
}

export function createKey () {
  return Math.random()
    .toString(36)
    .substr(2, 8)
}

export function toNumber (val) {
  return typeof val === 'number'
    ? val
    : typeof val === 'string'
      ? Number(val.replace('px', ''))
      : NaN
}

export function isRange ([a, b], val) {
  if (val === a || val === b) return true
  const min = Math.min(a, b)
  const max = min === a ? b : a
  return min < val && val < max
}

export function upperCase ([first, ...remaing]) {
  return first.toUpperCase() + remaing.join('')
}

export function timeSlice (len, fn) {
  let i = -1
  let start = performance.now()
  const run = () => {
    while(++i < len) {
      if (fn() === false) {
        break
      }
      const cur = performance.now()
      if (cur - start > 13) {
        start = cur
        setTimeout(run)
        break
      }
    }
  }
  run()
}

const raf = window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : setTimeout

export function nextFrame (fn) {
  raf(() => {
    raf(fn)
  })
}

export let transitionProp = 'transition'
export let transitionEndEvent = 'transitionend'
export let transitionDuration = 'transitionDuration'
if (
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
) {
  transitionProp = 'WebkitTransition'
  transitionEndEvent = 'webkitTransitionEnd'
  transitionDuration = 'webkitTransitionDuration'
}

export function whenTransitionEnds (node) {
  return new Promise(resolve => {
    let isCalled = false
    const end = () => {
      node.removeEventListener(transitionEndEvent, onEnd)
      resolve()
    }
    const onEnd = () => {
      if (!isCalled) {
        isCalled = true
        end()
      }
    }
    node.addEventListener(transitionEndEvent, onEnd)
  })
}