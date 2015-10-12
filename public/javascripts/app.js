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

var proto = {

    init: function init() {
        this._reset();
        this._loop();
    },

    _reset: function _reset() {
        this.currentIterations = 0;
        var particles = _utils.Utils.initArray(this.settings.numOfParticles, this.graphics.randomParticle.bind(this.graphics));
        this.pso = _pso.PSO.create(particles, this.fitnessFunction);
        _logger.Logger.clear();
    },

    run: function run() {
        if (this._reachedMaxIterations()) {
            this._reset();
        }
        if (this.running) {
            this._reset();
        }
        this.running = true;
    },

    step: function step() {
        if (this._reachedMaxIterations()) {
            this._reset();
        }
        this.running = false;
        this._update();
    },

    _loop: function _loop() {
        this._render();

        if (this.running) {
            this._update();
        }

        if (this._reachedMaxIterations()) {
            this.running = false;
        }

        window.requestAnimationFrame(this._loop.bind(this));
    },

    _reachedMaxIterations: function _reachedMaxIterations() {
        return this.currentIterations > this.settings.maxIterations;
    },

    _update: function _update() {
        this.currentIterations++;
        this.pso.update(this.settings);
        this._logGBest();
    },

    _render: function _render() {
        var _this = this;

        this.graphics.drawBackground();

        this.pso.particles.forEach(function (p) {
            _this.graphics.drawParticle(p);

            if (_this.settings.showTrace) {
                _this.graphics.drawTrace(p);
            }

            if (_this.settings.showVelocity) {
                _this.graphics.drawVelocity(p);
            }

            if (_this.settings.showPBest) {
                _this.graphics.drawPBest(p);
            }
        });

        if (this.settings.showGBest) {
            this.graphics.drawGBest(this.pso.gBest);
        }
    },

    _logGBest: function _logGBest() {
        var value = this.fitnessFunction(this.pso.gBest);
        _logger.Logger.setText('Valor máximo atual: ' + value.toFixed(5) + ' em ' + this.pso.gBest.toString());
    },

    _logScreenPosition: function _logScreenPosition(screenPos) {
        var pos = this.graphics.fromScreenCoordinates(screenPos);
        console.log(this.fitnessFunction(pos).toFixed(5) + ' @ ' + pos.toString());
    },

    _settingsChanged: function _settingsChanged(settings) {
        this.settings = settings;
    }
};

var App = {
    create: function create(canvas) {
        var app = Object.create(proto);
        app.controls = _controls.Controls.create(app._settingsChanged.bind(app), app.run.bind(app), app.step.bind(app));
        app.settings = app.controls.currentSettings();
        app.graphics = _graphics.Graphics.create(canvas);
        app.fitnessFunction = sombrero;
        app.running = false;
        canvas.addHoverTrackingFunction(app._logScreenPosition.bind(app));

        return app;
    }
};

exports.App = App;

},{"./controls":3,"./graphics":4,"./logger":5,"./pso":8,"./utils":9}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _vector = require('./vector');

var proto = {

    clearBackground: function clearBackground() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    },

    fillCircle: function fillCircle(pos, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    },

    drawLine: function drawLine(p1, p2, color) {
        this.drawLines([p1, p2], color);
    },

    drawLines: function drawLines(points, color) {
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
    },

    drawCross: function drawCross(pos, size, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x - size / 2, pos.y);
        this.ctx.lineTo(pos.x + size / 2, pos.y);
        this.ctx.moveTo(pos.x, pos.y - size / 2);
        this.ctx.lineTo(pos.x, pos.y + size / 2);
        this.ctx.closePath();
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    },

    addHoverTrackingFunction: function addHoverTrackingFunction(fun) {
        this.dom_canvas.addEventListener('mousemove', function (event) {
            fun(_vector.Vector.create({ x: event.offsetX, y: event.offsetY }));
        });
    }
};

var Canvas = {
    create: function create(dom_canvas) {
        return Object.assign(Object.create(proto), {
            dom_canvas: dom_canvas,
            ctx: dom_canvas.getContext('2d'),
            width: dom_canvas.width,
            height: dom_canvas.height
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

var proto = {
    changed: function changed() {
        this.changeSettings(this.currentSettings());
    },

    currentSettings: function currentSettings() {
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
    }
};

var Controls = {
    create: function create(changeSettings, run, step) {
        var c = Object.create(proto);
        c.changeSettings = changeSettings;

        Object.keys(inputs).forEach(function (k) {
            inputs[k].addEventListener('change', c.changed.bind(c));
        });

        buttons.run.addEventListener('click', run);
        buttons.step.addEventListener('click', step);

        return c;
    }
};

exports.Controls = Controls;

},{}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _vector = require('./vector');

var _utils = require('./utils');

var _particle = require('./particle');

var proto = {

    randomParticle: function randomParticle() {
        return _particle.Particle.create(this._randomPosition(), _vector.Vector.ORIGIN, _utils.Utils.randColor());
    },

    toScreenCoordinates: function toScreenCoordinates(pos) {
        var x = _utils.Utils.interpolate(pos.x, this.minX, this.maxX, 0, this.canvas.width),
            y = _utils.Utils.interpolate(pos.y, this.minY, this.maxY, 0, this.canvas.height);
        return _vector.Vector.create({ x: x, y: y });
    },

    fromScreenCoordinates: function fromScreenCoordinates(screenPos) {
        var x = _utils.Utils.interpolate(screenPos.x, 0, this.canvas.width, this.minX, this.maxX),
            y = _utils.Utils.interpolate(screenPos.y, 0, this.canvas.height, this.minY, this.maxY);
        return _vector.Vector.create({ x: x, y: y });
    },

    drawBackground: function drawBackground() {
        this.canvas.clearBackground();
        this._drawGrid();
    },

    drawGBest: function drawGBest(gBest) {
        this.canvas.drawCross(this.toScreenCoordinates(gBest), Graphics.gBestCrossSize, Graphics.gBestCrossColor);
    },

    drawParticle: function drawParticle(particle) {
        this.canvas.fillCircle(this.toScreenCoordinates(particle.pos), Graphics.particleSize, particle.color);
    },

    drawTrace: function drawTrace(particle) {
        var points = particle.posHistory.map(this.toScreenCoordinates.bind(this));
        this.canvas.drawLines(points, particle.color);
    },

    drawVelocity: function drawVelocity(particle) {
        var from = this.toScreenCoordinates(particle.pos),
            to = this.toScreenCoordinates(particle.pos.add(particle.vel.scale(0.1)));
        this.canvas.drawLine(from, to, 'darkgray');
    },

    drawPBest: function drawPBest(particle) {
        this.canvas.drawCross(this.toScreenCoordinates(particle.pBest), Graphics.pBestCrossSize, particle.color);
    },

    _drawGrid: function _drawGrid() {
        this.canvas.drawLine({ x: this.canvas.width / 2, y: 0 }, { x: this.canvas.width / 2,
            y: this.canvas.height }, 'white');
        this.canvas.drawLine({ x: 0, y: this.canvas.height / 2 }, { x: this.canvas.width,
            y: this.canvas.height / 2 }, 'white');
    },

    _randomPosition: function _randomPosition() {
        return _vector.Vector.create({ x: _utils.Utils.rand(this.minX, this.maxX),
            y: _utils.Utils.rand(this.minY, this.maxY) });
    }
};

var Graphics = {
    create: function create(canvas) {
        var g = Object.create(proto);
        g.canvas = canvas;
        g.minX = -12;
        g.maxX = -g.minX;
        g.minY = g.minX * canvas.height / canvas.width;
        g.maxY = -g.minY;
        g.xSpan = g.maxX - g.minX;
        g.ySpan = g.maxY - g.minY;

        return g;
    }
};

Graphics.particleSize = 2;
Graphics.gBestCrossColor = 'black';
Graphics.gBestCrossSize = 20;
Graphics.pBestCrossSize = 10;

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

var canvas = _canvas.Canvas.create(document.getElementById('drawing-canvas')),
    app = _app.App.create(canvas);
app.init();

},{"./app":1,"./canvas":2}],7:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var proto = {
    move: function move(dt) {
        this.pos = this.pos.add(this.vel.scale(dt));
        this.posHistory.push(this.pos);
    }
};

var Particle = {
    create: function create(pos, vel, color) {
        return Object.assign(Object.create(proto), {
            pos: pos,
            vel: vel,
            posHistory: [pos],
            pBest: pos,
            color: color
        });
    }
};

exports.Particle = Particle;

},{}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils');

var proto = {

    update: function update(settings) {
        var _this = this;

        this.particles.forEach(function (p) {
            p.move(settings.dt);
            p.pBest = _this._fittestPosition([p.pBest, p.pos]);
            p.vel = _this._newVelocity(p, _this.gBest, settings.c1, settings.c2, settings.k);
        });
        this.gBest = this._calculateGBest();
    },

    _calculateGBest: function _calculateGBest() {
        return this._fittestPosition(this.particles.map(_utils.Utils.accessor('pBest')));
    },

    _fittestPosition: function _fittestPosition(positions) {
        return _utils.Utils.maxBy(positions, this.fitnessFunction);
    },

    _newVelocity: function _newVelocity(particle, gBest, c1, c2, k) {
        var gBestComponent = gBest.subtract(particle.pos).scale(c1 * Math.random()),
            pBestComponent = particle.pBest.subtract(particle.pos).scale(c2 * Math.random());
        return particle.vel.scale(k).add(gBestComponent).add(pBestComponent);
    }
};

var PSO = {
    create: function create(particles, fitnessFunction) {
        var pso = Object.assign(Object.create(proto), {
            particles: particles,
            fitnessFunction: fitnessFunction
        });
        pso.gBest = pso._calculateGBest();
        return pso;
    }
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
var proto = {

    add: function add(other) {
        return Vector.create({ x: this.x + other.x,
            y: this.y + other.y });
    },

    subtract: function subtract(other) {
        return Vector.create({ x: this.x - other.x,
            y: this.y - other.y });
    },

    scale: function scale(factor) {
        return Vector.create({ x: factor * this.x,
            y: factor * this.y });
    },

    squareDistance: function squareDistance(other) {
        return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
    },

    toString: function toString() {
        return '(' + this.x.toFixed(2) + ', ' + this.y.toFixed(2) + ')';
    }
};

var Vector = {
    create: function create(coords) {
        return Object.assign(Object.create(proto), {
            x: coords.x,
            y: coords.y
        });
    }
};

Vector.ORIGIN = Vector.create({ x: 0, y: 0 });

exports.Vector = Vector;

},{}]},{},[1,2,3,4,5,6,7,8,9,10]);
