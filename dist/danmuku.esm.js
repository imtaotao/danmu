/*!
 * Danmuku.js v0.1.5
 * (c) 2019-2020 Imtaotao
 * Released under the MIT License.
 */
function Timeline(manager) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _manager$opts = manager.opts,
      limit = _manager$opts.limit,
      forceRender = _manager$opts.forceRender;

  if (opts.forceRender) {
    manager.setOptions({
      limit: Infinity,
      forceRender: true
    });
  }

  return {
    preEmiter: null,
    timeStore: {},
    specialTimeStore: {},
    add: function add(timestamp, cfg, hooks, isForward) {
      if (!this.timeStore[timestamp]) {
        this.timeStore[timestamp] = [{
          cfg: cfg,
          hooks: hooks,
          isForward: isForward
        }];
      } else {
        this.timeStore[timestamp].push({
          cfg: cfg,
          hooks: hooks,
          isForward: isForward
        });
      }
    },
    addSpecial: function addSpecial(timestamp, cfg) {
      if (!this.specialTimeStore[timestamp]) {
        this.specialTimeStore[timestamp] = [cfg];
      } else {
        this.specialTimeStore[timestamp].push(cfg);
      }
    },
    emit: function emit(timestamp, clearOld) {
      var ordinaryData = this.timeStore[timestamp];
      var specialData = this.specialTimeStore[timestamp];

      if (ordinaryData) {
        ordinaryData.forEach(function (_ref) {
          var cfg = _ref.cfg,
              hooks = _ref.hooks,
              isForward = _ref.isForward;
          manager.send(cfg, hooks, isForward);
        });
      }

      if (specialData) {
        manager.sendSpecial(specialData);
      }

      if (clearOld) {
        var clear = function clear(data) {
          var keys = Object.keys(data);

          if (keys.length > 0) {
            for (var i = 0; i < keys.length; i++) {
              var time = keys[i];

              if (time < timestamp && data[time]) {
                delete data[time];
              }
            }
          }
        };

        clear(this.timeStore);
        clear(this.specialTimeStore);
      }
    },
    emitInterval: function emitInterval(timestamp, clearOld) {
      if (timestamp !== preEmiter) {
        this.preEmiter = timestamp;
        this.emit(timestamp, clearOld);
      }
    },
    destroy: function destroy() {
      this.preEmiter = null;
      this.timeStore = {};
      this.specialTimeStore = {};
      manager.setOptions({
        limit: limit,
        forceRender: forceRender
      });
    }
  };
}

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
    return hooks[name].apply(null, args);
  }

  return null;
}
function createKey() {
  return Math.random().toString(36).substr(2, 8);
}
function toNumber(val) {
  return typeof val === 'number' ? val : typeof val === 'string' ? Number(val.replace('px', '')) : NaN;
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
function timeSlice(len, fn) {
  var i = -1;
  var start = performance.now();

  var run = function run() {
    while (++i < len) {
      if (fn() === false) {
        break;
      }

      var cur = performance.now();

      if (cur - start > 13) {
        start = cur;
        setTimeout(run);
        break;
      }
    }
  };

  run();
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
  function Barrage(itemData, hooks, time, manager, globalHooks) {
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
    this.isSpecial = false;
    this.trajectory = null;
    this.manager = manager;
    this.direction = direction;
    this.container = container;
    this.isChangeDuration = false;
    this.globalHooks = globalHooks;
    this.RuntimeManager = RuntimeManager;
    this.key = itemData.key || createKey();
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
    key: "getMovePercent",
    value: function getMovePercent() {
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
      if (!this.moveing) return 0;
      var percent = this.getMovePercent();
      var containerWidth = this.RuntimeManager.containerWidth + this.getWidth();
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
      this.node = document.createElement('div');
      callHook(this.hooks, 'create', [this, this.node]);
      callHook(this.globalHooks, 'barrageCreate', [this, this.node]);
    }
  }, {
    key: "append",
    value: function append() {
      warning(this.container, 'Need container element.');

      if (this.node) {
        this.container.appendChild(this.node);
        callHook(this.hooks, 'append', [this, this.node]);
        callHook(this.globalHooks, 'barrageAppend', [this, this.node]);
      }
    }
  }, {
    key: "remove",
    value: function remove(noCallHook) {
      warning(this.container, 'Need container element.');

      if (this.node) {
        this.container.removeChild(this.node);

        if (!noCallHook) {
          callHook(this.hooks, 'remove', [this, this.node]);
          callHook(this.globalHooks, 'barrageRemove', [this, this.node]);
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
      callHook(this.hooks, 'destroy', [this, this.node]);
      callHook(this.globalHooks, 'barrageDestroy', [this, this.node]);
      this.node = null;
    }
  }, {
    key: "pause",
    value: function pause() {
      if (!this.moveing || this.paused) return;
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
  }, {
    key: "resume",
    value: function resume() {
      if (!this.moveing || !this.paused) return;
      this.paused = false;
      this.timeInfo.pauseTime += Date.now() - this.timeInfo.prevPauseTime;
      this.timeInfo.prevPauseTime = null;
      var isNegative = this.direction === 'left' ? 1 : -1;
      var containerWidth = this.RuntimeManager.containerWidth + this.getWidth();
      var remainingTime = (1 - this.getMovePercent()) * this.duration;
      this.timeInfo.currentDuration = remainingTime;
      this.node.style[transitionDuration] = "".concat(remainingTime, "s");
      this.node.style.transform = "translateX(".concat(containerWidth * isNegative, "px)");
    }
  }, {
    key: "reset",
    value: function reset() {
      this.remove(true);
      this.deletedInMemory();
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
    }
  }]);

  return Barrage;
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

    if (!styles.position || styles.position === 'none' || styles.position === 'static') {
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
    key: "getLastBarrage",
    value: function getLastBarrage(barrages, lastIndex) {
      for (var i = barrages.length - 1; i >= 0; i--) {
        var barrage = barrages[i - lastIndex];

        if (barrage && !barrage.paused) {
          return barrage;
        }
      }

      return null;
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
        if (this.opts.forceRender) {
          var _index = Math.floor(Math.random() * this.rows);

          return this.container[_index];
        } else {
          return null;
        }
      }

      var index = this.getRandomIndex(alreadyFound);
      var currentTrajectory = this.container[index];
      var lastBarrage = this.getLastBarrage(currentTrajectory.values, 0);

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

      var distance = prevBarrage.getMoveDistance() - currentWidth - prevWidth;
      var meetTime = distance / acceleration;

      if (meetTime >= currentBarrage.duration) {
        return null;
      }

      var remainingTime = (1 - prevBarrage.getMovePercent()) * prevBarrage.duration;
      var currentFixTime = currentWidth * remainingTime / this.containerWidth;
      return remainingTime + currentFixTime;
    }
  }, {
    key: "move",
    value: function move(barrage, manager) {
      var _this = this;

      var node = barrage.node;
      var prevBarrage = this.getLastBarrage(barrage.trajectory.values, 1);
      node.style.top = "".concat(barrage.position.y, "px");
      return new Promise(function (resolve) {
        nextFrame(function () {
          var width = barrage.getWidth();
          var isNegative = barrage.direction === 'left' ? 1 : -1;
          var containerWidth = _this.containerWidth + width;

          if (prevBarrage && _this.rowGap > 0 && prevBarrage.moveing && !prevBarrage.paused) {
            var fixTime = _this.computingDuration(prevBarrage, barrage);

            if (fixTime !== null) {
              if (isRange(_this.opts.times, fixTime)) {
                barrage.duration = fixTime;
                barrage.isChangeDuration = true;
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
          node.style.transform = "translateX(".concat(isNegative * containerWidth, "px)");
          node.style[transitionProp] = "transform linear ".concat(barrage.duration, "s");
          node.style["margin".concat(upperCase(barrage.direction))] = "-".concat(width, "px");
          barrage.moveing = true;
          barrage.timeInfo.startTime = Date.now();
          callHook(barrage.hooks, 'move', [barrage, node]);
          callHook(barrage.globalHooks, 'barrageMove', [barrage, node]);
          resolve(whenTransitionEnds(node));
        });
      });
    }
  }, {
    key: "moveSpecialBarrage",
    value: function moveSpecialBarrage(barrage, manager) {
      var _this2 = this;

      var node = barrage.node,
          opts = barrage.opts;
      node.style.position = 'absolute';
      node.style.display = 'inline-block';
      node.style.pointerEvents = manager.isShow ? 'auto' : 'none';
      node.style.visibility = manager.isShow ? 'visible' : 'hidden';
      return new Promise(function (resolve) {
        var _opts$position = opts.position(barrage),
            _opts$position$x = _opts$position.x,
            x = _opts$position$x === void 0 ? 0 : _opts$position$x,
            _opts$position$y = _opts$position.y,
            y = _opts$position$y === void 0 ? 0 : _opts$position$y;

        var setStyle = function setStyle(a, b) {
          return "translateX(".concat(a, "px) translateY(").concat(b, "px)");
        };

        node.style.transform = setStyle(x, y);
        nextFrame(function () {
          barrage.moveing = true;
          barrage.timeInfo.startTime = Date.now();
          barrage.startPosition = {
            x: x,
            y: y
          };

          if (opts.direction === 'none') {
            var fn = function fn() {
              barrage.moveTimer.clear();
              barrage.moveTimer = null;
              resolve();
            };

            var timer = setTimeout(fn, opts.duration * 1000);
            barrage.moveTimer = {
              callback: fn,
              clear: function clear() {
                clearTimeout(timer);
                timer = null;
              }
            };
          } else {
            var endPosition = opts.direction === 'left' ? _this2.containerWidth : -barrage.getWidth();
            node.style.transform = setStyle(endPosition, y);
            node.style[transitionProp] = "transform linear ".concat(opts.duration, "s");
            resolve(whenTransitionEnds(node));
          }

          callHook(barrage.hooks, 'move', [barrage, node]);
          callHook(manager.opts.hooks, 'barrageMove', [barrage, node]);
        });
      });
    }
  }]);

  return RuntimeManager;
}();

var SpecialBarrage =
/*#__PURE__*/
function () {
  function SpecialBarrage(manager, opts) {
    _classCallCheck(this, SpecialBarrage);

    this.opts = opts;
    this.node = null;
    this.paused = false;
    this.moveing = false;
    this.isSpecial = true;
    this.manager = manager;
    this.container = manager.opts.container;
    this.RuntimeManager = manager.RuntimeManager;
    this.hooks = opts.hooks;
    this.data = opts.data || null;
    this.key = opts.key || createKey();
    this.moveTimer = null;
    this.timeInfo = {
      pauseTime: 0,
      startTime: null,
      prevPauseTime: null,
      currentDuration: opts.duration
    };
    this.startPosition = {
      x: null,
      y: null
    };
  }

  _createClass(SpecialBarrage, [{
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
    key: "create",
    value: function create() {
      this.node = document.createElement('div');
      callHook(this.hooks, 'create', [this, this.node]);
      callHook(this.manager.opts.hooks, 'barrageCreate', [this, this.node]);
    }
  }, {
    key: "getMovePercent",
    value: function getMovePercent() {
      var _this$timeInfo = this.timeInfo,
          pauseTime = _this$timeInfo.pauseTime,
          startTime = _this$timeInfo.startTime,
          prevPauseTime = _this$timeInfo.prevPauseTime;
      var currentTime = this.paused ? prevPauseTime : Date.now();
      return (currentTime - startTime - pauseTime) / 1000 / this.opts.duration;
    }
  }, {
    key: "getMoveDistance",
    value: function getMoveDistance(direction, startPosition) {
      if (!this.moveing) return 0;
      var percent = this.getMovePercent();

      if (direction === 'none') {
        return startPosition;
      }

      if (direction === 'left') {
        var realMoveDistance = (this.RuntimeManager.containerWidth - startPosition) * percent;
        return startPosition + realMoveDistance;
      } else {
        var allMoveDistance = startPosition + this.getWidth();
        return startPosition - allMoveDistance * percent;
      }
    }
  }, {
    key: "pause",
    value: function pause() {
      if (!this.moveing || this.paused) return;
      this.paused = true;
      this.timeInfo.prevPauseTime = Date.now();
      var direction = this.opts.direction;

      if (direction === 'none') {
        if (this.moveTimer) {
          this.moveTimer.clear();
        }
      } else {
        var _this$startPosition = this.startPosition,
            x = _this$startPosition.x,
            y = _this$startPosition.y;
        var moveDistance = this.getMoveDistance(direction, x);
        this.node.style[transitionDuration] = '0s';
        this.node.style.transform = "translateX(".concat(moveDistance, "px) translateY(").concat(y, "px)");
      }
    }
  }, {
    key: "resume",
    value: function resume() {
      if (!this.moveing || !this.paused) return;
      this.paused = false;
      this.timeInfo.pauseTime += Date.now() - this.timeInfo.prevPauseTime;
      this.timeInfo.prevPauseTime = null;
      var direction = this.opts.direction;
      var remainingTime = (1 - this.getMovePercent()) * this.opts.duration;

      if (direction === 'none') {
        var fn = this.moveTimer.callback || function () {};

        var timer = setTimeout(fn, remainingTime * 1000);

        this.moveTimer.clear = function () {
          clearTimeout(timer);
          timer = null;
        };
      } else {
        var _this$startPosition2 = this.startPosition,
            x = _this$startPosition2.x,
            y = _this$startPosition2.y;
        var endPosition = this.opts.direction === 'left' ? this.RuntimeManager.containerWidth : -this.getWidth();
        this.node.style[transitionDuration] = "".concat(remainingTime, "s");
        this.node.style.transform = "translateX(".concat(endPosition, "px) translateY(").concat(y, "px)");
      }
    }
  }, {
    key: "append",
    value: function append() {
      warning(this.container, 'Need container element.');

      if (this.node) {
        this.container.appendChild(this.node);
        callHook(this.hooks, 'append', [this, this.node]);
        callHook(this.manager.opts.hooks, 'barrageAppend', [this, this.node]);
      }
    }
  }, {
    key: "remove",
    value: function remove() {
      warning(this.container, 'Need container element.');

      if (this.node) {
        this.container.removeChild(this.node);
        callHook(this.hooks, 'remove', [this, this.node]);
        callHook(this.manager.opts.hooks, 'barrageRemove', [this, this.node]);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.remove();
      this.moveing = false;
      var index = this.manager.specialBarrages.indexOf(this);

      if (~index) {
        this.manager.specialBarrages.splice(index, 1);
      }

      if (this.moveTimer) {
        this.moveTimer.clear();
        this.moveTimer = null;
      }

      callHook(this.hooks, 'destroy', [this, this.node]);
      callHook(this.manager.opts.hooks, 'barrageDestroy', [this, this.node]);
      this.node = null;
    }
  }]);

  return SpecialBarrage;
}();
function createSpecialBarrage(manager) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  opts = Object.assign({
    hooks: {},
    duration: 0,
    direction: 'none',
    position: function position() {
      return {
        x: 0,
        y: 0
      };
    }
  }, opts);
  return new SpecialBarrage(manager, opts);
}

var BarrageManager =
/*#__PURE__*/
function () {
  function BarrageManager(opts) {
    _classCallCheck(this, BarrageManager);

    this.opts = opts;
    this.loopTimer = null;
    this.plugins = new Map();
    this.showBarrages = [];
    this.stashBarrages = [];
    this.specialBarrages = [];
    this.isShow = opts.isShow;
    this.container = opts.container;
    this.RuntimeManager = new RuntimeManager(opts);
  }

  _createClass(BarrageManager, [{
    key: "send",
    value: function send(data, hooks, isForward) {
      if (Array.isArray(data)) {
        data = data.map(function (item) {
          return {
            data: item,
            hooks: hooks
          };
        });
      } else {
        data = [{
          data: data,
          hooks: hooks
        }];
      }

      if (this.assertCapacity(data.length)) return false;
      isForward ? this.stashBarrages.unshift.apply(this.stashBarrages, data) : this.stashBarrages.push.apply(this.stashBarrages, data);
      callHook(this.opts.hooks, 'send', [this, data]);
      return true;
    }
  }, {
    key: "sendSpecial",
    value: function sendSpecial(data) {
      var _this = this;

      if (!this.runing) return false;
      if (!Array.isArray(data)) data = [data];
      if (this.assertCapacity(data.length)) return false;

      for (var i = 0; i < data.length; i++) {
        if (callHook(this.opts.hooks, 'willRender', [this, data[i], true]) !== false) {
          var _ret = function () {
            var barrage = createSpecialBarrage(_this, data[i]);

            if (barrage.opts.duration <= 0 || _this.showLength + 1 > _this.opts.limit) {
              return "continue";
            }

            barrage.create();
            barrage.append();

            _this.specialBarrages.push(barrage);

            _this.RuntimeManager.moveSpecialBarrage(barrage, _this).then(function () {
              barrage.destroy();

              if (_this.length === 0) {
                callHook(_this.opts.hooks, 'ended', [_this]);
              }
            });
          }();

          if (_ret === "continue") continue;
        }
      }

      callHook(this.opts.hooks, 'sendSpecial', [this, data]);
      return true;
    }
  }, {
    key: "show",
    value: function show() {
      if (!this.isShow) {
        this.isShow = true;
        this.each(function (barrage) {
          if (barrage.node) {
            barrage.node.style.visibility = 'visible';
            barrage.node.style.pointerEvents = 'auto';
          }

          callHook(barrage.hooks, 'show', [barrage, barrage.node]);
        });
        callHook(this.opts.hooks, 'show', [this]);
      }
    }
  }, {
    key: "hidden",
    value: function hidden() {
      if (this.isShow) {
        this.isShow = false;
        this.each(function (barrage) {
          if (barrage.node) {
            barrage.node.style.visibility = 'hidden';
            barrage.node.style.pointerEvents = 'none';
          }

          callHook(barrage.hooks, 'hidden', [barrage, barrage.node]);
        });
        callHook(this.opts.hooks, 'hidden', [this]);
      }
    }
  }, {
    key: "each",
    value: function each(callback) {
      if (typeof callback === 'function') {
        var i = 0;

        for (; i < this.specialBarrages.length; i++) {
          callback(this.specialBarrages[i], i);
        }

        for (i = 0; i < this.showBarrages.length; i++) {
          var barrage = this.showBarrages[i];

          if (barrage.moveing) {
            callback(barrage, i);
          }
        }
      }
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
    }
  }, {
    key: "start",
    value: function start(noCallHook) {
      var _this2 = this;

      var core = function core() {
        _this2.loopTimer = setTimeout(function () {
          _this2.renderBarrage();

          core();
        }, _this2.opts.interval * 1000);
      };

      this.stop(true);
      core();

      if (!noCallHook) {
        callHook(this.opts.hooks, 'start', [this]);
      }
    }
  }, {
    key: "setOptions",
    value: function setOptions(opts) {
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

        if ('rowGap' in opts) {
          this.RuntimeManager.rowGap = opts.rowGap;
        }

        callHook(this.opts.hooks, 'setOptions', [this, opts]);
      }
    }
  }, {
    key: "resize",
    value: function resize() {
      this.RuntimeManager.resize();
      callHook(this.opts.hooks, 'resize', [this]);
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
      this.specialBarrages = [];
      this.RuntimeManager.container = [];
      this.RuntimeManager.resize();
      callHook(this.opts.hooks, 'clear', [this]);
    }
  }, {
    key: "clone",
    value: function clone(opts) {
      opts = opts ? Object.assign(this.opts, opts) : this.opts;
      return new this.constructor(opts);
    }
  }, {
    key: "use",
    value: function use(fn) {
      warning(typeof fn === 'function', 'Plugin must be a function.');

      if (this.plugins.has(fn)) {
        return this.plugins.get(fn);
      }

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var result = fn.apply(void 0, [this].concat(args));
      this.plugins.set(fn, result);
      return result;
    }
  }, {
    key: "assertCapacity",
    value: function assertCapacity(n) {
      var res = n + this.length > this.opts.capacity;

      if (res) {
        callHook(this.opts.hooks, 'capacityWarning', [this]);
        console.warn("The number of barrage is greater than \"".concat(this.opts.capacity, "\"."));
      }

      return res;
    }
  }, {
    key: "renderBarrage",
    value: function renderBarrage() {
      var _this3 = this;

      if (this.stashBarrages.length > 0) {
        var _this$RuntimeManager = this.RuntimeManager,
            rows = _this$RuntimeManager.rows,
            rowGap = _this$RuntimeManager.rowGap;
        var length = this.opts.limit - this.showLength;

        if (rowGap > 0 && length > rows) {
          length = this.RuntimeManager.rows;
        }

        if (this.opts.forceRender || length > this.stashBarrages.length) {
          length = this.stashBarrages.length;
        }

        if (length > 0 && this.runing) {
          timeSlice(length, function () {
            var currentBarrage = _this3.stashBarrages.shift();

            if (callHook(_this3.opts.hooks, 'willRender', [_this3, currentBarrage, false]) !== false) {
              var needStop = _this3.initSingleBarrage(currentBarrage.data, currentBarrage.hooks);

              if (needStop) {
                return false;
              }
            }
          });
          callHook(this.opts.hooks, 'render', [this]);
        }
      }
    }
  }, {
    key: "initSingleBarrage",
    value: function initSingleBarrage(data, hooks) {
      var _this4 = this;

      var barrage = data instanceof Barrage ? data : this.createSingleBarrage(data, hooks);
      var newBarrage = barrage && this.sureBarrageInfo(barrage);

      if (newBarrage) {
        newBarrage.append();
        this.showBarrages.push(newBarrage);
        newBarrage.trajectory.values.push(newBarrage);
        this.RuntimeManager.move(newBarrage, this).then(function () {
          newBarrage.destroy();

          if (_this4.length === 0) {
            callHook(_this4.opts.hooks, 'ended', [_this4]);
          }
        });
      } else {
        this.stashBarrages.unshift(barrage);
        return true;
      }
    }
  }, {
    key: "createSingleBarrage",
    value: function createSingleBarrage(data, hooks) {
      var _this$opts$times = _slicedToArray(this.opts.times, 2),
          max = _this$opts$times[0],
          min = _this$opts$times[1];

      var time = Number(max === min ? max : (Math.random() * (max - min) + min).toFixed(0));
      if (time <= 0) return null;
      return new Barrage(data, hooks, time, this, Object.assign({}, this.opts.hooks, {
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
    value: function setBarrageStyle(barrage, node) {
      var _this$opts = this.opts,
          _this$opts$hooks = _this$opts.hooks,
          hooks = _this$opts$hooks === void 0 ? {} : _this$opts$hooks,
          direction = _this$opts.direction;
      node.style.opacity = 0;
      node.style[direction] = 0;
      node.style.position = 'absolute';
      node.style.display = 'inline-block';
      node.style.pointerEvents = this.isShow ? 'auto' : 'none';
      node.style.visibility = this.isShow ? 'visible' : 'hidden';
      callHook(hooks, 'barrageCreate', [barrage, node]);
    }
  }, {
    key: "stashLength",
    get: function get() {
      return this.stashBarrages.length;
    }
  }, {
    key: "specialLength",
    get: function get() {
      return this.specialBarrages.length;
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
    key: "containerWidth",
    get: function get() {
      return this.RuntimeManager.containerWidth;
    }
  }, {
    key: "containerHeight",
    get: function get() {
      return this.RuntimeManager.containerHeight;
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
    limit: 100,
    height: 50,
    rowGap: 50,
    isShow: true,
    capacity: 1024,
    times: [5, 10],
    interval: 1,
    direction: 'right',
    forceRender: false
  }, opts);
  return new BarrageManager(opts);
}

var index = {
  Timeline: Timeline,
  create: createBarrageManager
};

export default index;
