export function warning (condition, message) {
  if (condition) return
  throw new Error(`Warning: ${message}`)
}

export function assertArray (data) {
  if (!Array.isArray(data)) {
    throw TypeError('The barrage data must be an array.')
  }
}

export function callHook (hooks, name, args = []) {
  if (typeof hooks[name] === 'function') {
    hooks[name].apply(null, args)
  }
}

export function createKey() {
  return Math.random()
    .toString(36)
    .substr(2, 8)
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
if (
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
) {
  transitionProp = 'WebkitTransition'
  transitionEndEvent = 'webkitTransitionEnd'
}

export function whenTransitionEnds (node) {
  return new Promise(resolve => {
    let isCalled = false
    const end = () => {
      node.removeEventListener(transitionEndEvent, onEnd)
      resolve()
    }
    const onEnd = e => {
      if (!isCalled) {
        isCalled = true
        end()
      }
    }
    node.addEventListener(transitionEndEvent, onEnd)
  })
}