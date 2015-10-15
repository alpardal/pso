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
        _logger.Logger.setText('Valor máximo atual: ' + value.toFixed(5) + (' em ' + this.pso.gBest));
    },

    _logScreenPosition: function _logScreenPosition(screenPos) {
        var pos = this.graphics.fromScreenCoordinates(screenPos);
        console.log(this.fitnessFunction(pos).toFixed(5) + ' @ ' + pos);
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

},{}]},{},[1,2,3,4,5,6,7,8,9,10])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvYXBwLmpzIiwiL2hvbWUvYW5kcmUvY29kZS9wc28vYXBwL2NhbnZhcy5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9jb250cm9scy5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9ncmFwaGljcy5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9sb2dnZXIuanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvbWFpbi5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9wYXJ0aWNsZS5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9wc28uanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvdXRpbHMuanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvdmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozt3QkNBdUIsWUFBWTs7d0JBQ1osWUFBWTs7cUJBQ2YsU0FBUzs7bUJBQ1gsT0FBTzs7c0JBQ0osVUFBVTs7QUFFL0IsU0FBUyxRQUFRLENBQUMsUUFBUSxFQUFFO0FBQ3hCLFFBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDNUIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUNqQyxXQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFDO0NBQzNEOztBQUVELElBQUksS0FBSyxHQUFHOztBQUVSLFFBQUksRUFBQSxnQkFBRztBQUNILFlBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNkLFlBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNoQjs7QUFFRCxVQUFNLEVBQUEsa0JBQUc7QUFDTCxZQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFlBQUksU0FBUyxHQUFHLGFBQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDbEYsWUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZELHVCQUFPLEtBQUssRUFBRSxDQUFDO0tBQ2xCOztBQUVELE9BQUcsRUFBQSxlQUFHO0FBQ0YsWUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRTtBQUFFLGdCQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FBRTtBQUNwRCxZQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFBRSxnQkFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQUU7QUFDcEMsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7S0FDdkI7O0FBRUQsUUFBSSxFQUFBLGdCQUFHO0FBQ0gsWUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRTtBQUFFLGdCQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FBRTtBQUNwRCxZQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixZQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbEI7O0FBRUQsU0FBSyxFQUFBLGlCQUFHO0FBQ0osWUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVmLFlBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNkLGdCQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDbEI7O0FBRUQsWUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBQztBQUM3QixnQkFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7U0FDeEI7O0FBRUQsY0FBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDdkQ7O0FBRUQseUJBQXFCLEVBQUEsaUNBQUc7QUFDcEIsZUFBTyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7S0FDL0Q7O0FBRUQsV0FBTyxFQUFBLG1CQUFHO0FBQ04sWUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDekIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUNwQjs7QUFFRCxXQUFPLEVBQUEsbUJBQUc7OztBQUNOLFlBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRS9CLFlBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsRUFBSTtBQUM1QixrQkFBSyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU5QixnQkFBSSxNQUFLLFFBQVEsQ0FBQyxTQUFTLEVBQUU7QUFDekIsc0JBQUssUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM5Qjs7QUFFRCxnQkFBSSxNQUFLLFFBQVEsQ0FBQyxZQUFZLEVBQUU7QUFDNUIsc0JBQUssUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqQzs7QUFFRCxnQkFBSSxNQUFLLFFBQVEsQ0FBQyxTQUFTLEVBQUU7QUFDekIsc0JBQUssUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM5QjtTQUNKLENBQUMsQ0FBQzs7QUFFSCxZQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFO0FBQ3pCLGdCQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzNDO0tBQ0o7O0FBRUQsYUFBUyxFQUFBLHFCQUFHO0FBQ1IsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pELHVCQUFPLE9BQU8sQ0FBQyx5QkFBdUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsYUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDO0tBQzlCOztBQUVELHNCQUFrQixFQUFBLDRCQUFDLFNBQVMsRUFBRTtBQUMxQixZQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pELGVBQU8sQ0FBQyxHQUFHLENBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQU0sR0FBRyxDQUFHLENBQUM7S0FDbkU7O0FBRUQsb0JBQWdCLEVBQUEsMEJBQUMsUUFBUSxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0tBQzVCO0NBQ0osQ0FBQzs7QUFFRixJQUFJLEdBQUcsR0FBRztBQUNOLFVBQU0sRUFBQSxnQkFBQyxNQUFNLEVBQUU7QUFDWCxZQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9CLFdBQUcsQ0FBQyxRQUFRLEdBQUcsbUJBQVMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQzlCLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNqQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ25ELFdBQUcsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUM5QyxXQUFHLENBQUMsUUFBUSxHQUFHLG1CQUFTLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN2QyxXQUFHLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQztBQUMvQixXQUFHLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNwQixjQUFNLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUVsRSxlQUFPLEdBQUcsQ0FBQztLQUNkO0NBQ0osQ0FBQzs7UUFHTSxHQUFHLEdBQUgsR0FBRzs7Ozs7OztzQkN4SFUsVUFBVTs7QUFFL0IsSUFBSSxLQUFLLEdBQUc7O0FBRVIsbUJBQWUsRUFBQSwyQkFBRztBQUNkLFlBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDckQ7O0FBRUQsY0FBVSxFQUFBLG9CQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQzNCLFlBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDckIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqRCxZQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztBQUMzQixZQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ25COztBQUVELFlBQVEsRUFBQSxrQkFBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRTtBQUNwQixZQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ25DOztBQUVELGFBQVMsRUFBQSxtQkFBQyxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDckIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFckIsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RDLGdCQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNkLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLGdCQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixnQkFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDL0I7O0FBRUQsWUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQzdCLFlBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDckI7O0FBRUQsYUFBUyxFQUFBLG1CQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO0FBQ3hCLFlBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDckIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxJQUFJLEdBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxZQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLElBQUksR0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLFlBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsWUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFDLElBQUksR0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxZQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUM3QixZQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3JCOztBQUVELDRCQUF3QixFQUFBLGtDQUFDLEdBQUcsRUFBRTtBQUMxQixZQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxVQUFTLEtBQUssRUFBRTtBQUMxRCxlQUFHLENBQUMsZUFBTyxNQUFNLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsQ0FBQztTQUM1RCxDQUFDLENBQUM7S0FDTjtDQUNKLENBQUM7O0FBRUYsSUFBSSxNQUFNLEdBQUc7QUFDVCxVQUFNLEVBQUEsZ0JBQUMsVUFBVSxFQUFFO0FBQ2YsZUFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDdkMsc0JBQVUsRUFBRSxVQUFVO0FBQ3RCLGVBQUcsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztBQUNoQyxpQkFBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLO0FBQ3ZCLGtCQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07U0FDNUIsQ0FBQyxDQUFDO0tBQ047Q0FDSixDQUFDOztRQUdNLE1BQU0sR0FBTixNQUFNOzs7Ozs7QUNqRWQsSUFBSSxNQUFNLEdBQUc7QUFDTCxxQkFBaUIsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDO0FBQy9ELE1BQUUsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztBQUNqQyxNQUFFLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7QUFDakMsS0FBQyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDO0FBQy9CLE1BQUUsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztBQUNqQyxpQkFBYSxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO0FBQ3ZELGFBQVMsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQztBQUMvQyxhQUFTLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7QUFDL0MsYUFBUyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO0FBQy9DLGdCQUFZLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUM7Q0FDeEQ7SUFDRCxPQUFPLEdBQUc7QUFDTixPQUFHLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7QUFDekMsUUFBSSxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDO0NBQzlDLENBQUE7O0FBRUwsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ3JCLFdBQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDdkM7O0FBRUQsU0FBUyxVQUFVLENBQUMsS0FBSyxFQUFFO0FBQ3ZCLFdBQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDekM7O0FBRUQsSUFBSSxLQUFLLEdBQUc7QUFDUixXQUFPLEVBQUEsbUJBQUc7QUFDTixZQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO0tBQy9DOztBQUVELG1CQUFlLEVBQUEsMkJBQUc7QUFDZCxlQUFPO0FBQ0gsMEJBQWMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0FBQ2xELGNBQUUsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUN6QixjQUFFLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7QUFDekIsYUFBQyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLGNBQUUsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUN6Qix5QkFBYSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDO0FBQzdDLHFCQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPO0FBQ25DLHFCQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPO0FBQ25DLHFCQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPO0FBQ25DLHdCQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPO1NBQzVDLENBQUM7S0FDTDtDQUNKLENBQUM7O0FBRUYsSUFBSSxRQUFRLEdBQUc7QUFDWCxVQUFNLEVBQUEsZ0JBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDOUIsWUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixTQUFDLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQzs7QUFFbEMsY0FBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLEVBQUk7QUFDN0Isa0JBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzRCxDQUFDLENBQUM7O0FBRUgsZUFBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDM0MsZUFBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRTdDLGVBQU8sQ0FBQyxDQUFDO0tBQ1o7Q0FDSixDQUFDOztRQUdNLFFBQVEsR0FBUixRQUFROzs7Ozs7O3NCQy9ESyxVQUFVOztxQkFDWCxTQUFTOzt3QkFDTixZQUFZOztBQUVuQyxJQUFJLEtBQUssR0FBRzs7QUFFUixrQkFBYyxFQUFBLDBCQUFHO0FBQ2IsZUFBTyxtQkFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLGVBQU8sTUFBTSxFQUNyQyxhQUFNLFNBQVMsRUFBRSxDQUFDLENBQUM7S0FDN0M7O0FBRUQsdUJBQW1CLEVBQUEsNkJBQUMsR0FBRyxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxHQUFHLGFBQU0sV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUNwQixDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDbEQsQ0FBQyxHQUFHLGFBQU0sV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUNwQixDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4RCxlQUFPLGVBQU8sTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUN0Qzs7QUFFRCx5QkFBcUIsRUFBQSwrQkFBQyxTQUFTLEVBQUU7QUFDN0IsWUFBSSxDQUFDLEdBQUcsYUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQ3BCLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN4RCxDQUFDLEdBQUcsYUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQ3JCLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELGVBQU8sZUFBTyxNQUFNLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ3RDOztBQUVELGtCQUFjLEVBQUEsMEJBQUc7QUFDYixZQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUNwQjs7QUFFRCxhQUFTLEVBQUEsbUJBQUMsS0FBSyxFQUFFO0FBQ2IsWUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUMvQixRQUFRLENBQUMsY0FBYyxFQUN2QixRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDbkQ7O0FBRUQsZ0JBQVksRUFBQSxzQkFBQyxRQUFRLEVBQUU7QUFDbkIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFDdEMsUUFBUSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDakU7O0FBRUQsYUFBUyxFQUFBLG1CQUFDLFFBQVEsRUFBRTtBQUNoQixZQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsVUFBVSxDQUNWLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDL0QsWUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNqRDs7QUFFRCxnQkFBWSxFQUFBLHNCQUFDLFFBQVEsRUFBRTtBQUNuQixZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUM3QyxFQUFFLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUNiLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxZQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQzlDOztBQUVELGFBQVMsRUFBQSxtQkFBQyxRQUFRLEVBQUU7QUFDaEIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFDeEMsUUFBUSxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbEU7O0FBRUQsYUFBUyxFQUFBLHFCQUFHO0FBQ1IsWUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFDOUIsRUFBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsQ0FBQztBQUN0QixhQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUMsRUFBRyxPQUFPLENBQUMsQ0FBQztBQUN4RCxZQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBQyxFQUMvQixFQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7QUFDcEIsYUFBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzVEOztBQUVELG1CQUFlLEVBQUEsMkJBQUc7QUFDZCxlQUFPLGVBQU8sTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFFLGFBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNuQyxhQUFDLEVBQUUsYUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQy9EO0NBQ0osQ0FBQzs7QUFFRixJQUFJLFFBQVEsR0FBRztBQUNYLFVBQU0sRUFBQSxnQkFBQyxNQUFNLEVBQUU7QUFDWCxZQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLFNBQUMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ2xCLFNBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDYixTQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNqQixTQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQzdDLFNBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ2pCLFNBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzFCLFNBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDOztBQUUxQixlQUFPLENBQUMsQ0FBQztLQUNaO0NBQ0osQ0FBQzs7QUFFRixRQUFRLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztBQUMxQixRQUFRLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQztBQUNuQyxRQUFRLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUM3QixRQUFRLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQzs7UUFHckIsUUFBUSxHQUFSLFFBQVE7Ozs7OztBQ2pHaEIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFL0MsSUFBSSxNQUFNLEdBQUc7O0FBRVQsU0FBSyxFQUFFLGlCQUFXO0FBQ2QsY0FBTSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7S0FDM0I7O0FBRUQsV0FBTyxFQUFFLGlCQUFTLElBQUksRUFBRTtBQUNwQixjQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztLQUM3QjtDQUNKLENBQUM7O1FBRU0sTUFBTSxHQUFOLE1BQU07Ozs7O3NCQ2JPLFVBQVU7O21CQUNiLE9BQU87O0FBRXpCLElBQUksTUFBTSxHQUFHLGVBQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNqRSxHQUFHLEdBQUcsU0FBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDOzs7Ozs7O0FDSlgsSUFBSSxLQUFLLEdBQUc7QUFDUixRQUFJLEVBQUEsY0FBQyxFQUFFLEVBQUU7QUFDTCxZQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUMsWUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2xDO0NBQ0osQ0FBQzs7QUFFRixJQUFJLFFBQVEsR0FBRztBQUNYLFVBQU0sRUFBQSxnQkFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUNwQixlQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN2QyxlQUFHLEVBQUUsR0FBRztBQUNSLGVBQUcsRUFBRSxHQUFHO0FBQ1Isc0JBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNqQixpQkFBSyxFQUFFLEdBQUc7QUFDVixpQkFBSyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7S0FDTjtDQUNKLENBQUM7O1FBR00sUUFBUSxHQUFSLFFBQVE7Ozs7Ozs7cUJDckJJLFNBQVM7O0FBRTdCLElBQUksS0FBSyxHQUFHOztBQUVSLFVBQU0sRUFBQSxnQkFBQyxRQUFRLEVBQUU7OztBQUNiLFlBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxFQUFJO0FBQ3hCLGFBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLGFBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBSyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEQsYUFBQyxDQUFDLEdBQUcsR0FBRyxNQUFLLFlBQVksQ0FBQyxDQUFDLEVBQUUsTUFBSyxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFDMUIsUUFBUSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEQsQ0FBQyxDQUFDO0FBQ0gsWUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7S0FDdkM7O0FBRUQsbUJBQWUsRUFBQSwyQkFBRztBQUNkLGVBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM3RTs7QUFFRCxvQkFBZ0IsRUFBQSwwQkFBQyxTQUFTLEVBQUU7QUFDeEIsZUFBTyxhQUFNLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ3ZEOztBQUVELGdCQUFZLEVBQUEsc0JBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNyQyxZQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FDdEIsS0FBSyxDQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FDdEIsS0FBSyxDQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUM1RCxlQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FDbkIsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQzNDO0NBQ0osQ0FBQzs7QUFFRixJQUFJLEdBQUcsR0FBRztBQUNOLFVBQU0sRUFBQSxnQkFBQyxTQUFTLEVBQUUsZUFBZSxFQUFFO0FBQy9CLFlBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUMxQyxxQkFBUyxFQUFFLFNBQVM7QUFDcEIsMkJBQWUsRUFBRSxlQUFlO1NBQ25DLENBQUMsQ0FBQztBQUNILFdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ2xDLGVBQU8sR0FBRyxDQUFDO0tBQ2Q7Q0FDSixDQUFDOztRQUdNLEdBQUcsR0FBSCxHQUFHOzs7Ozs7QUM3Q1gsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRTNDLElBQUksS0FBSyxHQUFHOztBQUVSLFFBQUksRUFBRSxjQUFTLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDckIsZUFBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUEsQUFBQyxDQUFDO0tBQzVDOztBQUVELGFBQVMsRUFBRSxxQkFBVztBQUNsQixlQUFPLEdBQUcsR0FDTixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDckQ7O0FBRUQsYUFBUyxFQUFFLG1CQUFTLElBQUksRUFBRSxTQUFTLEVBQUU7QUFDakMsWUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2YsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQixpQkFBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQzNCO0FBQ0QsZUFBTyxLQUFLLENBQUM7S0FDaEI7O0FBRUQsU0FBSyxFQUFFLGVBQVMsS0FBSyxFQUFFLFNBQVMsRUFBRTtBQUM5QixlQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFDekIsbUJBQU8sRUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztTQUN6QyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVMsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUM5QixtQkFBTyxBQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ3hELENBQUMsQ0FBQyxJQUFJLENBQUM7S0FDWDs7QUFFRCxlQUFXLEVBQUUscUJBQVMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUN6RCxZQUFJLEtBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUEsSUFBSyxNQUFNLEdBQUcsTUFBTSxDQUFBLEFBQUMsQ0FBQztBQUNqRCxlQUFPLE1BQU0sR0FBRyxLQUFLLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQSxBQUFDLENBQUM7S0FDN0M7O0FBRUQsWUFBUSxFQUFFLGtCQUFTLFFBQVEsRUFBRTtBQUN6QixlQUFPLFVBQVMsSUFBSSxFQUFFO0FBQUUsbUJBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQUUsQ0FBQztLQUNwRDtDQUNKLENBQUM7O1FBRU0sS0FBSyxHQUFMLEtBQUs7Ozs7OztBQ3ZDYixJQUFJLEtBQUssR0FBRzs7QUFFUixPQUFHLEVBQUEsYUFBQyxLQUFLLEVBQUU7QUFDUCxlQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNuQixhQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUMvQzs7QUFFRCxZQUFRLEVBQUEsa0JBQUMsS0FBSyxFQUFFO0FBQ1osZUFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDbkIsYUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDL0M7O0FBRUQsU0FBSyxFQUFBLGVBQUMsTUFBTSxFQUFFO0FBQ1YsZUFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNsQixhQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQzlDOztBQUVELGtCQUFjLEVBQUEsd0JBQUMsS0FBSyxFQUFFO0FBQ2xCLGVBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzFDOztBQUVELFlBQVEsRUFBQSxvQkFBRztBQUNQLGVBQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7S0FDbkU7Q0FDSixDQUFDOztBQUVGLElBQUksTUFBTSxHQUFHO0FBQ1QsVUFBTSxFQUFBLGdCQUFDLE1BQU0sRUFBRTtBQUNYLGVBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3ZDLGFBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNYLGFBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNkLENBQUMsQ0FBQztLQUNOO0NBQ0osQ0FBQzs7QUFFRixNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDOztRQUdwQyxNQUFNLEdBQU4sTUFBTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge0NvbnRyb2xzfSBmcm9tICcuL2NvbnRyb2xzJztcbmltcG9ydCB7R3JhcGhpY3N9IGZyb20gJy4vZ3JhcGhpY3MnO1xuaW1wb3J0IHtVdGlsc30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge1BTT30gZnJvbSAnLi9wc28nO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4vbG9nZ2VyJztcblxuZnVuY3Rpb24gc29tYnJlcm8ocG9zaXRpb24pIHtcbiAgICBsZXQgeDIgPSBwb3NpdGlvbi54ICogcG9zaXRpb24ueCxcbiAgICAgICAgeTIgPSBwb3NpdGlvbi55ICogcG9zaXRpb24ueTtcbiAgICByZXR1cm4gNiAqIE1hdGguY29zKE1hdGguc3FydCh4MiArIHkyKSkgLyAoeDIgKyB5MiArIDYpO1xufVxuXG5sZXQgcHJvdG8gPSB7XG5cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLl9yZXNldCgpO1xuICAgICAgICB0aGlzLl9sb29wKCk7XG4gICAgfSxcblxuICAgIF9yZXNldCgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50SXRlcmF0aW9ucyA9IDA7XG4gICAgICAgIGxldCBwYXJ0aWNsZXMgPSBVdGlscy5pbml0QXJyYXkodGhpcy5zZXR0aW5ncy5udW1PZlBhcnRpY2xlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYXBoaWNzLnJhbmRvbVBhcnRpY2xlLmJpbmQodGhpcy5ncmFwaGljcykpO1xuICAgICAgICB0aGlzLnBzbyA9IFBTTy5jcmVhdGUocGFydGljbGVzLCB0aGlzLmZpdG5lc3NGdW5jdGlvbik7XG4gICAgICAgIExvZ2dlci5jbGVhcigpO1xuICAgIH0sXG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLl9yZWFjaGVkTWF4SXRlcmF0aW9ucygpKSB7IHRoaXMuX3Jlc2V0KCk7IH1cbiAgICAgICAgaWYgKHRoaXMucnVubmluZykgeyB0aGlzLl9yZXNldCgpOyB9XG4gICAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgfSxcblxuICAgIHN0ZXAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9yZWFjaGVkTWF4SXRlcmF0aW9ucygpKSB7IHRoaXMuX3Jlc2V0KCk7IH1cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuICAgIH0sXG5cbiAgICBfbG9vcCgpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fcmVhY2hlZE1heEl0ZXJhdGlvbnMoKSl7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fbG9vcC5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgX3JlYWNoZWRNYXhJdGVyYXRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50SXRlcmF0aW9ucyA+IHRoaXMuc2V0dGluZ3MubWF4SXRlcmF0aW9ucztcbiAgICB9LFxuXG4gICAgX3VwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50SXRlcmF0aW9ucysrO1xuICAgICAgICB0aGlzLnBzby51cGRhdGUodGhpcy5zZXR0aW5ncyk7XG4gICAgICAgIHRoaXMuX2xvZ0dCZXN0KCk7XG4gICAgfSxcblxuICAgIF9yZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuZHJhd0JhY2tncm91bmQoKTtcblxuICAgICAgICB0aGlzLnBzby5wYXJ0aWNsZXMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuZHJhd1BhcnRpY2xlKHApO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5zaG93VHJhY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmRyYXdUcmFjZShwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2hvd1ZlbG9jaXR5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5kcmF3VmVsb2NpdHkocCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnNob3dQQmVzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuZHJhd1BCZXN0KHApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5zaG93R0Jlc3QpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuZHJhd0dCZXN0KHRoaXMucHNvLmdCZXN0KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfbG9nR0Jlc3QoKSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZml0bmVzc0Z1bmN0aW9uKHRoaXMucHNvLmdCZXN0KTtcbiAgICAgICAgTG9nZ2VyLnNldFRleHQoYFZhbG9yIG3DoXhpbW8gYXR1YWw6ICR7dmFsdWUudG9GaXhlZCg1KX1gICtcbiAgICAgICAgICBgIGVtICR7dGhpcy5wc28uZ0Jlc3R9YCk7XG4gICAgfSxcblxuICAgIF9sb2dTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3MpIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuZ3JhcGhpY3MuZnJvbVNjcmVlbkNvb3JkaW5hdGVzKHNjcmVlblBvcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke3RoaXMuZml0bmVzc0Z1bmN0aW9uKHBvcykudG9GaXhlZCg1KX0gQCAke3Bvc31gKTtcbiAgICB9LFxuXG4gICAgX3NldHRpbmdzQ2hhbmdlZChzZXR0aW5ncykge1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgfVxufTtcblxubGV0IEFwcCA9IHtcbiAgICBjcmVhdGUoY2FudmFzKSB7XG4gICAgICAgIGxldCBhcHAgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgICAgICAgYXBwLmNvbnRyb2xzID0gQ29udHJvbHMuY3JlYXRlKGFwcC5fc2V0dGluZ3NDaGFuZ2VkLmJpbmQoYXBwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5ydW4uYmluZChhcHApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwLnN0ZXAuYmluZChhcHApKTtcbiAgICAgICAgYXBwLnNldHRpbmdzID0gYXBwLmNvbnRyb2xzLmN1cnJlbnRTZXR0aW5ncygpO1xuICAgICAgICBhcHAuZ3JhcGhpY3MgPSBHcmFwaGljcy5jcmVhdGUoY2FudmFzKTtcbiAgICAgICAgYXBwLmZpdG5lc3NGdW5jdGlvbiA9IHNvbWJyZXJvO1xuICAgICAgICBhcHAucnVubmluZyA9IGZhbHNlO1xuICAgICAgICBjYW52YXMuYWRkSG92ZXJUcmFja2luZ0Z1bmN0aW9uKGFwcC5fbG9nU2NyZWVuUG9zaXRpb24uYmluZChhcHApKTtcblxuICAgICAgICByZXR1cm4gYXBwO1xuICAgIH1cbn07XG5cblxuZXhwb3J0IHtBcHB9O1xuIiwiaW1wb3J0IHtWZWN0b3J9IGZyb20gJy4vdmVjdG9yJztcblxubGV0IHByb3RvID0ge1xuXG4gICAgY2xlYXJCYWNrZ3JvdW5kKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH0sXG5cbiAgICBmaWxsQ2lyY2xlKHBvcywgcmFkaXVzLCBjb2xvcikge1xuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHguYXJjKHBvcy54LCBwb3MueSwgcmFkaXVzLCAwLCAyKk1hdGguUEkpO1xuICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gY29sb3I7XG4gICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICB9LFxuXG4gICAgZHJhd0xpbmUocDEsIHAyLCBjb2xvcikge1xuICAgICAgICB0aGlzLmRyYXdMaW5lcyhbcDEsIHAyXSwgY29sb3IpO1xuICAgIH0sXG5cbiAgICBkcmF3TGluZXMocG9pbnRzLCBjb2xvcikge1xuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoLTE7IGkrKykge1xuICAgICAgICAgICAgbGV0IHAxID0gcG9pbnRzW2ldLFxuICAgICAgICAgICAgICAgIHAyID0gcG9pbnRzW2krMV07XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8ocDEueCwgcDEueSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8ocDIueCwgcDIueSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICB9LFxuXG4gICAgZHJhd0Nyb3NzKHBvcywgc2l6ZSwgY29sb3IpIHtcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhwb3MueC1zaXplLzIsIHBvcy55KTtcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHBvcy54K3NpemUvMiwgcG9zLnkpO1xuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8ocG9zLngsIHBvcy55LXNpemUvMik7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyhwb3MueCwgcG9zLnkrc2l6ZS8yKTtcbiAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgIH0sXG5cbiAgICBhZGRIb3ZlclRyYWNraW5nRnVuY3Rpb24oZnVuKSB7XG4gICAgICAgIHRoaXMuZG9tX2NhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZnVuKFZlY3Rvci5jcmVhdGUoe3g6IGV2ZW50Lm9mZnNldFgsIHk6IGV2ZW50Lm9mZnNldFl9KSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmxldCBDYW52YXMgPSB7XG4gICAgY3JlYXRlKGRvbV9jYW52YXMpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShwcm90byksIHtcbiAgICAgICAgICAgIGRvbV9jYW52YXM6IGRvbV9jYW52YXMsXG4gICAgICAgICAgICBjdHg6IGRvbV9jYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgICAgICAgIHdpZHRoOiBkb21fY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBkb21fY2FudmFzLmhlaWdodFxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5cbmV4cG9ydCB7Q2FudmFzfTtcbiIsImxldCBpbnB1dHMgPSB7XG4gICAgICAgIG51bWJlck9mUGFydGljbGVzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbnVtYmVyT2ZQYXJ0aWNsZXMnKSxcbiAgICAgICAgYzE6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjMScpLFxuICAgICAgICBjMjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2MyJyksXG4gICAgICAgIGs6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdrJyksXG4gICAgICAgIGR0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZHQnKSxcbiAgICAgICAgbWF4SXRlcmF0aW9uczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21heEl0ZXJhdGlvbnMnKSxcbiAgICAgICAgc2hvd0dCZXN0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd0dCZXN0JyksXG4gICAgICAgIHNob3dQQmVzdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3dQQmVzdCcpLFxuICAgICAgICBzaG93VHJhY2U6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaG93VHJhY2UnKSxcbiAgICAgICAgc2hvd1ZlbG9jaXR5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd1ZlbG9jaXR5JylcbiAgICB9LFxuICAgIGJ1dHRvbnMgPSB7XG4gICAgICAgIHJ1bjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpLFxuICAgICAgICBzdGVwOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RlcEJ1dHRvbicpXG4gICAgfVxuXG5mdW5jdGlvbiBpbnRWYWx1ZShmaWVsZCkge1xuICAgIHJldHVybiBOdW1iZXIucGFyc2VJbnQoZmllbGQudmFsdWUpO1xufVxuXG5mdW5jdGlvbiBmbG9hdFZhbHVlKGZpZWxkKSB7XG4gICAgcmV0dXJuIE51bWJlci5wYXJzZUZsb2F0KGZpZWxkLnZhbHVlKTtcbn1cblxubGV0IHByb3RvID0ge1xuICAgIGNoYW5nZWQoKSB7XG4gICAgICAgIHRoaXMuY2hhbmdlU2V0dGluZ3ModGhpcy5jdXJyZW50U2V0dGluZ3MoKSk7XG4gICAgfSxcblxuICAgIGN1cnJlbnRTZXR0aW5ncygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG51bU9mUGFydGljbGVzOiBpbnRWYWx1ZShpbnB1dHMubnVtYmVyT2ZQYXJ0aWNsZXMpLFxuICAgICAgICAgICAgYzE6IGZsb2F0VmFsdWUoaW5wdXRzLmMxKSxcbiAgICAgICAgICAgIGMyOiBmbG9hdFZhbHVlKGlucHV0cy5jMiksXG4gICAgICAgICAgICBrOiBmbG9hdFZhbHVlKGlucHV0cy5rKSxcbiAgICAgICAgICAgIGR0OiBmbG9hdFZhbHVlKGlucHV0cy5kdCksXG4gICAgICAgICAgICBtYXhJdGVyYXRpb25zOiBpbnRWYWx1ZShpbnB1dHMubWF4SXRlcmF0aW9ucyksXG4gICAgICAgICAgICBzaG93R0Jlc3Q6IGlucHV0cy5zaG93R0Jlc3QuY2hlY2tlZCxcbiAgICAgICAgICAgIHNob3dQQmVzdDogaW5wdXRzLnNob3dQQmVzdC5jaGVja2VkLFxuICAgICAgICAgICAgc2hvd1RyYWNlOiBpbnB1dHMuc2hvd1RyYWNlLmNoZWNrZWQsXG4gICAgICAgICAgICBzaG93VmVsb2NpdHk6IGlucHV0cy5zaG93VmVsb2NpdHkuY2hlY2tlZFxuICAgICAgICB9O1xuICAgIH1cbn07XG5cbmxldCBDb250cm9scyA9IHtcbiAgICBjcmVhdGUoY2hhbmdlU2V0dGluZ3MsIHJ1biwgc3RlcCkge1xuICAgICAgICBsZXQgYyA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICAgICAgICBjLmNoYW5nZVNldHRpbmdzID0gY2hhbmdlU2V0dGluZ3M7XG5cbiAgICAgICAgT2JqZWN0LmtleXMoaW5wdXRzKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICAgICAgaW5wdXRzW2tdLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGMuY2hhbmdlZC5iaW5kKGMpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYnV0dG9ucy5ydW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBydW4pO1xuICAgICAgICBidXR0b25zLnN0ZXAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzdGVwKTtcblxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG59O1xuXG5cbmV4cG9ydCB7Q29udHJvbHN9O1xuIiwiaW1wb3J0IHtWZWN0b3J9IGZyb20gJy4vdmVjdG9yJztcbmltcG9ydCB7VXRpbHN9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtQYXJ0aWNsZX0gZnJvbSAnLi9wYXJ0aWNsZSc7XG5cbmxldCBwcm90byA9IHtcblxuICAgIHJhbmRvbVBhcnRpY2xlKCkge1xuICAgICAgICByZXR1cm4gUGFydGljbGUuY3JlYXRlKHRoaXMuX3JhbmRvbVBvc2l0aW9uKCksIFZlY3Rvci5PUklHSU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbHMucmFuZENvbG9yKCkpO1xuICAgIH0sXG5cbiAgICB0b1NjcmVlbkNvb3JkaW5hdGVzKHBvcykge1xuICAgICAgICBsZXQgeCA9IFV0aWxzLmludGVycG9sYXRlKHBvcy54LCB0aGlzLm1pblgsIHRoaXMubWF4WCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCwgdGhpcy5jYW52YXMud2lkdGgpLFxuICAgICAgICAgICAgeSA9IFV0aWxzLmludGVycG9sYXRlKHBvcy55LCB0aGlzLm1pblksIHRoaXMubWF4WSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgcmV0dXJuIFZlY3Rvci5jcmVhdGUoe3g6IHgsIHk6IHl9KTtcbiAgICB9LFxuXG4gICAgZnJvbVNjcmVlbkNvb3JkaW5hdGVzKHNjcmVlblBvcykge1xuICAgICAgICBsZXQgeCA9IFV0aWxzLmludGVycG9sYXRlKHNjcmVlblBvcy54LCAwLCB0aGlzLmNhbnZhcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5YLCB0aGlzLm1heFgpLFxuICAgICAgICAgICAgeSA9IFV0aWxzLmludGVycG9sYXRlKHNjcmVlblBvcy55LCAwLCB0aGlzLmNhbnZhcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWluWSwgdGhpcy5tYXhZKTtcbiAgICAgICAgcmV0dXJuIFZlY3Rvci5jcmVhdGUoe3g6IHgsIHk6IHl9KTtcbiAgICB9LFxuXG4gICAgZHJhd0JhY2tncm91bmQoKSB7XG4gICAgICAgIHRoaXMuY2FudmFzLmNsZWFyQmFja2dyb3VuZCgpO1xuICAgICAgICB0aGlzLl9kcmF3R3JpZCgpO1xuICAgIH0sXG5cbiAgICBkcmF3R0Jlc3QoZ0Jlc3QpIHtcbiAgICAgICAgdGhpcy5jYW52YXMuZHJhd0Nyb3NzKHRoaXMudG9TY3JlZW5Db29yZGluYXRlcyhnQmVzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHcmFwaGljcy5nQmVzdENyb3NzU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdyYXBoaWNzLmdCZXN0Q3Jvc3NDb2xvcik7XG4gICAgfSxcblxuICAgIGRyYXdQYXJ0aWNsZShwYXJ0aWNsZSkge1xuICAgICAgICB0aGlzLmNhbnZhcy5maWxsQ2lyY2xlKHRoaXMudG9TY3JlZW5Db29yZGluYXRlcyhwYXJ0aWNsZS5wb3MpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdyYXBoaWNzLnBhcnRpY2xlU2l6ZSwgcGFydGljbGUuY29sb3IpO1xuICAgIH0sXG5cbiAgICBkcmF3VHJhY2UocGFydGljbGUpIHtcbiAgICAgICAgbGV0IHBvaW50cyA9IHBhcnRpY2xlLnBvc0hpc3RvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCh0aGlzLnRvU2NyZWVuQ29vcmRpbmF0ZXMuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuY2FudmFzLmRyYXdMaW5lcyhwb2ludHMsIHBhcnRpY2xlLmNvbG9yKTtcbiAgICB9LFxuXG4gICAgZHJhd1ZlbG9jaXR5KHBhcnRpY2xlKSB7XG4gICAgICAgIGxldCBmcm9tID0gdGhpcy50b1NjcmVlbkNvb3JkaW5hdGVzKHBhcnRpY2xlLnBvcyksXG4gICAgICAgICAgICB0byA9IHRoaXMudG9TY3JlZW5Db29yZGluYXRlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZS5wb3MuYWRkKHBhcnRpY2xlLnZlbC5zY2FsZSgwLjEpKSk7XG4gICAgICAgIHRoaXMuY2FudmFzLmRyYXdMaW5lKGZyb20sIHRvLCAnZGFya2dyYXknKTtcbiAgICB9LFxuXG4gICAgZHJhd1BCZXN0KHBhcnRpY2xlKSB7XG4gICAgICAgIHRoaXMuY2FudmFzLmRyYXdDcm9zcyh0aGlzLnRvU2NyZWVuQ29vcmRpbmF0ZXMocGFydGljbGUucEJlc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR3JhcGhpY3MucEJlc3RDcm9zc1NpemUsIHBhcnRpY2xlLmNvbG9yKTtcbiAgICB9LFxuXG4gICAgX2RyYXdHcmlkKCkge1xuICAgICAgICB0aGlzLmNhbnZhcy5kcmF3TGluZSh7eDogdGhpcy5jYW52YXMud2lkdGgvMiwgeTogMH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt4OiB0aGlzLmNhbnZhcy53aWR0aC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5jYW52YXMuaGVpZ2h0fSAsICd3aGl0ZScpO1xuICAgICAgICB0aGlzLmNhbnZhcy5kcmF3TGluZSh7eDogMCwgeTogdGhpcy5jYW52YXMuaGVpZ2h0LzJ9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eDogdGhpcy5jYW52YXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLmNhbnZhcy5oZWlnaHQvMn0sICd3aGl0ZScpO1xuICAgIH0sXG5cbiAgICBfcmFuZG9tUG9zaXRpb24oKSB7XG4gICAgICAgIHJldHVybiBWZWN0b3IuY3JlYXRlKHt4OiBVdGlscy5yYW5kKHRoaXMubWluWCwgdGhpcy5tYXhYKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IFV0aWxzLnJhbmQodGhpcy5taW5ZLCB0aGlzLm1heFkpfSk7XG4gICAgfVxufTtcblxubGV0IEdyYXBoaWNzID0ge1xuICAgIGNyZWF0ZShjYW52YXMpIHtcbiAgICAgICAgbGV0IGcgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgICAgICAgZy5jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIGcubWluWCA9IC0xMjtcbiAgICAgICAgZy5tYXhYID0gLWcubWluWDtcbiAgICAgICAgZy5taW5ZID0gZy5taW5YICogY2FudmFzLmhlaWdodC9jYW52YXMud2lkdGg7XG4gICAgICAgIGcubWF4WSA9IC1nLm1pblk7XG4gICAgICAgIGcueFNwYW4gPSBnLm1heFggLSBnLm1pblg7XG4gICAgICAgIGcueVNwYW4gPSBnLm1heFkgLSBnLm1pblk7XG5cbiAgICAgICAgcmV0dXJuIGc7XG4gICAgfVxufTtcblxuR3JhcGhpY3MucGFydGljbGVTaXplID0gMjtcbkdyYXBoaWNzLmdCZXN0Q3Jvc3NDb2xvciA9ICdibGFjayc7XG5HcmFwaGljcy5nQmVzdENyb3NzU2l6ZSA9IDIwO1xuR3JhcGhpY3MucEJlc3RDcm9zc1NpemUgPSAxMDtcblxuXG5leHBvcnQge0dyYXBoaWNzfTtcbiIsImxldCBvdXRwdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0Jyk7XG5cbmxldCBMb2dnZXIgPSB7XG5cbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIG91dHB1dC50ZXh0Q29udGVudCA9ICcnO1xuICAgIH0sXG5cbiAgICBzZXRUZXh0OiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIG91dHB1dC50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgfVxufTtcblxuZXhwb3J0IHtMb2dnZXJ9O1xuIiwiaW1wb3J0IHtDYW52YXN9IGZyb20gJy4vY2FudmFzJztcbmltcG9ydCB7QXBwfSBmcm9tICcuL2FwcCc7XG5cbmxldCBjYW52YXMgPSBDYW52YXMuY3JlYXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkcmF3aW5nLWNhbnZhcycpKSxcbiAgICBhcHAgPSBBcHAuY3JlYXRlKGNhbnZhcyk7XG5hcHAuaW5pdCgpO1xuIiwiXG5sZXQgcHJvdG8gPSB7XG4gICAgbW92ZShkdCkge1xuICAgICAgICB0aGlzLnBvcyA9IHRoaXMucG9zLmFkZCh0aGlzLnZlbC5zY2FsZShkdCkpO1xuICAgICAgICB0aGlzLnBvc0hpc3RvcnkucHVzaCh0aGlzLnBvcyk7XG4gICAgfVxufTtcblxubGV0IFBhcnRpY2xlID0ge1xuICAgIGNyZWF0ZShwb3MsIHZlbCwgY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShwcm90byksIHtcbiAgICAgICAgICAgIHBvczogcG9zLFxuICAgICAgICAgICAgdmVsOiB2ZWwsXG4gICAgICAgICAgICBwb3NIaXN0b3J5OiBbcG9zXSxcbiAgICAgICAgICAgIHBCZXN0OiBwb3MsXG4gICAgICAgICAgICBjb2xvcjogY29sb3JcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuXG5leHBvcnQge1BhcnRpY2xlfTtcbiIsImltcG9ydCB7VXRpbHN9IGZyb20gJy4vdXRpbHMnO1xuXG5sZXQgcHJvdG8gPSB7XG5cbiAgICB1cGRhdGUoc2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgIHAubW92ZShzZXR0aW5ncy5kdCk7XG4gICAgICAgICAgICBwLnBCZXN0ID0gdGhpcy5fZml0dGVzdFBvc2l0aW9uKFtwLnBCZXN0LCBwLnBvc10pO1xuICAgICAgICAgICAgcC52ZWwgPSB0aGlzLl9uZXdWZWxvY2l0eShwLCB0aGlzLmdCZXN0LCBzZXR0aW5ncy5jMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuYzIsIHNldHRpbmdzLmspO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5nQmVzdCA9IHRoaXMuX2NhbGN1bGF0ZUdCZXN0KCk7XG4gICAgfSxcblxuICAgIF9jYWxjdWxhdGVHQmVzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpdHRlc3RQb3NpdGlvbih0aGlzLnBhcnRpY2xlcy5tYXAoVXRpbHMuYWNjZXNzb3IoJ3BCZXN0JykpKTtcbiAgICB9LFxuXG4gICAgX2ZpdHRlc3RQb3NpdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLm1heEJ5KHBvc2l0aW9ucywgdGhpcy5maXRuZXNzRnVuY3Rpb24pO1xuICAgIH0sXG5cbiAgICBfbmV3VmVsb2NpdHkocGFydGljbGUsIGdCZXN0LCBjMSwgYzIsIGspIHtcbiAgICAgICAgbGV0IGdCZXN0Q29tcG9uZW50ID0gZ0Jlc3Quc3VidHJhY3QocGFydGljbGUucG9zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZShjMSpNYXRoLnJhbmRvbSgpKSxcbiAgICAgICAgICAgIHBCZXN0Q29tcG9uZW50ID0gcGFydGljbGUucEJlc3Quc3VidHJhY3QocGFydGljbGUucG9zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZShjMipNYXRoLnJhbmRvbSgpKTtcbiAgICAgICAgcmV0dXJuIHBhcnRpY2xlLnZlbC5zY2FsZShrKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZChnQmVzdENvbXBvbmVudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGQocEJlc3RDb21wb25lbnQpO1xuICAgIH1cbn07XG5cbmxldCBQU08gPSB7XG4gICAgY3JlYXRlKHBhcnRpY2xlcywgZml0bmVzc0Z1bmN0aW9uKSB7XG4gICAgICAgIGxldCBwc28gPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUocHJvdG8pLCB7XG4gICAgICAgICAgICBwYXJ0aWNsZXM6IHBhcnRpY2xlcyxcbiAgICAgICAgICAgIGZpdG5lc3NGdW5jdGlvbjogZml0bmVzc0Z1bmN0aW9uXG4gICAgICAgIH0pO1xuICAgICAgICBwc28uZ0Jlc3QgPSBwc28uX2NhbGN1bGF0ZUdCZXN0KCk7XG4gICAgICAgIHJldHVybiBwc287XG4gICAgfVxufTtcblxuXG5leHBvcnQge1BTT307XG4iLCJsZXQgZmZmZmZmID0gTnVtYmVyLnBhcnNlSW50KCdmZmZmZmYnLCAxNik7XG5cbmxldCBVdGlscyA9IHtcblxuICAgIHJhbmQ6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiBtaW4gKyBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbik7XG4gICAgfSxcblxuICAgIHJhbmRDb2xvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnIycgK1xuICAgICAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmZmZmZmZikudG9TdHJpbmcoMTYpO1xuICAgIH0sXG5cbiAgICBpbml0QXJyYXk6IGZ1bmN0aW9uKHNpemUsIGdlbmVyYXRvcikge1xuICAgICAgICBsZXQgYXJyYXkgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGFycmF5LnB1c2goZ2VuZXJhdG9yKCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9LFxuXG4gICAgbWF4Qnk6IGZ1bmN0aW9uKGl0ZW1zLCB0cmFuc2Zvcm0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1zLm1hcChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICByZXR1cm4ge2l0ZW06IGksIHZhbHVlOiB0cmFuc2Zvcm0oaSl9O1xuICAgICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24oYmVzdCwgY3VycmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIChjdXJyZW50LnZhbHVlID4gYmVzdC52YWx1ZSkgPyBjdXJyZW50IDogYmVzdDtcbiAgICAgICAgfSkuaXRlbTtcbiAgICB9LFxuXG4gICAgaW50ZXJwb2xhdGU6IGZ1bmN0aW9uKHZhbHVlLCBvbGRNaW4sIG9sZE1heCwgbmV3TWluLCBuZXdNYXgpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gKHZhbHVlIC0gb2xkTWluKSAvIChvbGRNYXggLSBvbGRNaW4pO1xuICAgICAgICByZXR1cm4gbmV3TWluICsgcmF0aW8gKiAobmV3TWF4IC0gbmV3TWluKTtcbiAgICB9LFxuXG4gICAgYWNjZXNzb3I6IGZ1bmN0aW9uKHByb3BOYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpdGVtKSB7IHJldHVybiBpdGVtW3Byb3BOYW1lXTsgfTtcbiAgICB9XG59O1xuXG5leHBvcnQge1V0aWxzfTtcbiIsImxldCBwcm90byA9IHtcblxuICAgIGFkZChvdGhlcikge1xuICAgICAgICByZXR1cm4gVmVjdG9yLmNyZWF0ZSh7eDogdGhpcy54ICsgb3RoZXIueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHRoaXMueSArIG90aGVyLnl9KTtcbiAgICB9LFxuXG4gICAgc3VidHJhY3Qob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIFZlY3Rvci5jcmVhdGUoe3g6IHRoaXMueCAtIG90aGVyLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLnkgLSBvdGhlci55fSk7XG4gICAgfSxcblxuICAgIHNjYWxlKGZhY3Rvcikge1xuICAgICAgICByZXR1cm4gVmVjdG9yLmNyZWF0ZSh7eDogZmFjdG9yICogdGhpcy54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogZmFjdG9yICogdGhpcy55fSk7XG4gICAgfSxcblxuICAgIHNxdWFyZURpc3RhbmNlKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyh0aGlzLnggLSBvdGhlci54LCAyKSArXG4gICAgICAgICAgICAgICAgIE1hdGgucG93KHRoaXMueSAtIG90aGVyLnksIDIpO1xuICAgIH0sXG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICcoJyArIHRoaXMueC50b0ZpeGVkKDIpICsgJywgJyArIHRoaXMueS50b0ZpeGVkKDIpICsgJyknO1xuICAgIH1cbn07XG5cbmxldCBWZWN0b3IgPSB7XG4gICAgY3JlYXRlKGNvb3Jkcykge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKHByb3RvKSwge1xuICAgICAgICAgICAgeDogY29vcmRzLngsXG4gICAgICAgICAgICB5OiBjb29yZHMueVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5WZWN0b3IuT1JJR0lOID0gVmVjdG9yLmNyZWF0ZSh7eDogMCwgeTogMH0pO1xuXG5cbmV4cG9ydCB7VmVjdG9yfTtcbiJdfQ==
