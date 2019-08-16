export function warning (condition, message) {
  if (condition) return
  throw new Error(`Warning: ${message}`)
}

export function callHook (hooks, name, args = []) {
  if (hooks && typeof hooks[name] === 'function') {
    hooks[name].apply(null, args)
  }
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

export function lastElement (arr, lastIndex) {
  return arr[arr.length - lastIndex]
}

export function isRange ([a, b], val) {
  if (a === val || b === val) return true
  const min = Math.min(a, b)
  const max = min === a ? b : a
  return min < val && val < max
}

export function upperCase ([first, ...remaing]) {
  return first.toUpperCase() + remaing.join('')
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