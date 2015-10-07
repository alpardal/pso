(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _controls = require('./controls');

var _graphics = require('./graphics');

var _particle = require('./particle');

var _utils = require('./utils');

var _pso = require('./pso');

var _viewport = require('./viewport');

var _logger = require('./logger');

function sombrero(position) {
    var x2 = position.x * position.x,
        y2 = position.y * position.y;
    return Math.sin(Math.sqrt(x2 + y2)) / Math.sqrt(x2 + y2);
}

function App(canvas) {
    this.controls = new _controls.Controls(this._settingsChanged.bind(this), this.start.bind(this), this.step.bind(this));
    this.settings = this.controls.currentSettings();
    this.graphics = new _graphics.Graphics(canvas);
    this.viewport = new _viewport.Viewport(canvas, 12);
    this.fitnessFunction = (function (position) {
        return sombrero(this.viewport.toLogicCoordinates(position));
    }).bind(this);
    canvas.addHoverTrackingFunction((function (pos) {
        console.log(this.fitnessFunction(pos).toFixed(5) + ' @ ' + this.viewport.toLogicCoordinates(pos));
    }).bind(this));
    this.running = false;
}

App.prototype.init = function () {
    this._reset();
    this._loop();
};

App.prototype._reset = function () {
    this.currentIterations = 0;
    this.finished = false;
    var particles = _utils.Utils.initArray(this.settings.numOfParticles, _particle.Particle.createParticle);
    this.pso = new _pso.PSO(particles, this.fitnessFunction);
    _logger.Logger.clear();
};

App.prototype.start = function () {
    if (this.finished) {
        this._reset();
    }
    this.running = true;
};

App.prototype.step = function () {
    if (this.finished) {
        this._reset();
    }
    this.running = false;
    this._update();
};

App.prototype._loop = function () {
    this._render();

    if (this.running) {
        this._update();
    }

    if (this._reachedMaxIterations()) {
        this.finished = true;
        this.running = false;
    }

    window.requestAnimationFrame(this._loop.bind(this));
};

App.prototype._reachedMaxIterations = function () {
    return this.currentIterations > this.settings.maxIterations;
};

App.prototype._update = function () {
    this.currentIterations++;
    this.pso.update(this.settings);
    this._logGBest();
};

App.prototype._render = function () {
    this.graphics.drawBackground();

    this.pso.particles.forEach(function (p) {
        this.graphics.drawParticle(p);

        if (this.settings.showTrace) {
            this.graphics.drawTrace(p);
        }

        if (this.settings.showVelocity) {
            this.graphics.drawVelocity(p);
        }
    }, this);

    if (this.settings.showGBest) {
        this.graphics.drawGBest(this.pso.gBest);
    }
};

App.prototype._logGBest = function () {
    var value = this.fitnessFunction(this.pso.gBest);
    _logger.Logger.setText('Valor máximo atual: ' + value.toFixed(5) + ' em ' + this.viewport.toLogicCoordinates(this.pso.gBest).toString());
};

App.prototype._settingsChanged = function (settings) {
    this.settings = settings;
};

exports.App = App;

},{"./controls":3,"./graphics":4,"./logger":5,"./particle":7,"./pso":8,"./utils":9,"./viewport":11}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _vector = require('./vector');

var canvas = document.getElementById('drawing-canvas'),
    ctx = canvas.getContext('2d');

var Canvas = {

    width: canvas.width,

    height: canvas.height,

    clearBackground: function clearBackground() {
        ctx.clearRect(0, 0, this.width, this.height);
    },

    fillCircle: function fillCircle(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    },

    drawLine: function drawLine(p1, p2, color) {
        this.drawLines([p1, p2], color);
    },

    drawLines: function drawLines(points, color) {
        ctx.beginPath();
        ctx.closePath();

        for (var i = 0; i < points.length - 1; i++) {
            var p1 = points[i],
                p2 = points[i + 1];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }

        ctx.strokeStyle = color;
        ctx.stroke();
    },

    drawCross: function drawCross(x, y, size, color) {
        ctx.beginPath();
        ctx.moveTo(x - size / 2, y);
        ctx.lineTo(x + size / 2, y);
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x, y + size / 2);
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.stroke();
    },

    addHoverTrackingFunction: function addHoverTrackingFunction(fun) {
        canvas.addEventListener('mousemove', function (event) {
            fun(new _vector.Vector({ x: event.offsetX, y: event.offsetY }));
        });
    }
};

exports.Canvas = Canvas;

},{"./vector":10}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var inputs = {
    numberOfParticles: document.getElementById('numberOfParticles'),
    c1: document.getElementById('c1'),
    c2: document.getElementById('c2'),
    k: document.getElementById('k'),
    dt: document.getElementById('dt'),
    maxIterations: document.getElementById('maxIterations'),
    showGBest: document.getElementById('showGBest'),
    showTrace: document.getElementById('showTrace'),
    showVelocity: document.getElementById('showVelocity')
},
    buttons = {
    start: document.getElementById('startButton'),
    step: document.getElementById('stepButton')
};

function intValue(field) {
    return Number.parseInt(field.value);
}

function floatValue(field) {
    return Number.parseFloat(field.value);
}

var Controls = function Controls(changeSettings, start, step) {
    this.changeSettings = changeSettings;

    Object.keys(inputs).forEach(function (k) {
        inputs[k].addEventListener('change', this.changed.bind(this));
    }, this);

    buttons.start.addEventListener('click', start);
    buttons.step.addEventListener('click', step);
};

Controls.prototype.changed = function () {
    this.changeSettings(this.currentSettings());
};

Controls.prototype.currentSettings = function () {
    return {
        numOfParticles: intValue(inputs.numberOfParticles),
        c1: floatValue(inputs.c1),
        c2: floatValue(inputs.c2),
        k: floatValue(inputs.k),
        dt: floatValue(inputs.dt),
        maxIterations: intValue(inputs.maxIterations),
        showGBest: inputs.showGBest.checked,
        showTrace: inputs.showTrace.checked,
        showVelocity: inputs.showVelocity.checked
    };
};

exports.Controls = Controls;

},{}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;
function Graphics(canvas) {
    this.canvas = canvas;
}

Graphics.particleSize = 2;

Graphics.prototype.drawBackground = function () {
    this.canvas.clearBackground();
    this._drawGrid();
};

Graphics.prototype.drawGBest = function (gBest) {
    this.canvas.drawCross(gBest.x, gBest.y, 20, 'black');
};

Graphics.prototype.drawParticle = function (particle) {
    this.canvas.fillCircle(particle.pos.x, particle.pos.y, Graphics.particleSize, particle.color);
};

Graphics.prototype.drawTrace = function (particle) {
    this.canvas.drawLines(particle.posHistory, particle.color);
};

Graphics.prototype.drawVelocity = function (particle) {
    this.canvas.drawLine(particle.pos, particle.pos.add(particle.vel.scale(0.1)), 'darkgray');
};

Graphics.prototype._drawGrid = function () {
    this.canvas.drawLine({ x: this.canvas.width / 2, y: 0 }, { x: this.canvas.width / 2, y: this.canvas.height }, 'white');
    this.canvas.drawLine({ x: 0, y: this.canvas.height / 2 }, { x: this.canvas.width, y: this.canvas.height / 2 }, 'white');
};

exports.Graphics = Graphics;

},{}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var output = document.getElementById('output');

var Logger = {

    clear: function clear() {
        output.textContent = '';
    },

    setText: function setText(text) {
        output.textContent = text;
    }
};

exports.Logger = Logger;

},{}],6:[function(require,module,exports){
'use strict';

var _canvas = require('./canvas');

var _app = require('./app');

var app = new _app.App(_canvas.Canvas);
app.init();

},{"./app":1,"./canvas":2}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _vector = require('./vector');

var _canvas = require('./canvas');

var _utils = require('./utils');

var Particle = function Particle(pos, vel) {
    this.pos = pos;
    this.posHistory = [pos];
    this.vel = vel;
};

Particle.prototype.move = function (dt) {
    this.pos = this.pos.add(this.vel.scale(dt));
    this.posHistory.push(this.pos);
};

Particle.getPos = function (particle) {
    return particle.pos;
};

var maxSpeed = 0.001;

Particle.createParticle = function () {
    var pos = new _vector.Vector({ x: _utils.Utils.randInt(0, _canvas.Canvas.width),
        y: _utils.Utils.randInt(0, _canvas.Canvas.height) }),
        vel = new _vector.Vector({ x: _utils.Utils.randFloat(-maxSpeed, maxSpeed),
        y: _utils.Utils.randFloat(-maxSpeed, maxSpeed) });
    var p = new Particle(pos, vel);
    p.pBest = p.pos;
    p.color = _utils.Utils.randColor();
    return p;
};

exports.Particle = Particle;

},{"./canvas":2,"./utils":9,"./vector":10}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils');

function PSO(particles, fitnessFunction) {
    this.particles = particles;
    this.fitnessFunction = fitnessFunction;
    this.gBest = this._calculateGBest();
}

PSO.prototype.update = function (settings) {
    this.particles.forEach(function (p) {
        p.move(settings.dt);
        p.pBest = this._fittestPosition([p.pBest, p.pos]);
        p.vel = this._newVelocity(p, this.gBest, settings.c1, settings.c2, settings.k);
    }, this);
    this.gBest = this._calculateGBest();
};

PSO.prototype._calculateGBest = function () {
    return this._fittestPosition(this.particles.map(_utils.Utils.accessor('pBest')));
};

PSO.prototype._fittestPosition = function (positions) {
    return _utils.Utils.maxBy(positions, this.fitnessFunction);
};

PSO.prototype._newVelocity = function (particle, gBest, c1, c2, k) {
    var gBestComponent = gBest.subtract(particle.pos).scale(c1 * Math.random()),
        pBestComponent = particle.pBest.subtract(particle.pos).scale(c2 * Math.random());
    return particle.vel.scale(k).add(gBestComponent).add(pBestComponent);
};

exports.PSO = PSO;

},{"./utils":9}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var Utils = {

    randFloat: function randFloat(min, max) {
        return min + Math.random() * (max - min);
    },

    randInt: function randInt(min, max) {
        return Math.round(Utils.randFloat(min, max));
    },

    randColor: function randColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },

    initArray: function initArray(size, generator) {
        var array = [];
        for (var i = 0; i < size; i++) {
            array.push(generator());
        }
        return array;
    },

    maxBy: function maxBy(items, transform) {
        return items.map(function (i) {
            return { item: i, value: transform(i) };
        }).reduce(function (best, current) {
            return current.value > best.value ? current : best;
        }).item;
    },

    interpolate: function interpolate(value, max, newMin, newMax) {
        return newMin + (newMax - newMin) * value / max;
    },

    accessor: function accessor(propName) {
        return function (item) {
            return item[propName];
        };
    }
};

exports.Utils = Utils;

},{}],10:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var Vector = function Vector(coords) {
    this.x = coords.x;
    this.y = coords.y;
};

Vector.prototype.add = function (other) {
    return new Vector({ x: this.x + other.x,
        y: this.y + other.y });
};

Vector.prototype.subtract = function (other) {
    return new Vector({ x: this.x - other.x,
        y: this.y - other.y });
};

Vector.prototype.scale = function (factor) {
    return new Vector({ x: factor * this.x,
        y: factor * this.y });
};

Vector.prototype.squareDistance = function (other) {
    return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
};

Vector.prototype.toString = function () {
    return '(' + this.x.toFixed(2) + ', ' + this.y.toFixed(2) + ')';
};

exports.Vector = Vector;

},{}],11:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils');

var _vector = require('./vector');

function Viewport(canvas, logicWidth) {
    this.screenWidth = canvas.width;
    this.screenHeight = canvas.height;
    this.logicWidth = logicWidth;
    this.logicHeight = logicWidth * this.screenHeight / this.screenWidth;
}

Viewport.prototype.toLogicCoordinates = function (screenPosition) {
    var logicX = _utils.Utils.interpolate(screenPosition.x, this.screenWidth, -this.logicWidth / 2, this.logicWidth / 2),
        logicY = _utils.Utils.interpolate(screenPosition.y, this.screenHeight, this.logicHeight / 2, -this.logicHeight / 2);

    return new _vector.Vector({ x: logicX, y: logicY });
};

exports.Viewport = Viewport;

},{"./utils":9,"./vector":10}]},{},[1,2,3,4,5,6,7,8,9,10,11]);
