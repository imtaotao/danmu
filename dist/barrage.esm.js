function warning (condition, message) {
  if (condition) return
  throw new Error(`Warning: ${message}`)
}
function assertArray (data) {
  if (!Array.isArray(data)) {
    throw TypeError('The barrage data must be an array.')
  }
}
function callHook (hooks, name, args = []) {
  if (typeof hooks[name] === 'function') {
    hooks[name].apply(null, args);
  }
}
function createKey () {
  return Math.random()
    .toString(36)
    .substr(2, 8)
}
function toNumber (val) {
  return typeof val === 'number'
    ? val
    : typeof val === 'string'
      ? Number(val.replace('px', ''))
      : NaN
}
function upperCase ([first, ...remaing]) {
  return first.toUpperCase() + remaing.join('')
}
const raf = window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : setTimeout;
function nextFrame (fn) {
  raf(() => {
    raf(fn);
  });
}
let transitionProp = 'transition';
let transitionEndEvent = 'transitionend';
let transitionDuration = 'transitionDuration';
if (
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
) {
  transitionProp = 'WebkitTransition';
  transitionEndEvent = 'webkitTransitionEnd';
  transitionDuration = 'webkitTransitionDuration';
}
function whenTransitionEnds (node) {
  return new Promise(resolve => {
    let isCalled = false;
    const end = () => {
      node.removeEventListener(transitionEndEvent, onEnd);
      resolve();
    };
    const onEnd = () => {
      if (!isCalled) {
        isCalled = true;
        end();
      }
    };
    node.addEventListener(transitionEndEvent, onEnd);
  })
}

class Barrage {
  constructor (itemData, time, container, RuntimeManager, direction, hooks) {
    this._width = null;
    this.hooks = hooks;
    this.paused = false;
    this.moveing = false;
    this.data = itemData;
    this.direction = direction;
    this.container = container;
    this.duration = Number(time);
    this.RuntimeManager = RuntimeManager;
    this.key = itemData.id || createKey();
    this.position = {
      y: null,
      trajectory: null,
    };
    this.timeInfo = {
      pauseTime: 0,
      startTime: null,
      prevPauseTime: null,
    };
    this.create();
  }
  getMoveDistance () {
    if (!this.moveing) return 0
    const extendDis = this.width || 0;
    const { pauseTime, startTime, prevPauseTime } = this.timeInfo;
    const currentTime = this.paused ? prevPauseTime : Date.now();
    const containerWidth = this.RuntimeManager.containerWidth + extendDis;
    const percent = (currentTime - startTime - pauseTime) / 1000 / this.duration;
    return percent * containerWidth
  }
  getWidth () {
    return new Promise(resolve => {
      let i = 0;
      const fn = () => {
        warning(++i < 99, 'Unable to get the barr width.');
        setTimeout(() => {
          let width = getComputedStyle(this.node).width;
          if (width == null || width === '') {
            fn();
          } else {
            width = toNumber(width);
            resolve(width);
          }
        });
      };
      fn();
    })
  }
  create () {
    const node = document.createElement('div');
    node.id = this.key;
    this.node = node;
    callHook(this.hooks, 'create', [node, this]);
  }
  append () {
    warning(this.container, 'Need container element.');
    if (this.node) {
      this.container.appendChild(this.node);
      this.getWidth().then(width => {
        this.width = width;
        callHook(this.hooks, 'append', [this.node, this]);
      });
    }
  }
  remove () {
    warning(this.container, 'Need container element.');
    if (this.node) {
      this.container.removeChild(this.node);
      callHook(this.hooks, 'remove', [this.node, this]);
    }
  }
  pause () {
    if (this.moveing && !this.paused) {
      let moveDistance = this.getMoveDistance();
      if (!Number.isNaN(moveDistance)) {
        this.paused = true;
        this.timeInfo.prevPauseTime = Date.now();
        if (this.direction === 'right') {
          moveDistance *= -1;
        }
        this.node;
        this.node.style[transitionDuration] = '0s';
        this.node.style.transform = `translateX(${moveDistance}px)`;
      }
    }
  }
  resume () {
    if (this.moveing && this.paused) {
      this.paused = false;
      this.timeInfo.pauseTime += Date.now() - this.timeInfo.prevPauseTime;
      this.timeInfo.prevPauseTime = null;
      const des = this.direction === 'left' ? 1 : -1;
      const containerWidth = this.RuntimeManager.containerWidth + this.width;
      const remainingTime = (1 - this.getMoveDistance() / containerWidth) * this.duration;
      this.node.style[transitionDuration] = `${remainingTime}s`;
      this.node.style.transform = `translateX(${containerWidth * des}px)`;
    }
  }
  reset () {
    this.position = {
      y: null,
      trajectory: null,
    };
    this.timeInfo = {
      pauseTime: 0,
      startTime: null,
      prevPauseTime: null,
    };
  }
}

class RuntimeManager {
  constructor ({container, rowGap = 0, height = 60}) {
    const styles = getComputedStyle(container);
    if (!styles.position || styles.position === 'static') {
      container.style.position = 'relative';
    }
    this.rowGap = rowGap;
    this.singleHeight = height;
    this.containerWidth = toNumber(styles.width);
    this.containerHeight = toNumber(styles.height);
    this.init();
  }
  init () {
    this.container = [];
    this.rows = parseInt(this.containerHeight / this.singleHeight);
    for (let i = 0; i < this.rows; i++) {
      const start = this.singleHeight * i;
      const end = this.singleHeight * (i + 1) - 1;
      this.container.push({
        values: [],
        gaps: [start, end],
      });
    }
  }
  getTrajectory (alreadyFound = []) {
    if (alreadyFound.length === this.container.length) {
      return null
    }
    const getIndex = () => {
      const randomIndex = Math.floor(Math.random() * this.rows);
      return alreadyFound.includes(randomIndex)
        ? getIndex()
        : randomIndex
    };
    const index = getIndex();
    const currentTragectory = this.container[index];
    const lastBarrage = currentTragectory.values[currentTragectory.values.length - 1];
    if (!lastBarrage) {
      return currentTragectory
    }
    alreadyFound.push(index);
    if (lastBarrage.moveing) {
      const distance = lastBarrage.getMoveDistance();
      return distance > this.rowGap
        ? currentTragectory
        : this.getTrajectory(alreadyFound)
    }
    return this.getTrajectory(alreadyFound)
  }
  move (barrage, isShow) {
    const node = barrage.node;
    node.style.top = `${barrage.position.y}px`;
    return new Promise(resolve => {
      nextFrame(() => {
        const des = barrage.direction === 'left' ? 1 : -1;
        const containerWidth = this.containerWidth + (barrage.width || 0);
        node.style.opacity = 1;
        node.style.display = isShow ? 'inline-block' : 'none';
        node.style.transform = `translateX(${des * (containerWidth)}px)`;
        node.style[transitionProp] = `transform linear ${barrage.duration}s`;
        node.style[`margin${upperCase(barrage.direction)}`] = `-${barrage.width}px`;
        barrage.moveing = true;
        barrage.timeInfo.startTime = Date.now();
        resolve(whenTransitionEnds(node));
      });
    })
  }
}

class BarrageManager {
  constructor (opts) {
    this.opts = opts;
    this.isShow = true;
    this.loopTimer = null;
    this.showBarrages = [];
    this.stashBarrages = [];
    this.RuntimeManager = new RuntimeManager(opts);
  }
  get length () {
    return this.showBarrages.length + this.stashBarrages.length
  }
  send (data) {
    assertArray(data);
    if (data.length + this.length > this.opts.capcity) {
      console.warn(`The number of barrage is greater than "${this.opts.capcity}".`);
      return false
    }
    this.stashBarrages.push.apply(this.stashBarrages, data);
    return true
  }
  show () {
    if (!this.isShow) {
      this.isShow = true;
      this.each(barrage => {
        barrage.node.style.display = 'inline-block';
      });
    }
    return this
  }
  hiden () {
    if (this.isShow) {
      this.isShow = false;
      this.each(barrage => {
        barrage.node.style.display = 'none';
      });
    }
    return this
  }
  each (cb) {
    if (typeof cb === 'function') {
      this.showBarrages.forEach(cb);
    }
    return this
  }
  stop () {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    return this
  }
  start () {
    const core = () => {
      this.loopTimer = setTimeout(() => {
        this.renderBarrage();
        core();
      }, this.opts.interval);
    };
    this.stop();
    core();
    return this
  }
  renderBarrage () {
    if (this.stashBarrages.length > 0) {
      let length = this.opts.limit - this.showBarrages.length;
      if (length > this.stashBarrages.length) {
        length = this.stashBarrages.length;
      }
      if (length > 0) {
        for (let i = 0; i < length; i++) {
          const data = this.stashBarrages.shift();
          if (data) {
            this.initSingleBarrage(data);
          }
        }
      }
    }
  }
  initSingleBarrage (data) {
    const barrage = data instanceof Barrage ? data : this.createSingleBarrage(data);
    const newBarrage = this.sureBarrageInfo(barrage);
    if (newBarrage) {
      const trajectory = newBarrage.position.trajectory;
      newBarrage.append();
      this.showBarrages.push(newBarrage);
      trajectory.values.push(newBarrage);
      this.RuntimeManager.move(newBarrage, this.isShow)
        .then(() => {
          newBarrage.remove();
          newBarrage.moveing = false;
          let index = -1;
          if (trajectory.values.length > 0) {
            index = trajectory.values.indexOf(newBarrage);
            if (~index) trajectory.values.splice(index, 1);
          }
          if (this.showBarrages.length > 0) {
            index = this.showBarrages.indexOf(newBarrage);
            if (~index) this.showBarrages.splice(index, 1);
          }
        });
    } else {
      this.stashBarrages.unshift(barrage);
    }
  }
  createSingleBarrage (data) {
    const [max, min] = this.opts.times;
    const container = this.opts.container;
    const time = (Math.random() * (max - min) + min).toFixed(0);
    return new Barrage(
      data,
      time,
      container,
      this.RuntimeManager,
      this.opts.direction,
      Object.assign({}, this.opts.hooks, {
        create: this.setBarrageStyle.bind(this),
      })
    )
  }
  sureBarrageInfo (barrage) {
    const position = barrage.position;
    const runtime = this.RuntimeManager;
    const trajectory = runtime.getTrajectory();
    if (!trajectory) return null
    position.y = trajectory.gaps[0];
    position.trajectory = trajectory;
    return barrage
  }
  setBarrageStyle (node, barrage) {
    const { hooks = {}, direction } = this.opts;
    if (typeof hooks.create === 'function') {
      hooks.create(node, barrage);
    } else {
      node.textContent = barrage.content;
      node.style.height = this.RuntimeManager.height;
    }
    node.style.opacity = 0;
    node.style[direction] = 0;
    node.style.position = 'absolute';
    node.style.display = this.isShow ? 'inline-block' : 'none';
  }
}

function createBarrage (opts = {}) {
  opts = Object.assign({
    hooks: {},
    limit: 20,
    height: 50,
    rowGap: 100,
    capcity: 1024,
    times: [8, 15],
    interval: 1000,
    direction: 'right',
  }, opts);
  return new BarrageManager(opts)
}

export default createBarrage;
//# sourceMappingURL=barrage.esm.js.map
