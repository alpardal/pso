(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _controls = require('./controls');

var _graphics = require('./graphics');

var _utils = require('./utils');

var _pso = require('./pso');

var _logger = require('./logger');

function sombrero(position) {
    var x2 = position.x * position.x,
        y2 = position.y * position.y;
    return 6 * Math.cos(Math.sqrt(x2 + y2)) / (x2 + y2 + 6);
}

function App(canvas) {
    this.controls = new _controls.Controls(this._settingsChanged.bind(this), this.run.bind(this), this.step.bind(this));
    this.settings = this.controls.currentSettings();
    this.graphics = new _graphics.Graphics(canvas);
    this.fitnessFunction = sombrero;
    this.running = false;
    canvas.addHoverTrackingFunction(this._logScreenPosition.bind(this));
}

App.prototype.init = function () {
    this._reset();
    this._loop();
};

App.prototype._reset = function () {
    this.currentIterations = 0;
    var particles = _utils.Utils.initArray(this.settings.numOfParticles, this.graphics.randomParticle.bind(this.graphics));
    this.pso = new _pso.PSO(particles, this.fitnessFunction);
    _logger.Logger.clear();
};

App.prototype.run = function () {
    if (this._reachedMaxIterations()) {
        this._reset();
    }
    if (this.running) {
        this._reset();
    }
    this.running = true;
};

App.prototype.step = function () {
    if (this._reachedMaxIterations()) {
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

        if (this.settings.showPBest) {
            this.graphics.drawPBest(p);
        }
    }, this);

    if (this.settings.showGBest) {
        this.graphics.drawGBest(this.pso.gBest);
    }
};

App.prototype._logGBest = function () {
    var value = this.fitnessFunction(this.pso.gBest);
    _logger.Logger.setText('Valor máximo atual: ' + value.toFixed(5) + ' em ' + this.pso.gBest.toString());
};

App.prototype._logScreenPosition = function (screenPos) {
    var pos = this.graphics.fromScreenCoordinates(screenPos);
    console.log(this.fitnessFunction(pos).toFixed(5) + ' @ ' + pos.toString());
};

App.prototype._settingsChanged = function (settings) {
    this.settings = settings;
};

exports.App = App;

},{"./controls":3,"./graphics":4,"./logger":5,"./pso":8,"./utils":9}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _vector = require('./vector');

var Canvas = function Canvas(dom_canvas) {
    this.dom_canvas = dom_canvas;
    this.ctx = dom_canvas.getContext('2d');
    this.width = dom_canvas.width;
    this.height = dom_canvas.height;
};

Canvas.prototype.clearBackground = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
};

Canvas.prototype.fillCircle = function (pos, radius, color) {
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
};

Canvas.prototype.drawLine = function (p1, p2, color) {
    this.drawLines([p1, p2], color);
};

Canvas.prototype.drawLines = function (points, color) {
    this.ctx.beginPath();
    this.ctx.closePath();

    for (var i = 0; i < points.length - 1; i++) {
        var p1 = points[i],
            p2 = points[i + 1];
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
    }

    this.ctx.strokeStyle = color;
    this.ctx.stroke();
};

Canvas.prototype.drawCross = function (pos, size, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x - size / 2, pos.y);
    this.ctx.lineTo(pos.x + size / 2, pos.y);
    this.ctx.moveTo(pos.x, pos.y - size / 2);
    this.ctx.lineTo(pos.x, pos.y + size / 2);
    this.ctx.closePath();
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
};

Canvas.prototype.addHoverTrackingFunction = function (fun) {
    this.dom_canvas.addEventListener('mousemove', function (event) {
        fun(new _vector.Vector({ x: event.offsetX, y: event.offsetY }));
    });
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
    showPBest: document.getElementById('showPBest'),
    showTrace: document.getElementById('showTrace'),
    showVelocity: document.getElementById('showVelocity')
},
    buttons = {
    run: document.getElementById('runButton'),
    step: document.getElementById('stepButton')
};

function intValue(field) {
    return Number.parseInt(field.value);
}

function floatValue(field) {
    return Number.parseFloat(field.value);
}

var Controls = function Controls(changeSettings, run, step) {
    this.changeSettings = changeSettings;

    Object.keys(inputs).forEach(function (k) {
        inputs[k].addEventListener('change', this.changed.bind(this));
    }, this);

    buttons.run.addEventListener('click', run);
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
        showPBest: inputs.showPBest.checked,
        showTrace: inputs.showTrace.checked,
        showVelocity: inputs.showVelocity.checked
    };
};

exports.Controls = Controls;

},{}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _vector = require('./vector');

var _utils = require('./utils');

var _particle = require('./particle');

function Graphics(canvas) {
    this.canvas = canvas;
    this.minX = -12;
    this.maxX = -this.minX;
    this.minY = this.minX * canvas.height / canvas.width;
    this.maxY = -this.minY;
    this.xSpan = this.maxX - this.minX;
    this.ySpan = this.maxY - this.minY;
}

Graphics.particleSize = 2;
Graphics.gBestCrossColor = 'black';
Graphics.gBestCrossSize = 20;
Graphics.pBestCrossSize = 10;

Graphics.prototype.randomParticle = function () {
    return new _particle.Particle(this._randomPosition(), _vector.Vector.ORIGIN, _utils.Utils.randColor());
};

Graphics.prototype.toScreenCoordinates = function (pos) {
    var x = _utils.Utils.interpolate(pos.x, this.minX, this.maxX, 0, this.canvas.width),
        y = _utils.Utils.interpolate(pos.y, this.minY, this.maxY, 0, this.canvas.height);
    return new _vector.Vector({ x: x, y: y });
};

Graphics.prototype.fromScreenCoordinates = function (screenPos) {
    var x = _utils.Utils.interpolate(screenPos.x, 0, this.canvas.width, this.minX, this.maxX),
        y = _utils.Utils.interpolate(screenPos.y, 0, this.canvas.height, this.minY, this.maxY);
    return new _vector.Vector({ x: x, y: y });
};

Graphics.prototype.drawBackground = function () {
    this.canvas.clearBackground();
    this._drawGrid();
};

Graphics.prototype.drawGBest = function (gBest) {
    this.canvas.drawCross(this.toScreenCoordinates(gBest), Graphics.gBestCrossSize, Graphics.gBestCrossColor);
};

Graphics.prototype.drawParticle = function (particle) {
    this.canvas.fillCircle(this.toScreenCoordinates(particle.pos), Graphics.particleSize, particle.color);
};

Graphics.prototype.drawTrace = function (particle) {
    this.canvas.drawLines(particle.posHistory.map(this.toScreenCoordinates.bind(this)), particle.color);
};

Graphics.prototype.drawVelocity = function (particle) {
    var from = this.toScreenCoordinates(particle.pos),
        to = this.toScreenCoordinates(particle.pos.add(particle.vel.scale(0.1)));
    this.canvas.drawLine(from, to, 'darkgray');
};

Graphics.prototype.drawPBest = function (particle) {
    this.canvas.drawCross(this.toScreenCoordinates(particle.pBest), Graphics.pBestCrossSize, particle.color);
};

Graphics.prototype._drawGrid = function () {
    this.canvas.drawLine({ x: this.canvas.width / 2, y: 0 }, { x: this.canvas.width / 2, y: this.canvas.height }, 'white');
    this.canvas.drawLine({ x: 0, y: this.canvas.height / 2 }, { x: this.canvas.width, y: this.canvas.height / 2 }, 'white');
};

Graphics.prototype._randomPosition = function () {
    return new _vector.Vector({ x: _utils.Utils.rand(this.minX, this.maxX),
        y: _utils.Utils.rand(this.minY, this.maxY) });
};

exports.Graphics = Graphics;

},{"./particle":7,"./utils":9,"./vector":10}],5:[function(require,module,exports){
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

var app = new _app.App(new _canvas.Canvas(document.getElementById('drawing-canvas')));
app.init();

},{"./app":1,"./canvas":2}],7:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var Particle = function Particle(pos, vel, color) {
    this.pos = pos;
    this.vel = vel;
    this.posHistory = [pos];
    this.pBest = this.pos;
    this.color = color;
};

Particle.prototype.move = function (dt) {
    this.pos = this.pos.add(this.vel.scale(dt));
    this.posHistory.push(this.pos);
};

exports.Particle = Particle;

},{}],8:[function(require,module,exports){
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
var ffffff = Number.parseInt('ffffff', 16);

var Utils = {

    rand: function rand(min, max) {
        return min + Math.random() * (max - min);
    },

    randColor: function randColor() {
        return '#' + Math.floor(Math.random() * ffffff).toString(16);
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

    interpolate: function interpolate(value, oldMin, oldMax, newMin, newMax) {
        var ratio = (value - oldMin) / (oldMax - oldMin);
        return newMin + ratio * (newMax - newMin);
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

Vector.ORIGIN = new Vector({ x: 0, y: 0 });

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

},{}]},{},[1,2,3,4,5,6,7,8,9,10]);
