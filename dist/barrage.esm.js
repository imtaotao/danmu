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
function createKey() {
  return Math.random()
    .toString(36)
    .substr(2, 8)
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
if (
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
) {
  transitionProp = 'WebkitTransition';
  transitionEndEvent = 'webkitTransitionEnd';
}
function whenTransitionEnds (node) {
  return new Promise(resolve => {
    let isCalled = false;
    const end = () => {
      node.removeEventListener(transitionEndEvent, onEnd);
      resolve();
    };
    const onEnd = e => {
      if (!isCalled) {
        isCalled = true;
        end();
      }
    };
    node.addEventListener(transitionEndEvent, onEnd);
  })
}

class Barrage {
  constructor (itemData, time, container, hooks) {
    this._width = null;
    this.hooks = hooks;
    this.paused = false;
    this.moveing = false;
    this.data = itemData;
    this.container = container;
    this.duration = Number(time);
    this.key = itemData.id || createKey();
    this.position = {
      y: null,
      startTime: null,
      trajectory: null,
    };
    this.create();
  }
  width () {
    return new Promise(resolve => {
      let i = 0;
      if (this._width) {
        return resolve(this._width)
      }
      const fn = () => {
        warning(++i < 99, 'Unable to get the barr width.');
        setTimeout(() => {
          let width = getComputedStyle(this.node).width;
          if (width == null || width === '') {
            fn();
          } else {
            width = parseInt(width);
            this._width = width;
            resolve(width);
          }
        });
      };
      fn();
    })
  }
  create () {
    const node = document.createElement('div');
    node.id = 'barrage_' + this.key;
    this.node = node;
    callHook(this.hooks, 'create', [node, this]);
  }
  append () {
    warning(this.container, 'Need container element.');
    if (this.node) {
      this.container.appendChild(this.node);
      callHook(this.hooks, 'append', [this.node, this]);
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
      this.paused = true;
      this.width().then(w => {
        const percent = (Date.now() - this.position.startTime) / this.duration;
        console.log(percent);
      });
    }
  }
  resume () {
    if (this.moveing && this.paused) {
      this.paused = false;
    }
  }
  reset () {
    this.position = {
      y: null,
      startTime: null,
      trajectory: null,
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
    this.containerWidth = parseInt(styles.width);
    this.containerHeight = parseInt(styles.height);
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
    const duration = lastBarrage.duration;
    const startTime = lastBarrage.position.startTime;
    if (startTime !== null) {
      const precent = (Date.now() - startTime) / 1000 / duration;
      const distance = precent * this.containerWidth;
      return distance > this.rowGap
        ? currentTragectory
        : this.getTrajectory(alreadyFound)
    }
    return this.getTrajectory(alreadyFound)
  }
  async move (barrage, isShow) {
    const node = barrage.node;
    const width = await barrage.width();
    node.style.top = `${barrage.position.y}px`;
    node.style.transform = `translateX(${width}px)`;
    return new Promise(resolve => {
      nextFrame(() => {
        node.style.display = isShow ? 'inline-block' : 'none';
        node.style[transitionProp] = `transform linear ${barrage.duration}s`;
        node.style.transform = `translateX(-${this.containerWidth}px)`;
        barrage.moveing = true;
        barrage.position.startTime = Date.now();
        resolve(whenTransitionEnds(node));
      });
    })
  }
}

class BarrageManager {
  constructor (data, opts) {
    this.data = data;
    this.opts = opts;
    this.isShow = true;
    this.loopTimer = null;
    this.showBarrages = [];
    this.stashBarrages = this.data.slice();
    this.RuntimeManager = new RuntimeManager(opts);
  }
  get length () {
    return  this.showBarrages.length + this.stashBarrages.length
  }
  start () {
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
  push (data) {
    assertArray(data);
    if (data.length + this.length > this.opts.capcity) {
      console.warn(`The number of barrage is greater than "${this.opts.capcity}".`);
      return false
    }
    this.stashBarrages.push.apply(this.stashBarrages, data);
    return true
  }
  show () {
    if (this.isShow) return
    this.isShow = true;
    this.each(barrage => {
      barrage.node.style.display = 'inline-block';
    });
  }
  hiden () {
    if (!this.isShow) return
    this.isShow = false;
    this.each(barrage => {
      barrage.node.style.display = 'none';
    });
  }
  each (cb) {
    if (typeof cb === 'function') {
      this.showBarrages.forEach(cb);
    }
  }
  loop (interval = 1000) {
    const stop = () => {
      if (this.loopTimer) {
        clearTimeout(this.loopTimer);
        this.loopTimer = null;
      }
    };
    const core = () => {
      this.loopTimer = setTimeout(() => {
        this.start();
        core();
      }, interval);
    };
    stop();
    core();
    return stop
  }
  async initSingleBarrage (data) {
    const barrage = data instanceof Barrage
      ? data
      : this.createSingleBarrage(data);
    const newBarrage = this.sureBarrageInfo(barrage);
    if (newBarrage) {
      const trajectory = newBarrage.position.trajectory;
      newBarrage.append();
      this.showBarrages.push(newBarrage);
      trajectory.values.push(newBarrage);
      await this.RuntimeManager.move(newBarrage, this.isShow);
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
      Object.assign({}, this.opts.hooks, {
        create: this.setBarrageStyle.bind(this),
      })
    )
  }
  sureBarrageInfo (barrage) {
    const position = barrage.position;
    const runtime = this.RuntimeManager;
    const showBarrages = this.showBarrages;
    const trajectory = runtime.getTrajectory();
    if (!trajectory) return null
    position.y = trajectory.gaps[0];
    position.trajectory = trajectory;
    return barrage
  }
  setBarrageStyle (node, barrage) {
    const hooks = this.opts.hooks || {};
    const moveDis = this.opts.direction === 'left' ? -1 : 1;
    if (typeof hooks.create === 'function') {
      hooks.create(node, barrage);
    } else {
      node.textContent = barrage.content;
      node.style.height = this.RuntimeManager.height;
    }
    node.style.position = 'absolute';
    node.style[this.opts.direction] = 0;
    node.style.display = this.isShow ? 'inline-block' : 'none';
  }
}

function createBarrage (data = [], opts = {}) {
  assertArray(data);
  opts = Object.assign({
    hooks: {},
    limit: 20,
    height: 50,
    rowGap: 100,
    capcity: 1024,
    times: [8, 15],
    direction: 'right',
  }, opts);
  if (data.length > opts.capcity) {
    throw ReferenceError(`The number of barrage is greater than "${opts.capcity}".`)
  }
  return new BarrageManager(data, opts)
}

export default createBarrage;
//# sourceMappingURL=barrage.esm.js.map
