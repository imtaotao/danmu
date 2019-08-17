'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function warning(condition, message) {
  if (condition) return;
  throw new Error("Warning: ".concat(message));
}
function callHook(hooks, name) {
  var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  if (hooks && typeof hooks[name] === 'function') {
    hooks[name].apply(null, args);
  }
}
function createKey() {
  return Math.random().toString(36).substr(2, 8);
}
function toNumber(val) {
  return typeof val === 'number' ? val : typeof val === 'string' ? Number(val.replace('px', '')) : NaN;
}
function lastElement(arr, lastIndex) {
  return arr[arr.length - lastIndex];
}
function isRange(_ref, val) {
  var _ref2 = _slicedToArray(_ref, 2),
      a = _ref2[0],
      b = _ref2[1];

  if (val === a || val === b) return true;
  var min = Math.min(a, b);
  var max = min === a ? b : a;
  return min < val && val < max;
}
function upperCase(_ref3) {
  var _ref4 = _toArray(_ref3),
      first = _ref4[0],
      remaing = _ref4.slice(1);

  return first.toUpperCase() + remaing.join('');
}
var raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;
function nextFrame(fn) {
  raf(function () {
    raf(fn);
  });
}
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var transitionDuration = 'transitionDuration';

if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
  transitionProp = 'WebkitTransition';
  transitionEndEvent = 'webkitTransitionEnd';
  transitionDuration = 'webkitTransitionDuration';
}

function whenTransitionEnds(node) {
  return new Promise(function (resolve) {
    var isCalled = false;

    var end = function end() {
      node.removeEventListener(transitionEndEvent, onEnd);
      resolve();
    };

    var onEnd = function onEnd() {
      if (!isCalled) {
        isCalled = true;
        end();
      }
    };

    node.addEventListener(transitionEndEvent, onEnd);
  });
}

var Barrage =
/*#__PURE__*/
function () {
  function Barrage(itemData, time, manager, hooks) {
    _classCallCheck(this, Barrage);

    var RuntimeManager = manager.RuntimeManager;
    var _manager$opts = manager.opts,
        direction = _manager$opts.direction,
        container = _manager$opts.container;
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
      y: null
    };
    this.timeInfo = {
      pauseTime: 0,
      startTime: null,
      prevPauseTime: null,
      currentDuration: time
    };
    this.create();
  }

  _createClass(Barrage, [{
    key: "getMovePrecent",
    value: function getMovePrecent() {
      var _this$timeInfo = this.timeInfo,
          pauseTime = _this$timeInfo.pauseTime,
          startTime = _this$timeInfo.startTime,
          prevPauseTime = _this$timeInfo.prevPauseTime;
      var currentTime = this.paused ? prevPauseTime : Date.now();
      return (currentTime - startTime - pauseTime) / 1000 / this.duration;
    }
  }, {
    key: "getMoveDistance",
    value: function getMoveDistance() {
      var fix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (!this.moveing) return 0;
      var percent = this.getMovePrecent();
      var containerWidth = this.RuntimeManager.containerWidth + (fix ? this.getWidth() : 0);
      return percent * containerWidth;
    }
  }, {
    key: "getHeight",
    value: function getHeight() {
      return this.node && this.node.clientHeight || 0;
    }
  }, {
    key: "getWidth",
    value: function getWidth() {
      return this.node && this.node.clientWidth || 0;
    }
  }, {
    key: "getSpeed",
    value: function getSpeed() {
      var duration = this.timeInfo.currentDuration;
      var containerWidth = this.RuntimeManager.containerWidth + this.getWidth();
      return duration == null || containerWidth == null ? 0 : containerWidth / duration;
    }
  }, {
    key: "create",
    value: function create() {
      var node = document.createElement('div');
      node.id = this.key;
      this.node = node;
      callHook(this.hooks, 'barrageCreate', [node, this]);
    }
  }, {
    key: "append",
    value: function append() {
      warning(this.container, 'Need container element.');

      if (this.node) {
        this.container.appendChild(this.node);
        callHook(this.hooks, 'barrageAppend', [this.node, this]);
      }
    }
  }, {
    key: "remove",
    value: function remove(noCallHook) {
      warning(this.container, 'Need container element.');

      if (this.node) {
        this.container.removeChild(this.node);

        if (!noCallHook) {
          callHook(this.hooks, 'barrageRemove', [this.node, this]);
        }
      }
    }
  }, {
    key: "deletedInMemory",
    value: function deletedInMemory() {
      var index = -1;
      var trajectory = this.trajectory;
      var showBarrages = this.manager.showBarrages;

      if (trajectory && trajectory.values.length > 0) {
        index = trajectory.values.indexOf(this);
        if (~index) trajectory.values.splice(index, 1);
      }

      if (showBarrages && showBarrages.length > 0) {
        index = showBarrages.indexOf(this);
        if (~index) showBarrages.splice(index, 1);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.remove();
      this.moveing = false;
      this.deletedInMemory();
      callHook(this.hooks, 'barrageDestroy', [this.node, this]);
    }
  }, {
    key: "pause",
    value: function pause() {
      if (this.moveing && !this.paused) {
        var moveDistance = this.getMoveDistance();

        if (!Number.isNaN(moveDistance)) {
          this.paused = true;
          this.timeInfo.prevPauseTime = Date.now();

          if (this.direction === 'right') {
            moveDistance *= -1;
          }

          this.node.style[transitionDuration] = '0s';
          this.node.style.transform = "translateX(".concat(moveDistance, "px)");
        }
      }
    }
  }, {
    key: "resume",
    value: function resume() {
      if (this.moveing && this.paused) {
        this.paused = false;
        this.timeInfo.pauseTime += Date.now() - this.timeInfo.prevPauseTime;
        this.timeInfo.prevPauseTime = null;
        var des = this.direction === 'left' ? 1 : -1;
        var containerWidth = this.RuntimeManager.containerWidth + this.getWidth();
        var remainingTime = (1 - this.getMoveDistance() / containerWidth) * this.duration;
        this.timeInfo.currentDuration = remainingTime;
        this.node.style[transitionDuration] = "".concat(remainingTime, "s");
        this.node.style.transform = "translateX(".concat(containerWidth * des, "px)");
      }
    }
  }, {
    key: "reset",
    value: function reset() {
      this.paused = false;
      this.moveing = false;
      this.trajectory = null;
      this.position = {
        y: null
      };
      this.timeInfo = {
        pauseTime: 0,
        startTime: null,
        prevPauseTime: null,
        currentDuration: this.duration
      };
      this.remove(true);
      this.deletedInMemory();
    }
  }]);

  return Barrage;
}();

var SpecialBarrage =
/*#__PURE__*/
function () {
  function SpecialBarrage(opts) {
    _classCallCheck(this, SpecialBarrage);

    this.opts = opts;
    this.key = opts.id || createKey();
  }

  _createClass(SpecialBarrage, [{
    key: "append",
    value: function append(manager) {}
  }, {
    key: "destroy",
    value: function destroy(manager) {}
  }]);

  return SpecialBarrage;
}();

var RuntimeManager =
/*#__PURE__*/
function () {
  function RuntimeManager(opts) {
    _classCallCheck(this, RuntimeManager);

    var container = opts.container,
        rowGap = opts.rowGap,
        height = opts.height;
    var styles = getComputedStyle(container);

    if (!styles.position || styles.position === 'static') {
      container.style.position = 'relative';
    }

    this.opts = opts;
    this.rowGap = rowGap;
    this.singleHeight = height;
    this.containerElement = container;
    this.containerWidth = toNumber(styles.width);
    this.containerHeight = toNumber(styles.height);
    this.init();
  }

  _createClass(RuntimeManager, [{
    key: "init",
    value: function init() {
      this.container = [];
      this.rows = parseInt(this.containerHeight / this.singleHeight);

      for (var i = 0; i < this.rows; i++) {
        var start = this.singleHeight * i;
        var end = this.singleHeight * (i + 1) - 1;
        this.container.push({
          values: [],
          gaps: [start, end]
        });
      }
    }
  }, {
    key: "resize",
    value: function resize() {
      var styles = getComputedStyle(this.containerElement);
      this.containerWidth = toNumber(styles.width);
      this.containerHeight = toNumber(styles.height);
      this.rows = parseInt(this.containerHeight / this.singleHeight);
      var container = [];

      for (var i = 0; i < this.rows; i++) {
        var start = this.singleHeight * i;
        var end = this.singleHeight * (i + 1) - 1;
        var gaps = [start, end];

        if (this.container[i]) {
          this.container[i].gaps = gaps;
          container.push(this.container[i]);
        } else {
          container.push({
            gaps: gaps,
            values: []
          });
        }
      }

      this.container = container;
    }
  }, {
    key: "getRandomIndex",
    value: function getRandomIndex(exclude) {
      var randomIndex = Math.floor(Math.random() * this.rows);
      return exclude.includes(randomIndex) ? this.getRandomIndex(exclude) : randomIndex;
    }
  }, {
    key: "getTrajectory",
    value: function getTrajectory() {
      var alreadyFound = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (alreadyFound.length === this.container.length) {
        return null;
      }

      var index = this.getRandomIndex(alreadyFound);
      var currentTrajectory = this.container[index];
      var lastBarrage = lastElement(currentTrajectory.values, 1);

      if (this.rowGap <= 0 || !lastBarrage) {
        return currentTrajectory;
      }

      alreadyFound.push(index);

      if (lastBarrage.moveing) {
        var distance = lastBarrage.getMoveDistance();
        var spacing = this.rowGap > 0 ? this.rowGap + lastBarrage.getWidth() : this.rowGap;
        return distance > spacing ? currentTrajectory : this.getTrajectory(alreadyFound);
      }

      return this.getTrajectory(alreadyFound);
    }
  }, {
    key: "computingDuration",
    value: function computingDuration(prevBarrage, currentBarrage) {
      var prevWidth = prevBarrage.getWidth();
      var currentWidth = currentBarrage.getWidth();
      var prevSpeed = prevBarrage.getSpeed();
      var currentSpeed = currentBarrage.getSpeed();
      var acceleration = currentSpeed - prevSpeed;

      if (acceleration <= 0) {
        return null;
      }

      var distance = prevBarrage.getMoveDistance(false);
      var meetTime = distance / acceleration;

      if (meetTime >= currentBarrage.duration) {
        return null;
      }

      var containerWidth = this.containerWidth + currentWidth + prevWidth;
      var remainingTime = (1 - prevBarrage.getMovePrecent()) * prevBarrage.duration;
      return containerWidth * remainingTime / this.containerWidth;
    }
  }, {
    key: "move",
    value: function move(barrage, manager) {
      var _this = this;

      var node = barrage.node;
      var prevBarrage = lastElement(barrage.trajectory.values, 2);
      node.style.top = "".concat(barrage.position.y, "px");
      return new Promise(function (resolve) {
        nextFrame(function () {
          var width = barrage.getWidth();
          var des = barrage.direction === 'left' ? 1 : -1;
          var containerWidth = _this.containerWidth + width;

          if (prevBarrage && _this.rowGap > 0 && prevBarrage.moveing && !prevBarrage.paused) {
            var fixTime = _this.computingDuration(prevBarrage, barrage);

            if (fixTime !== null) {
              if (isRange(_this.opts.times, fixTime)) {
                barrage.duration = fixTime;
                barrage.timeInfo.currentDuration = fixTime;
              } else {
                barrage.reset();
                node.style.top = null;
                manager.stashBarrages.unshift(barrage);
                return;
              }
            }
          }

          node.style.opacity = 1;
          node.style.pointerEvents = manager.isShow ? 'auto' : 'none';
          node.style.visibility = manager.isShow ? 'visible' : 'hidden';
          node.style.transform = "translateX(".concat(des * containerWidth, "px)");
          node.style[transitionProp] = "transform linear ".concat(barrage.duration, "s");
          node.style["margin".concat(upperCase(barrage.direction))] = "-".concat(width, "px");
          barrage.moveing = true;
          barrage.timeInfo.startTime = Date.now();
          callHook(barrage.hooks, 'barrageMove', [node, barrage]);
          resolve(whenTransitionEnds(node));
        });
      });
    }
  }, {
    key: "moveSpecialBarrage",
    value: function moveSpecialBarrage(barrage, manager) {
      return new Promise(function (resolve) {});
    }
  }]);

  return RuntimeManager;
}();

var BarrageManager =
/*#__PURE__*/
function () {
  function BarrageManager(opts) {
    _classCallCheck(this, BarrageManager);

    this.opts = opts;
    this.loopTimer = null;
    this.showBarrages = [];
    this.stashBarrages = [];
    this.specialBarrages = [];
    this.isShow = opts.isShow;
    this.container = opts.container;
    this.RuntimeManager = new RuntimeManager(opts);
  }

  _createClass(BarrageManager, [{
    key: "send",
    value: function send(data) {
      if (!Array.isArray(data)) data = [data];
      if (this.assertCapcity(data.length)) return false;
      this.stashBarrages.push.apply(this.stashBarrages, data);
      callHook(this.opts.hooks, 'send', [this, data]);
      return true;
    }
  }, {
    key: "sendSpecial",
    value: function sendSpecial(data) {
      var _this = this;

      if (!Array.isArray(data)) data = [data];
      if (this.assertCapcity(data.length)) return false;

      var _loop = function _loop(i) {
        var barrage = data[i];

        if (barrage instanceof SpecialBarrage) {
          _this.specialBarrages.push(barrage);

          barrage.append(_this);

          _this.RuntimeManager.moveSpecialBarrage(barrage, _this).then(function () {
            barrage.destroy(_this);

            if (_this.length === 0) {
              callHook(_this.opts.hooks, 'ended', [_this]);
            }
          });
        }
      };

      for (var i = 0; i < data.length; i++) {
        _loop(i);
      }

      callHook(this.opts.hooks, 'send', [this, data]);
      callHook(this.opts.hooks, 'sendSpecial', [this, data]);
      return true;
    }
  }, {
    key: "show",
    value: function show() {
      if (!this.isShow) {
        this.isShow = true;
        this.each(function (barrage) {
          barrage.node.style.visibility = 'visible';
          barrage.node.style.pointerEvents = 'auto';
        });
        callHook(this.opts.hooks, 'show', [this]);
      }

      return this;
    }
  }, {
    key: "hidden",
    value: function hidden() {
      if (this.isShow) {
        this.isShow = false;
        this.each(function (barrage) {
          barrage.node.style.visibility = 'hidden';
          barrage.node.style.pointerEvents = 'none';
        });
        callHook(this.opts.hooks, 'hidden', [this]);
      }

      return this;
    }
  }, {
    key: "each",
    value: function each(cb) {
      if (typeof cb === 'function') {
        for (var i = 0; i < this.showBarrages.length; i++) {
          var barrage = this.showBarrages[i];

          if (barrage.moveing) {
            cb(barrage, i);
          }
        }

        this.showBarrages.forEach(cb);
      }

      return this;
    }
  }, {
    key: "stop",
    value: function stop(noCallHook) {
      if (this.loopTimer) {
        clearTimeout(this.loopTimer);
        this.loopTimer = null;

        if (!noCallHook) {
          callHook(this.opts.hooks, 'stop', [this]);
        }
      }

      return this;
    }
  }, {
    key: "start",
    value: function start(noCallHook) {
      var _this2 = this;

      var core = function core() {
        _this2.loopTimer = setTimeout(function () {
          _this2.renderBarrage();

          core();
        }, _this2.opts.interval);
      };

      this.stop(true);
      core();

      if (!noCallHook) {
        callHook(this.opts.hooks, 'start', [this]);
      }

      return this;
    }
  }, {
    key: "setOptions",
    value: function setOptions(opts) {
      if (opts) {
        if ('interval' in opts) {
          this.stop(true);
          this.start(true);
        }

        if ('height' in opts) {
          this.RuntimeManager.singleHeight = opts.height;
          this.RuntimeManager.resize();
        }

        if ('rowGap' in opts) {
          this.RuntimeManager.rowGap = opts.rowGap;
        }

        this.opts = Object.assign(this.opts, opts);
        callHook(this.opts.hooks, 'setOptions', [this, opts]);
      }

      return this;
    }
  }, {
    key: "resize",
    value: function resize() {
      this.RuntimeManager.resize();
      callHook(this.opts.hooks, 'resize', [this]);
      return this;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.stop();
      this.each(function (barrage) {
        return barrage.remove();
      });
      this.showBarrages = [];
      this.stashBarrages = [];
      this.RuntimeManager.container = [];
      this.RuntimeManager.resize();
      callHook(this.opts.hooks, 'clear', [this]);
    }
  }, {
    key: "assertCapcity",
    value: function assertCapcity(n) {
      var res = n + this.length > this.opts.opacity;

      if (res) {
        console.warn("The number of barrage is greater than \"".concat(this.opts.capcity, "\"."));
      }

      return res;
    }
  }, {
    key: "renderBarrage",
    value: function renderBarrage() {
      if (this.stashBarrages.length > 0) {
        var _this$RuntimeManager = this.RuntimeManager,
            rows = _this$RuntimeManager.rows,
            rowGap = _this$RuntimeManager.rowGap;
        var length = this.opts.limit - this.showBarrages.length;

        if (rowGap > 0 && length > rows) {
          length = this.RuntimeManager.rows;
        }

        if (length > this.stashBarrages.length) {
          length = this.stashBarrages.length;
        }

        if (length > 0 && this.runing) {
          for (var i = 0; i < length; i++) {
            var data = this.stashBarrages.shift();

            if (data) {
              this.initSingleBarrage(data);
            }
          }

          callHook(this.opts.hooks, 'render', [this]);
        }
      }
    }
  }, {
    key: "initSingleBarrage",
    value: function initSingleBarrage(data) {
      var _this3 = this;

      var barrage = data instanceof Barrage ? data : this.createSingleBarrage(data);
      var newBarrage = this.sureBarrageInfo(barrage);

      if (newBarrage) {
        newBarrage.append();
        this.showBarrages.push(newBarrage);
        newBarrage.trajectory.values.push(newBarrage);
        this.RuntimeManager.move(newBarrage, this).then(function () {
          newBarrage.destroy();

          if (_this3.length === 0) {
            callHook(_this3.opts.hooks, 'ended', [_this3]);
          }
        });
      } else {
        this.stashBarrages.unshift(barrage);
      }
    }
  }, {
    key: "createSingleBarrage",
    value: function createSingleBarrage(data) {
      var _this$opts$times = _slicedToArray(this.opts.times, 2),
          max = _this$opts$times[0],
          min = _this$opts$times[1];

      var time = Number(max === min ? max : (Math.random() * (max - min) + min).toFixed(0));
      return new Barrage(data, time, this, Object.assign({}, this.opts.hooks, {
        barrageCreate: this.setBarrageStyle.bind(this)
      }));
    }
  }, {
    key: "sureBarrageInfo",
    value: function sureBarrageInfo(barrage) {
      var trajectory = this.RuntimeManager.getTrajectory();
      if (!trajectory) return null;
      barrage.trajectory = trajectory;
      barrage.position.y = trajectory.gaps[0];
      return barrage;
    }
  }, {
    key: "setBarrageStyle",
    value: function setBarrageStyle(node, barrage) {
      var _this$opts = this.opts,
          _this$opts$hooks = _this$opts.hooks,
          hooks = _this$opts$hooks === void 0 ? {} : _this$opts$hooks,
          direction = _this$opts.direction;
      callHook(hooks, 'barrageCreate', [node, barrage]);
      node.style.opacity = 0;
      node.style[direction] = 0;
      node.style.position = 'absolute';
      node.style.display = 'inline-block';
      node.style.pointerEvents = this.isShow ? 'auto' : 'none';
      node.style.visibility = this.isShow ? 'visible' : 'hidden';
    }
  }, {
    key: "stashLength",
    get: function get() {
      return this.stashBarrages.length;
    }
  }, {
    key: "showLength",
    get: function get() {
      return this.showBarrages.length + this.specialBarrages.length;
    }
  }, {
    key: "length",
    get: function get() {
      return this.showBarrages.length + this.specialBarrages.length + this.stashBarrages.length;
    }
  }, {
    key: "runing",
    get: function get() {
      return this.loopTimer !== null;
    }
  }]);

  return BarrageManager;
}();

function createBarrageManager() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  opts = Object.assign({
    hooks: {},
    limit: 50,
    height: 50,
    rowGap: 50,
    isShow: true,
    capcity: 1024,
    times: [8, 15],
    interval: 2000,
    direction: 'right'
  }, opts);
  return new BarrageManager(opts);
}

function createSpecialBarrage() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new SpecialBarrage(opts);
}
var index = {
  createSpecialBarrage: createSpecialBarrage,
  create: createBarrageManager
};

exports.create = createBarrageManager;
exports.createSpecialBarrage = createSpecialBarrage;
exports.default = index;
