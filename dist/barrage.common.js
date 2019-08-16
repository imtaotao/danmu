'use strict';

function warning (condition, message) {
  if (condition) return
  throw new Error(`Warning: ${message}`)
}
function callHook (hooks, name, args = []) {
  if (hooks && typeof hooks[name] === 'function') {
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
function lastElement (arr, lastIndex) {
  return arr[arr.length - lastIndex]
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
  constructor (itemData, time, manager, hooks) {
    const RuntimeManager = manager.RuntimeManager;
    const { direction, container } = manager.opts;
    time = Number(time);
    this.node = null;
    this.hooks = hooks;
    this.paused = false;
    this.moveing = false;
    this.data = itemData;
    this.duration = time;
    this.trajectory = null;
    this.manager = manager;
    this.direction = direction;
    this.container = container;
    this.RuntimeManager = RuntimeManager;
    this.key = itemData.id || createKey();
    this.position = {
      y: null,
    };
    this.timeInfo = {
      pauseTime: 0,
      startTime: null,
      prevPauseTime: null,
      currentDuration: time,
    };
    this.create();
  }
  getMovePrecent () {
    const { pauseTime, startTime, prevPauseTime } = this.timeInfo;
    const currentTime = this.paused ? prevPauseTime : Date.now();
    return (currentTime - startTime - pauseTime) / 1000 / this.duration
  }
  getMoveDistance () {
    if (!this.moveing) return 0
    const percent = this.getMovePrecent();
    const containerWidth = this.RuntimeManager.containerWidth + this.getWidth();
    return percent * containerWidth
  }
  getHeight () {
    return (this.node && this.node.clientHeight) || 0
  }
  getWidth () {
    return (this.node && this.node.clientWidth) || 0
  }
  getSpeed () {
    const duration = this.timeInfo.currentDuration;
    const containerWidth = this.RuntimeManager.containerWidth + this.getWidth();
    return duration == null || containerWidth == null
      ? 0
      : containerWidth / duration
  }
  create () {
    const node = document.createElement('div');
    node.id = this.key;
    this.node = node;
    callHook(this.hooks, 'barrageCreate', [node, this]);
  }
  append () {
    warning(this.container, 'Need container element.');
    if (this.node) {
      this.container.appendChild(this.node);
      callHook(this.hooks, 'barrageAppend', [this.node, this]);
    }
  }
  remove () {
    warning(this.container, 'Need container element.');
    if (this.node) {
      this.container.removeChild(this.node);
      callHook(this.hooks, 'barrageRemove', [this.node, this]);
    }
  }
  deletedInMemory () {
    let index = -1;
    const trajectory = this.trajectory;
    const showBarrages = this.manager.showBarrages;
    if (trajectory && trajectory.values.length > 0) {
      index = trajectory.values.indexOf(this);
      if (~index) trajectory.values.splice(index, 1);
    }
    if (showBarrages && showBarrages.length > 0) {
      index = showBarrages.indexOf(this);
      if (~index) showBarrages.splice(index, 1);
    }
  }
  destroy () {
    this.remove();
    this.moveing = false;
    this.deletedInMemory();
    callHook(this.hooks, 'barrageDestroy', [this.node, this]);
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
      const containerWidth = this.RuntimeManager.containerWidth + this.getWidth();
      const remainingTime = (1 - this.getMoveDistance() / containerWidth) * this.duration;
      this.timeInfo.currentDuration = remainingTime;
      this.node.style[transitionDuration] = `${remainingTime}s`;
      this.node.style.transform = `translateX(${containerWidth * des}px)`;
    }
  }
  reset () {
    this.position = {
      y: null,
    };
    this.timeInfo = {
      pauseTime: 0,
      startTime: null,
      prevPauseTime: null,
      currentDuration: this.duration,
    };
    this.trajectory = null;
  }
}

class RuntimeManager {
  constructor ({container, rowGap, height}) {
    const styles = getComputedStyle(container);
    if (!styles.position || styles.position === 'static') {
      container.style.position = 'relative';
    }
    this.rowGap = rowGap;
    this.singleHeight = height;
    this.containerElement = container;
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
  resize () {
    const styles = getComputedStyle(this.containerElement);
    this.containerWidth = toNumber(styles.width);
    this.containerHeight = toNumber(styles.height);
    this.rows = parseInt(this.containerHeight / this.singleHeight);
    const container = [];
    for (let i = 0; i < this.rows; i++) {
      const start = this.singleHeight * i;
      const end = this.singleHeight * (i + 1) - 1;
      const gaps = [start, end];
      if (this.container[i]) {
        this.container[i].gaps = gaps;
        container.push(this.container[i]);
      } else {
        container.push({ gaps, values: [] });
      }
    }
    this.container = container;
  }
  getRandomIndex (exclude) {
    const randomIndex = Math.floor(Math.random() * this.rows);
    return exclude.includes(randomIndex)
      ? this.getRandomIndex(exclude)
      : randomIndex
  }
  getTrajectory (alreadyFound = []) {
    if (alreadyFound.length === this.container.length) {
      return null
    }
    const index = this.getRandomIndex(alreadyFound);
    const currentTrajectory = this.container[index];
    const lastBarrage = lastElement(currentTrajectory.values, 1);
    if (!lastBarrage) {
      return currentTrajectory
    }
    alreadyFound.push(index);
    if (lastBarrage.moveing) {
      const distance = lastBarrage.getMoveDistance();
      return distance > this.rowGap
        ? currentTrajectory
        : this.getTrajectory(alreadyFound)
    }
    return this.getTrajectory(alreadyFound)
  }
  computingDuration (prevBarrage, currentBarrage) {
    const acceleration = currentBarrage.getSpeed() - prevBarrage.getSpeed();
    if (acceleration <= 0) {
      return currentBarrage.duration
    }
    const distance = prevBarrage.getMoveDistance();
  }
  move (barrage, isShow, failed) {
    const node = barrage.node;
    const prevBarrage = lastElement(barrage.trajectory.values, 2);
    node.style.top = `${barrage.position.y}px`;
    return new Promise(resolve => {
      nextFrame(() => {
        const width = barrage.getWidth();
        const des = barrage.direction === 'left' ? 1 : -1;
        const containerWidth = this.containerWidth + width;
        if (
            prevBarrage &&
            this.rowGap > 0 &&
            prevBarrage.moveing &&
            !prevBarrage.paused
        ) {
          this.computingDuration(prevBarrage, barrage);
        }
        node.style.opacity = 1;
        node.style.pointerEvents = isShow ? 'auto' : 'none';
        node.style.visibility = isShow ? 'visible' : 'hidden';
        node.style.transform = `translateX(${des * (containerWidth)}px)`;
        node.style[transitionProp] = `transform linear ${barrage.duration}s`;
        node.style[`margin${upperCase(barrage.direction)}`] = `-${width}px`;
        barrage.moveing = true;
        barrage.timeInfo.startTime = Date.now();
        if (barrage.hooks) {
          callHook(barrage.hooks, 'barrageMove', [node, barrage]);
        }
        resolve(whenTransitionEnds(node));
      });
    })
  }
}

class BarrageManager {
  constructor (opts) {
    this.opts = opts;
    this.loopTimer = null;
    this.showBarrages = [];
    this.stashBarrages = [];
    this.isShow = opts.isShow;
    this.container = opts.container;
    this.RuntimeManager = new RuntimeManager(opts);
  }
  get length () {
    return this.showBarrages.length + this.stashBarrages.length
  }
  get showLength () {
    return this.showBarrages.length
  }
  get stashLength () {
    return this.stashBarrages.length
  }
  get runing () {
    return this.loopTimer !== null
  }
  send (data) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    if (data.length + this.length > this.opts.capcity) {
      console.warn(`The number of barrage is greater than "${this.opts.capcity}".`);
      return false
    }
    this.stashBarrages.push.apply(this.stashBarrages, data);
    callHook(this.opts.hooks, 'send', [this, data]);
    return true
  }
  show () {
    if (!this.isShow) {
      this.isShow = true;
      this.each(barrage => {
        barrage.node.style.visibility = 'visible';
        barrage.node.style.pointerEvents = 'auto';
      });
      callHook(this.opts.hooks, 'show', [this]);
    }
    return this
  }
  hidden () {
    if (this.isShow) {
      this.isShow = false;
      this.each(barrage => {
        barrage.node.style.visibility = 'hidden';
        barrage.node.style.pointerEvents = 'none';
      });
      callHook(this.opts.hooks, 'hidden', [this]);
    }
    return this
  }
  each (cb) {
    if (typeof cb === 'function') {
      this.showBarrages.forEach(cb);
    }
    return this
  }
  stop (noCallHook) {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
      if (!noCallHook) {
        callHook(this.opts.hooks, 'stop', [this]);
      }
    }
    return this
  }
  start (noCallHook) {
    const core = () => {
      this.loopTimer = setTimeout(() => {
        this.renderBarrage();
        core();
      }, this.opts.interval);
    };
    this.stop(true);
    core();
    if (!noCallHook) {
      callHook(this.opts.hooks, 'start', [this]);
    }
    return this
  }
  setOptions (opts) {
    if (opts) {
      this.opts = Object.assign(this.opts, opts);
      if ('interval' in opts) {
        this.stop(true);
        this.start(true);
      }
      if ('height' in opts) {
        this.RuntimeManager.singleHeight = opts.height;
        this.RuntimeManager.resize();
      }
      callHook(this.opts.hooks, 'setOptions', [this, opts]);
    }
    return this
  }
  resize () {
    this.RuntimeManager.resize();
    callHook(this.opts.hooks, 'resize', [this]);
    return this
  }
  clear () {
    this.stop();
    this.each(barrage => barrage.remove());
    this.showBarrages = [];
    this.stashBarrages = [];
    this.RuntimeManager.container = [];
    this.RuntimeManager.resize();
    callHook(this.opts.hooks, 'clear', [this]);
  }
  renderBarrage () {
    if (this.stashBarrages.length > 0) {
      let length = this.opts.limit - this.showBarrages.length;
      if (length > this.RuntimeManager.rows && this.RuntimeManager.rowGap > 0) {
        length = this.RuntimeManager.rows;
      }
      if (length > this.stashBarrages.length) {
        length = this.stashBarrages.length;
      }
      if (length > 0 && this.runing) {
        for (let i = 0; i < length; i++) {
          const data = this.stashBarrages.shift();
          if (data) {
            this.initSingleBarrage(data);
          }
        }
        callHook(this.opts.hooks, 'render', [this]);
      }
    }
  }
  initSingleBarrage (data) {
    const barrage = data instanceof Barrage ? data : this.createSingleBarrage(data);
    const newBarrage = this.sureBarrageInfo(barrage);
    if (newBarrage) {
      newBarrage.append();
      this.showBarrages.push(newBarrage);
      newBarrage.trajectory.values.push(newBarrage);
      this.RuntimeManager.move(newBarrage, this.isShow).then(() => {
        newBarrage.destroy();
        if (this.length === 0) {
          callHook(this.opts.hooks, 'ended', [this]);
        }
      });
    } else {
      this.stashBarrages.unshift(barrage);
    }
  }
  createSingleBarrage (data) {
    const [max, min] = this.opts.times;
    const time = max === min
      ? max
      : (Math.random() * (max - min) + min).toFixed(0);
    return new Barrage(
      data,
      time,
      this,
      Object.assign({}, this.opts.hooks, {
        barrageCreate: this.setBarrageStyle.bind(this),
      })
    )
  }
  sureBarrageInfo (barrage) {
    const trajectory = this.RuntimeManager.getTrajectory();
    if (!trajectory) return null
    barrage.trajectory = trajectory;
    barrage.position.y = trajectory.gaps[0];
    return barrage
  }
  setBarrageStyle (node, barrage) {
    const { hooks = {}, direction } = this.opts;
    callHook(hooks, 'barrageCreate', [node, barrage]);
    node.style.opacity = 0;
    node.style[direction] = 0;
    node.style.position = 'absolute';
    node.style.display = 'inline-block';
    node.style.pointerEvents = this.isShow ? 'auto' : 'none';
    node.style.visibility = this.isShow ? 'visible' : 'hidden';
  }
}

function createBarrage (opts = {}) {
  opts = Object.assign({
    hooks: {},
    limit: 50,
    height: 50,
    rowGap: 50,
    isShow: true,
    capcity: 1024,
    times: [8, 15],
    interval: 2000,
    direction: 'right',
  }, opts);
  return new BarrageManager(opts)
}

module.exports = createBarrage;
