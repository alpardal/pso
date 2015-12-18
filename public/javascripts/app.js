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
            _this.drawTrace(p);
            _this.drawVelocity(p);
            _this.drawPBest(p);
        });

        this.drawGBest(this.pso.gBest);
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
        this.drawTrace = settings.showTrace ? this.graphics.drawTrace.bind(this.graphics) : _utils.Utils.doNothing;
        this.drawVelocity = settings.showVelocity ? this.graphics.drawVelocity.bind(this.graphics) : _utils.Utils.doNothing;
        this.drawPBest = settings.showPBest ? this.graphics.drawPBest.bind(this.graphics) : _utils.Utils.doNothing;

        this.drawGBest = settings.showGBest ? this.graphics.drawGBest.bind(this.graphics) : _utils.Utils.doNothing;
    }
};

var App = {
    create: function create(canvas) {
        var app = Object.create(proto);
        app.controls = _controls.Controls.create(app._settingsChanged.bind(app), app.run.bind(app), app.step.bind(app));
        app.graphics = _graphics.Graphics.create(canvas);
        app.fitnessFunction = sombrero;
        app.running = false;
        app.controls.changed();
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

function newVelocity(particle, gBest, c1, c2, k) {
    var gBestComponent = gBest.subtract(particle.pos).scale(c1 * Math.random()),
        pBestComponent = particle.pBest.subtract(particle.pos).scale(c2 * Math.random());
    return particle.vel.scale(k).add(gBestComponent).add(pBestComponent);
}

var proto = {

    update: function update(settings) {
        var _this = this;

        this.particles.forEach(function (p) {
            p.move(settings.dt);
            p.pBest = _this.selectFittestPosition([p.pBest, p.pos]);
            p.vel = newVelocity(p, _this.gBest, settings.c1, settings.c2, settings.k);
        });
        this.gBest = this.calculateGBest();
    },

    calculateGBest: function calculateGBest() {
        return this.selectFittestPosition(this.particles.map(function (p) {
            return p.pBest;
        }));
    }
};

var PSO = {
    create: function create(particles, fitnessFunction) {
        var pso = Object.assign(Object.create(proto), {
            particles: particles,
            fitnessFunction: fitnessFunction
        });
        pso.selectFittestPosition = _utils.Utils.maxBy.bind(null, fitnessFunction);
        pso.gBest = pso.calculateGBest();
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

    maxBy: function maxBy(transform, items) {
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

    doNothing: function doNothing() {}
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvYXBwLmpzIiwiL2hvbWUvYW5kcmUvY29kZS9wc28vYXBwL2NhbnZhcy5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9jb250cm9scy5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9ncmFwaGljcy5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9sb2dnZXIuanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvbWFpbi5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9wYXJ0aWNsZS5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9wc28uanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvdXRpbHMuanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvdmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozt3QkNBdUIsWUFBWTs7d0JBQ1osWUFBWTs7cUJBQ2YsU0FBUzs7bUJBQ1gsT0FBTzs7c0JBQ0osVUFBVTs7QUFFL0IsU0FBUyxRQUFRLENBQUMsUUFBUSxFQUFFO0FBQ3hCLFFBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDNUIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUNqQyxXQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFDO0NBQzNEOztBQUVELElBQUksS0FBSyxHQUFHOztBQUVSLFFBQUksRUFBQSxnQkFBRztBQUNILFlBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNkLFlBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNoQjs7QUFFRCxVQUFNLEVBQUEsa0JBQUc7QUFDTCxZQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFlBQUksU0FBUyxHQUFHLGFBQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDbEYsWUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZELHVCQUFPLEtBQUssRUFBRSxDQUFDO0tBQ2xCOztBQUVELE9BQUcsRUFBQSxlQUFHO0FBQ0YsWUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRTtBQUFFLGdCQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FBRTtBQUNwRCxZQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFBRSxnQkFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQUU7QUFDcEMsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7S0FDdkI7O0FBRUQsUUFBSSxFQUFBLGdCQUFHO0FBQ0gsWUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRTtBQUFFLGdCQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FBRTtBQUNwRCxZQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixZQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbEI7O0FBRUQsU0FBSyxFQUFBLGlCQUFHO0FBQ0osWUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVmLFlBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNkLGdCQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDbEI7O0FBRUQsWUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBQztBQUM3QixnQkFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7U0FDeEI7O0FBRUQsY0FBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDdkQ7O0FBRUQseUJBQXFCLEVBQUEsaUNBQUc7QUFDcEIsZUFBTyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7S0FDL0Q7O0FBRUQsV0FBTyxFQUFBLG1CQUFHO0FBQ04sWUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDekIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUNwQjs7QUFFRCxXQUFPLEVBQUEsbUJBQUc7OztBQUNOLFlBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRS9CLFlBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsRUFBSTtBQUM1QixrQkFBSyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLGtCQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixrQkFBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsa0JBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JCLENBQUMsQ0FBQzs7QUFFSCxZQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbEM7O0FBRUQsYUFBUyxFQUFBLHFCQUFHO0FBQ1IsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pELHVCQUFPLE9BQU8sQ0FBQyx5QkFBdUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsYUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDO0tBQzlCOztBQUVELHNCQUFrQixFQUFBLDRCQUFDLFNBQVMsRUFBRTtBQUMxQixZQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pELGVBQU8sQ0FBQyxHQUFHLENBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQU0sR0FBRyxDQUFHLENBQUM7S0FDbkU7O0FBRUQsb0JBQWdCLEVBQUEsMEJBQUMsUUFBUSxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsR0FDZixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUMzQyxhQUFNLFNBQVMsQ0FBQztBQUNwQyxZQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxZQUFZLEdBQ2pCLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQzlDLGFBQU0sU0FBUyxDQUFDO0FBQ3hDLFlBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsR0FDZixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUMzQyxhQUFNLFNBQVMsQ0FBQzs7QUFFcEMsWUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxHQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQzNDLGFBQU0sU0FBUyxDQUFDO0tBQ3ZDO0NBQ0osQ0FBQzs7QUFFRixJQUFJLEdBQUcsR0FBRztBQUNOLFVBQU0sRUFBQSxnQkFBQyxNQUFNLEVBQUU7QUFDWCxZQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9CLFdBQUcsQ0FBQyxRQUFRLEdBQUcsbUJBQVMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQzlCLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNqQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ25ELFdBQUcsQ0FBQyxRQUFRLEdBQUcsbUJBQVMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZDLFdBQUcsQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDO0FBQy9CLFdBQUcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsY0FBTSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFbEUsZUFBTyxHQUFHLENBQUM7S0FDZDtDQUNKLENBQUM7O1FBR00sR0FBRyxHQUFILEdBQUc7Ozs7Ozs7c0JDMUhVLFVBQVU7O0FBRS9CLElBQUksS0FBSyxHQUFHOztBQUVSLG1CQUFlLEVBQUEsMkJBQUc7QUFDZCxZQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3JEOztBQUVELGNBQVUsRUFBQSxvQkFBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTtBQUMzQixZQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakQsWUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDM0IsWUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNuQjs7QUFFRCxZQUFRLEVBQUEsa0JBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDcEIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNuQzs7QUFFRCxhQUFTLEVBQUEsbUJBQUMsTUFBTSxFQUFFLEtBQUssRUFBRTtBQUNyQixZQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRXJCLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN0QyxnQkFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDZCxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixnQkFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsZ0JBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQy9COztBQUVELFlBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUM3QixZQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3JCOztBQUVELGFBQVMsRUFBQSxtQkFBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUN4QixZQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsSUFBSSxHQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsWUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxJQUFJLEdBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxZQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLFlBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsWUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDN0IsWUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNyQjs7QUFFRCw0QkFBd0IsRUFBQSxrQ0FBQyxHQUFHLEVBQUU7QUFDMUIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsVUFBQSxLQUFLLEVBQUk7QUFDbkQsZUFBRyxDQUFDLGVBQU8sTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLENBQUM7U0FDNUQsQ0FBQyxDQUFDO0tBQ047Q0FDSixDQUFDOztBQUVGLElBQUksTUFBTSxHQUFHO0FBQ1QsVUFBTSxFQUFBLGdCQUFDLFVBQVUsRUFBRTtBQUNmLGVBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3ZDLHNCQUFVLEVBQUUsVUFBVTtBQUN0QixlQUFHLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFDaEMsaUJBQUssRUFBRSxVQUFVLENBQUMsS0FBSztBQUN2QixrQkFBTSxFQUFFLFVBQVUsQ0FBQyxNQUFNO1NBQzVCLENBQUMsQ0FBQztLQUNOO0NBQ0osQ0FBQzs7UUFHTSxNQUFNLEdBQU4sTUFBTTs7Ozs7O0FDakVkLElBQUksTUFBTSxHQUFHO0FBQ0wscUJBQWlCLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQztBQUMvRCxNQUFFLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7QUFDakMsTUFBRSxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO0FBQ2pDLEtBQUMsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQztBQUMvQixNQUFFLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7QUFDakMsaUJBQWEsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQztBQUN2RCxhQUFTLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7QUFDL0MsYUFBUyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO0FBQy9DLGFBQVMsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQztBQUMvQyxnQkFBWSxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDO0NBQ3hEO0lBQ0QsT0FBTyxHQUFHO0FBQ04sT0FBRyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO0FBQ3pDLFFBQUksRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQztDQUM5QyxDQUFBOztBQUVMLFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRTtBQUNyQixXQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ3ZDOztBQUVELFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRTtBQUN2QixXQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ3pDOztBQUVELElBQUksS0FBSyxHQUFHO0FBQ1IsV0FBTyxFQUFBLG1CQUFHO0FBQ04sWUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztLQUMvQzs7QUFFRCxtQkFBZSxFQUFBLDJCQUFHO0FBQ2QsZUFBTztBQUNILDBCQUFjLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztBQUNsRCxjQUFFLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7QUFDekIsY0FBRSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQ3pCLGFBQUMsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN2QixjQUFFLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7QUFDekIseUJBQWEsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUM3QyxxQkFBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTztBQUNuQyxxQkFBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTztBQUNuQyxxQkFBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTztBQUNuQyx3QkFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTztTQUM1QyxDQUFDO0tBQ0w7Q0FDSixDQUFDOztBQUVGLElBQUksUUFBUSxHQUFHO0FBQ1gsVUFBTSxFQUFBLGdCQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQzlCLFlBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsU0FBQyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7O0FBRWxDLGNBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxFQUFJO0FBQzdCLGtCQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDM0QsQ0FBQyxDQUFDOztBQUVILGVBQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLGVBQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUU3QyxlQUFPLENBQUMsQ0FBQztLQUNaO0NBQ0osQ0FBQzs7UUFHTSxRQUFRLEdBQVIsUUFBUTs7Ozs7OztzQkMvREssVUFBVTs7cUJBQ1gsU0FBUzs7d0JBQ04sWUFBWTs7QUFFbkMsSUFBSSxLQUFLLEdBQUc7O0FBRVIsa0JBQWMsRUFBQSwwQkFBRztBQUNiLGVBQU8sbUJBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxlQUFPLE1BQU0sRUFDckMsYUFBTSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0tBQzdDOztBQUVELHVCQUFtQixFQUFBLDZCQUFDLEdBQUcsRUFBRTtBQUNyQixZQUFJLENBQUMsR0FBRyxhQUFNLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFDcEIsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ2xELENBQUMsR0FBRyxhQUFNLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFDcEIsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEQsZUFBTyxlQUFPLE1BQU0sQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDdEM7O0FBRUQseUJBQXFCLEVBQUEsK0JBQUMsU0FBUyxFQUFFO0FBQzdCLFlBQUksQ0FBQyxHQUFHLGFBQU0sV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUNwQixJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDeEQsQ0FBQyxHQUFHLGFBQU0sV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUNyQixJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3RCxlQUFPLGVBQU8sTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUN0Qzs7QUFFRCxrQkFBYyxFQUFBLDBCQUFHO0FBQ2IsWUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUM5QixZQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDcEI7O0FBRUQsYUFBUyxFQUFBLG1CQUFDLEtBQUssRUFBRTtBQUNiLFlBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsRUFDL0IsUUFBUSxDQUFDLGNBQWMsRUFDdkIsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ25EOztBQUVELGdCQUFZLEVBQUEsc0JBQUMsUUFBUSxFQUFFO0FBQ25CLFlBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQ3RDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2pFOztBQUVELGFBQVMsRUFBQSxtQkFBQyxRQUFRLEVBQUU7QUFDaEIsWUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FDVixHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9ELFlBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDakQ7O0FBRUQsZ0JBQVksRUFBQSxzQkFBQyxRQUFRLEVBQUU7QUFDbkIsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFDN0MsRUFBRSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FDYixRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0QsWUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUM5Qzs7QUFFRCxhQUFTLEVBQUEsbUJBQUMsUUFBUSxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQ3hDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2xFOztBQUVELGFBQVMsRUFBQSxxQkFBRztBQUNSLFlBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQzlCLEVBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLENBQUM7QUFDdEIsYUFBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDLEVBQUcsT0FBTyxDQUFDLENBQUM7QUFDeEQsWUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUMsRUFDL0IsRUFBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO0FBQ3BCLGFBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUM1RDs7QUFFRCxtQkFBZSxFQUFBLDJCQUFHO0FBQ2QsZUFBTyxlQUFPLE1BQU0sQ0FBQyxFQUFDLENBQUMsRUFBRSxhQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDbkMsYUFBQyxFQUFFLGFBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUMvRDtDQUNKLENBQUM7O0FBRUYsSUFBSSxRQUFRLEdBQUc7QUFDWCxVQUFNLEVBQUEsZ0JBQUMsTUFBTSxFQUFFO0FBQ1gsWUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixTQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNsQixTQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ2IsU0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDakIsU0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM3QyxTQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNqQixTQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUMxQixTQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQzs7QUFFMUIsZUFBTyxDQUFDLENBQUM7S0FDWjtDQUNKLENBQUM7O0FBRUYsUUFBUSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDMUIsUUFBUSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUM7QUFDbkMsUUFBUSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDN0IsUUFBUSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7O1FBR3JCLFFBQVEsR0FBUixRQUFROzs7Ozs7QUNqR2hCLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRS9DLElBQUksTUFBTSxHQUFHOztBQUVULFNBQUssRUFBQSxpQkFBRztBQUNKLGNBQU0sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0tBQzNCOztBQUVELFdBQU8sRUFBQSxpQkFBQyxJQUFJLEVBQUU7QUFDVixjQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztLQUM3QjtDQUNKLENBQUM7O1FBRU0sTUFBTSxHQUFOLE1BQU07Ozs7O3NCQ2JPLFVBQVU7O21CQUNiLE9BQU87O0FBRXpCLElBQUksTUFBTSxHQUFHLGVBQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNqRSxHQUFHLEdBQUcsU0FBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDOzs7Ozs7O0FDSlgsSUFBSSxLQUFLLEdBQUc7QUFDUixRQUFJLEVBQUEsY0FBQyxFQUFFLEVBQUU7QUFDTCxZQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUMsWUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2xDO0NBQ0osQ0FBQzs7QUFFRixJQUFJLFFBQVEsR0FBRztBQUNYLFVBQU0sRUFBQSxnQkFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUNwQixlQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN2QyxlQUFHLEVBQUUsR0FBRztBQUNSLGVBQUcsRUFBRSxHQUFHO0FBQ1Isc0JBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNqQixpQkFBSyxFQUFFLEdBQUc7QUFDVixpQkFBSyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7S0FDTjtDQUNKLENBQUM7O1FBR00sUUFBUSxHQUFSLFFBQVE7Ozs7Ozs7cUJDckJJLFNBQVM7O0FBRTdCLFNBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDN0MsUUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQ3RCLEtBQUssQ0FBQyxFQUFFLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzlDLGNBQWMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQ3RCLEtBQUssQ0FBQyxFQUFFLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDNUQsV0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLENBQUMsY0FBYyxDQUFDLENBQ25CLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUMzQzs7QUFFRCxJQUFJLEtBQUssR0FBRzs7QUFFUixVQUFNLEVBQUEsZ0JBQUMsUUFBUSxFQUFFOzs7QUFDYixZQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsRUFBSTtBQUN4QixhQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixhQUFDLENBQUMsS0FBSyxHQUFHLE1BQUsscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELGFBQUMsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUMsRUFBRSxNQUFLLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxFQUMxQixRQUFRLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoRCxDQUFDLENBQUM7QUFDSCxZQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUN0Qzs7QUFFRCxrQkFBYyxFQUFBLDBCQUFHO0FBQ2IsZUFBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO21CQUFJLENBQUMsQ0FBQyxLQUFLO1NBQUEsQ0FBQyxDQUFDLENBQUM7S0FDdkU7Q0FDSixDQUFDOztBQUVGLElBQUksR0FBRyxHQUFHO0FBQ04sVUFBTSxFQUFBLGdCQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUU7QUFDL0IsWUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzFDLHFCQUFTLEVBQUUsU0FBUztBQUNwQiwyQkFBZSxFQUFFLGVBQWU7U0FDbkMsQ0FBQyxDQUFDO0FBQ0gsV0FBRyxDQUFDLHFCQUFxQixHQUFHLGFBQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDcEUsV0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDakMsZUFBTyxHQUFHLENBQUM7S0FDZDtDQUNKLENBQUM7O1FBR00sR0FBRyxHQUFILEdBQUc7Ozs7OztBQzFDWCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFM0MsSUFBSSxLQUFLLEdBQUc7O0FBRVIsUUFBSSxFQUFBLGNBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUNYLGVBQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFBLEFBQUMsQ0FBQztLQUM1Qzs7QUFFRCxhQUFTLEVBQUEscUJBQUc7QUFDUixlQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDOUQ7O0FBRUQsYUFBUyxFQUFBLG1CQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7QUFDdkIsWUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2YsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQixpQkFBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQzNCO0FBQ0QsZUFBTyxLQUFLLENBQUM7S0FDaEI7O0FBRUQsU0FBSyxFQUFBLGVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRTtBQUNwQixlQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO21CQUNkLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO1NBQ2pDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsT0FBTzttQkFDcEIsQUFBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUksT0FBTyxHQUFHLElBQUk7U0FDaEQsQ0FBQyxDQUFDLElBQUksQ0FBQztLQUNYOztBQUVELGVBQVcsRUFBQSxxQkFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQy9DLFlBQUksS0FBSyxHQUFHLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQSxJQUFLLE1BQU0sR0FBRyxNQUFNLENBQUEsQUFBQyxDQUFDO0FBQ2pELGVBQU8sTUFBTSxHQUFHLEtBQUssSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFBLEFBQUMsQ0FBQztLQUM3Qzs7QUFFRCxhQUFTLEVBQUEscUJBQUcsRUFBRTtDQUNqQixDQUFDOztRQUdNLEtBQUssR0FBTCxLQUFLOzs7Ozs7QUNyQ2IsSUFBSSxLQUFLLEdBQUc7O0FBRVIsT0FBRyxFQUFBLGFBQUMsS0FBSyxFQUFFO0FBQ1AsZUFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDbkIsYUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDL0M7O0FBRUQsWUFBUSxFQUFBLGtCQUFDLEtBQUssRUFBRTtBQUNaLGVBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ25CLGFBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQy9DOztBQUVELFNBQUssRUFBQSxlQUFDLE1BQU0sRUFBRTtBQUNWLGVBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDbEIsYUFBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUM5Qzs7QUFFRCxrQkFBYyxFQUFBLHdCQUFDLEtBQUssRUFBRTtBQUNsQixlQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMxQzs7QUFFRCxZQUFRLEVBQUEsb0JBQUc7QUFDUCxlQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0tBQ25FO0NBQ0osQ0FBQzs7QUFFRixJQUFJLE1BQU0sR0FBRztBQUNULFVBQU0sRUFBQSxnQkFBQyxNQUFNLEVBQUU7QUFDWCxlQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN2QyxhQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDWCxhQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDZCxDQUFDLENBQUM7S0FDTjtDQUNKLENBQUM7O0FBRUYsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQzs7UUFHcEMsTUFBTSxHQUFOLE1BQU0iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtDb250cm9sc30gZnJvbSAnLi9jb250cm9scyc7XG5pbXBvcnQge0dyYXBoaWNzfSBmcm9tICcuL2dyYXBoaWNzJztcbmltcG9ydCB7VXRpbHN9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtQU099IGZyb20gJy4vcHNvJztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuL2xvZ2dlcic7XG5cbmZ1bmN0aW9uIHNvbWJyZXJvKHBvc2l0aW9uKSB7XG4gICAgbGV0IHgyID0gcG9zaXRpb24ueCAqIHBvc2l0aW9uLngsXG4gICAgICAgIHkyID0gcG9zaXRpb24ueSAqIHBvc2l0aW9uLnk7XG4gICAgcmV0dXJuIDYgKiBNYXRoLmNvcyhNYXRoLnNxcnQoeDIgKyB5MikpIC8gKHgyICsgeTIgKyA2KTtcbn1cblxubGV0IHByb3RvID0ge1xuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fcmVzZXQoKTtcbiAgICAgICAgdGhpcy5fbG9vcCgpO1xuICAgIH0sXG5cbiAgICBfcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudEl0ZXJhdGlvbnMgPSAwO1xuICAgICAgICBsZXQgcGFydGljbGVzID0gVXRpbHMuaW5pdEFycmF5KHRoaXMuc2V0dGluZ3MubnVtT2ZQYXJ0aWNsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5yYW5kb21QYXJ0aWNsZS5iaW5kKHRoaXMuZ3JhcGhpY3MpKTtcbiAgICAgICAgdGhpcy5wc28gPSBQU08uY3JlYXRlKHBhcnRpY2xlcywgdGhpcy5maXRuZXNzRnVuY3Rpb24pO1xuICAgICAgICBMb2dnZXIuY2xlYXIoKTtcbiAgICB9LFxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5fcmVhY2hlZE1heEl0ZXJhdGlvbnMoKSkgeyB0aGlzLl9yZXNldCgpOyB9XG4gICAgICAgIGlmICh0aGlzLnJ1bm5pbmcpIHsgdGhpcy5fcmVzZXQoKTsgfVxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIH0sXG5cbiAgICBzdGVwKCkge1xuICAgICAgICBpZiAodGhpcy5fcmVhY2hlZE1heEl0ZXJhdGlvbnMoKSkgeyB0aGlzLl9yZXNldCgpOyB9XG4gICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl91cGRhdGUoKTtcbiAgICB9LFxuXG4gICAgX2xvb3AoKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlcigpO1xuXG4gICAgICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlYWNoZWRNYXhJdGVyYXRpb25zKCkpe1xuICAgICAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX2xvb3AuYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIF9yZWFjaGVkTWF4SXRlcmF0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudEl0ZXJhdGlvbnMgPiB0aGlzLnNldHRpbmdzLm1heEl0ZXJhdGlvbnM7XG4gICAgfSxcblxuICAgIF91cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudEl0ZXJhdGlvbnMrKztcbiAgICAgICAgdGhpcy5wc28udXBkYXRlKHRoaXMuc2V0dGluZ3MpO1xuICAgICAgICB0aGlzLl9sb2dHQmVzdCgpO1xuICAgIH0sXG5cbiAgICBfcmVuZGVyKCkge1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmRyYXdCYWNrZ3JvdW5kKCk7XG5cbiAgICAgICAgdGhpcy5wc28ucGFydGljbGVzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmRyYXdQYXJ0aWNsZShwKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd1RyYWNlKHApO1xuICAgICAgICAgICAgdGhpcy5kcmF3VmVsb2NpdHkocCk7XG4gICAgICAgICAgICB0aGlzLmRyYXdQQmVzdChwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5kcmF3R0Jlc3QodGhpcy5wc28uZ0Jlc3QpO1xuICAgIH0sXG5cbiAgICBfbG9nR0Jlc3QoKSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZml0bmVzc0Z1bmN0aW9uKHRoaXMucHNvLmdCZXN0KTtcbiAgICAgICAgTG9nZ2VyLnNldFRleHQoYFZhbG9yIG3DoXhpbW8gYXR1YWw6ICR7dmFsdWUudG9GaXhlZCg1KX1gICtcbiAgICAgICAgICBgIGVtICR7dGhpcy5wc28uZ0Jlc3R9YCk7XG4gICAgfSxcblxuICAgIF9sb2dTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3MpIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuZ3JhcGhpY3MuZnJvbVNjcmVlbkNvb3JkaW5hdGVzKHNjcmVlblBvcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke3RoaXMuZml0bmVzc0Z1bmN0aW9uKHBvcykudG9GaXhlZCg1KX0gQCAke3Bvc31gKTtcbiAgICB9LFxuXG4gICAgX3NldHRpbmdzQ2hhbmdlZChzZXR0aW5ncykge1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgICAgIHRoaXMuZHJhd1RyYWNlID0gc2V0dGluZ3Muc2hvd1RyYWNlID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmRyYXdUcmFjZS5iaW5kKHRoaXMuZ3JhcGhpY3MpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlscy5kb05vdGhpbmc7XG4gICAgICAgIHRoaXMuZHJhd1ZlbG9jaXR5ID0gc2V0dGluZ3Muc2hvd1ZlbG9jaXR5ID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5kcmF3VmVsb2NpdHkuYmluZCh0aGlzLmdyYXBoaWNzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLmRvTm90aGluZztcbiAgICAgICAgdGhpcy5kcmF3UEJlc3QgPSBzZXR0aW5ncy5zaG93UEJlc3QgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuZHJhd1BCZXN0LmJpbmQodGhpcy5ncmFwaGljcykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLmRvTm90aGluZztcblxuICAgICAgICB0aGlzLmRyYXdHQmVzdCA9IHNldHRpbmdzLnNob3dHQmVzdCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5kcmF3R0Jlc3QuYmluZCh0aGlzLmdyYXBoaWNzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbHMuZG9Ob3RoaW5nO1xuICAgIH1cbn07XG5cbmxldCBBcHAgPSB7XG4gICAgY3JlYXRlKGNhbnZhcykge1xuICAgICAgICBsZXQgYXBwID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG4gICAgICAgIGFwcC5jb250cm9scyA9IENvbnRyb2xzLmNyZWF0ZShhcHAuX3NldHRpbmdzQ2hhbmdlZC5iaW5kKGFwcCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHAucnVuLmJpbmQoYXBwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5zdGVwLmJpbmQoYXBwKSk7XG4gICAgICAgIGFwcC5ncmFwaGljcyA9IEdyYXBoaWNzLmNyZWF0ZShjYW52YXMpO1xuICAgICAgICBhcHAuZml0bmVzc0Z1bmN0aW9uID0gc29tYnJlcm87XG4gICAgICAgIGFwcC5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIGFwcC5jb250cm9scy5jaGFuZ2VkKCk7XG4gICAgICAgIGNhbnZhcy5hZGRIb3ZlclRyYWNraW5nRnVuY3Rpb24oYXBwLl9sb2dTY3JlZW5Qb3NpdGlvbi5iaW5kKGFwcCkpO1xuXG4gICAgICAgIHJldHVybiBhcHA7XG4gICAgfVxufTtcblxuXG5leHBvcnQge0FwcH07XG4iLCJpbXBvcnQge1ZlY3Rvcn0gZnJvbSAnLi92ZWN0b3InO1xuXG5sZXQgcHJvdG8gPSB7XG5cbiAgICBjbGVhckJhY2tncm91bmQoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfSxcblxuICAgIGZpbGxDaXJjbGUocG9zLCByYWRpdXMsIGNvbG9yKSB7XG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5hcmMocG9zLngsIHBvcy55LCByYWRpdXMsIDAsIDIqTWF0aC5QSSk7XG4gICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xuICAgIH0sXG5cbiAgICBkcmF3TGluZShwMSwgcDIsIGNvbG9yKSB7XG4gICAgICAgIHRoaXMuZHJhd0xpbmVzKFtwMSwgcDJdLCBjb2xvcik7XG4gICAgfSxcblxuICAgIGRyYXdMaW5lcyhwb2ludHMsIGNvbG9yKSB7XG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGgtMTsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgcDEgPSBwb2ludHNbaV0sXG4gICAgICAgICAgICAgICAgcDIgPSBwb2ludHNbaSsxXTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhwMS54LCBwMS55KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhwMi54LCBwMi55KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgIH0sXG5cbiAgICBkcmF3Q3Jvc3MocG9zLCBzaXplLCBjb2xvcikge1xuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHBvcy54LXNpemUvMiwgcG9zLnkpO1xuICAgICAgICB0aGlzLmN0eC5saW5lVG8ocG9zLngrc2l6ZS8yLCBwb3MueSk7XG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhwb3MueCwgcG9zLnktc2l6ZS8yKTtcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHBvcy54LCBwb3MueStzaXplLzIpO1xuICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgfSxcblxuICAgIGFkZEhvdmVyVHJhY2tpbmdGdW5jdGlvbihmdW4pIHtcbiAgICAgICAgdGhpcy5kb21fY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGZ1bihWZWN0b3IuY3JlYXRlKHt4OiBldmVudC5vZmZzZXRYLCB5OiBldmVudC5vZmZzZXRZfSkpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5sZXQgQ2FudmFzID0ge1xuICAgIGNyZWF0ZShkb21fY2FudmFzKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUocHJvdG8pLCB7XG4gICAgICAgICAgICBkb21fY2FudmFzOiBkb21fY2FudmFzLFxuICAgICAgICAgICAgY3R4OiBkb21fY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgICAgICB3aWR0aDogZG9tX2NhbnZhcy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogZG9tX2NhbnZhcy5oZWlnaHRcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuXG5leHBvcnQge0NhbnZhc307XG4iLCJsZXQgaW5wdXRzID0ge1xuICAgICAgICBudW1iZXJPZlBhcnRpY2xlczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ251bWJlck9mUGFydGljbGVzJyksXG4gICAgICAgIGMxOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYzEnKSxcbiAgICAgICAgYzI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjMicpLFxuICAgICAgICBrOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaycpLFxuICAgICAgICBkdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R0JyksXG4gICAgICAgIG1heEl0ZXJhdGlvbnM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXhJdGVyYXRpb25zJyksXG4gICAgICAgIHNob3dHQmVzdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3dHQmVzdCcpLFxuICAgICAgICBzaG93UEJlc3Q6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaG93UEJlc3QnKSxcbiAgICAgICAgc2hvd1RyYWNlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd1RyYWNlJyksXG4gICAgICAgIHNob3dWZWxvY2l0eTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3dWZWxvY2l0eScpXG4gICAgfSxcbiAgICBidXR0b25zID0ge1xuICAgICAgICBydW46IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKSxcbiAgICAgICAgc3RlcDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0ZXBCdXR0b24nKVxuICAgIH1cblxuZnVuY3Rpb24gaW50VmFsdWUoZmllbGQpIHtcbiAgICByZXR1cm4gTnVtYmVyLnBhcnNlSW50KGZpZWxkLnZhbHVlKTtcbn1cblxuZnVuY3Rpb24gZmxvYXRWYWx1ZShmaWVsZCkge1xuICAgIHJldHVybiBOdW1iZXIucGFyc2VGbG9hdChmaWVsZC52YWx1ZSk7XG59XG5cbmxldCBwcm90byA9IHtcbiAgICBjaGFuZ2VkKCkge1xuICAgICAgICB0aGlzLmNoYW5nZVNldHRpbmdzKHRoaXMuY3VycmVudFNldHRpbmdzKCkpO1xuICAgIH0sXG5cbiAgICBjdXJyZW50U2V0dGluZ3MoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBudW1PZlBhcnRpY2xlczogaW50VmFsdWUoaW5wdXRzLm51bWJlck9mUGFydGljbGVzKSxcbiAgICAgICAgICAgIGMxOiBmbG9hdFZhbHVlKGlucHV0cy5jMSksXG4gICAgICAgICAgICBjMjogZmxvYXRWYWx1ZShpbnB1dHMuYzIpLFxuICAgICAgICAgICAgazogZmxvYXRWYWx1ZShpbnB1dHMuayksXG4gICAgICAgICAgICBkdDogZmxvYXRWYWx1ZShpbnB1dHMuZHQpLFxuICAgICAgICAgICAgbWF4SXRlcmF0aW9uczogaW50VmFsdWUoaW5wdXRzLm1heEl0ZXJhdGlvbnMpLFxuICAgICAgICAgICAgc2hvd0dCZXN0OiBpbnB1dHMuc2hvd0dCZXN0LmNoZWNrZWQsXG4gICAgICAgICAgICBzaG93UEJlc3Q6IGlucHV0cy5zaG93UEJlc3QuY2hlY2tlZCxcbiAgICAgICAgICAgIHNob3dUcmFjZTogaW5wdXRzLnNob3dUcmFjZS5jaGVja2VkLFxuICAgICAgICAgICAgc2hvd1ZlbG9jaXR5OiBpbnB1dHMuc2hvd1ZlbG9jaXR5LmNoZWNrZWRcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5sZXQgQ29udHJvbHMgPSB7XG4gICAgY3JlYXRlKGNoYW5nZVNldHRpbmdzLCBydW4sIHN0ZXApIHtcbiAgICAgICAgbGV0IGMgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgICAgICAgYy5jaGFuZ2VTZXR0aW5ncyA9IGNoYW5nZVNldHRpbmdzO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGlucHV0cykuZm9yRWFjaChrID0+IHtcbiAgICAgICAgICAgIGlucHV0c1trXS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjLmNoYW5nZWQuYmluZChjKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGJ1dHRvbnMucnVuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcnVuKTtcbiAgICAgICAgYnV0dG9ucy5zdGVwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3RlcCk7XG5cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxufTtcblxuXG5leHBvcnQge0NvbnRyb2xzfTtcbiIsImltcG9ydCB7VmVjdG9yfSBmcm9tICcuL3ZlY3Rvcic7XG5pbXBvcnQge1V0aWxzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7UGFydGljbGV9IGZyb20gJy4vcGFydGljbGUnO1xuXG5sZXQgcHJvdG8gPSB7XG5cbiAgICByYW5kb21QYXJ0aWNsZSgpIHtcbiAgICAgICAgcmV0dXJuIFBhcnRpY2xlLmNyZWF0ZSh0aGlzLl9yYW5kb21Qb3NpdGlvbigpLCBWZWN0b3IuT1JJR0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLnJhbmRDb2xvcigpKTtcbiAgICB9LFxuXG4gICAgdG9TY3JlZW5Db29yZGluYXRlcyhwb3MpIHtcbiAgICAgICAgbGV0IHggPSBVdGlscy5pbnRlcnBvbGF0ZShwb3MueCwgdGhpcy5taW5YLCB0aGlzLm1heFgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsIHRoaXMuY2FudmFzLndpZHRoKSxcbiAgICAgICAgICAgIHkgPSBVdGlscy5pbnRlcnBvbGF0ZShwb3MueSwgdGhpcy5taW5ZLCB0aGlzLm1heFksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIHJldHVybiBWZWN0b3IuY3JlYXRlKHt4OiB4LCB5OiB5fSk7XG4gICAgfSxcblxuICAgIGZyb21TY3JlZW5Db29yZGluYXRlcyhzY3JlZW5Qb3MpIHtcbiAgICAgICAgbGV0IHggPSBVdGlscy5pbnRlcnBvbGF0ZShzY3JlZW5Qb3MueCwgMCwgdGhpcy5jYW52YXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWluWCwgdGhpcy5tYXhYKSxcbiAgICAgICAgICAgIHkgPSBVdGlscy5pbnRlcnBvbGF0ZShzY3JlZW5Qb3MueSwgMCwgdGhpcy5jYW52YXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1pblksIHRoaXMubWF4WSk7XG4gICAgICAgIHJldHVybiBWZWN0b3IuY3JlYXRlKHt4OiB4LCB5OiB5fSk7XG4gICAgfSxcblxuICAgIGRyYXdCYWNrZ3JvdW5kKCkge1xuICAgICAgICB0aGlzLmNhbnZhcy5jbGVhckJhY2tncm91bmQoKTtcbiAgICAgICAgdGhpcy5fZHJhd0dyaWQoKTtcbiAgICB9LFxuXG4gICAgZHJhd0dCZXN0KGdCZXN0KSB7XG4gICAgICAgIHRoaXMuY2FudmFzLmRyYXdDcm9zcyh0aGlzLnRvU2NyZWVuQ29vcmRpbmF0ZXMoZ0Jlc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR3JhcGhpY3MuZ0Jlc3RDcm9zc1NpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHcmFwaGljcy5nQmVzdENyb3NzQ29sb3IpO1xuICAgIH0sXG5cbiAgICBkcmF3UGFydGljbGUocGFydGljbGUpIHtcbiAgICAgICAgdGhpcy5jYW52YXMuZmlsbENpcmNsZSh0aGlzLnRvU2NyZWVuQ29vcmRpbmF0ZXMocGFydGljbGUucG9zKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHcmFwaGljcy5wYXJ0aWNsZVNpemUsIHBhcnRpY2xlLmNvbG9yKTtcbiAgICB9LFxuXG4gICAgZHJhd1RyYWNlKHBhcnRpY2xlKSB7XG4gICAgICAgIGxldCBwb2ludHMgPSBwYXJ0aWNsZS5wb3NIaXN0b3J5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAodGhpcy50b1NjcmVlbkNvb3JkaW5hdGVzLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmNhbnZhcy5kcmF3TGluZXMocG9pbnRzLCBwYXJ0aWNsZS5jb2xvcik7XG4gICAgfSxcblxuICAgIGRyYXdWZWxvY2l0eShwYXJ0aWNsZSkge1xuICAgICAgICBsZXQgZnJvbSA9IHRoaXMudG9TY3JlZW5Db29yZGluYXRlcyhwYXJ0aWNsZS5wb3MpLFxuICAgICAgICAgICAgdG8gPSB0aGlzLnRvU2NyZWVuQ29vcmRpbmF0ZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljbGUucG9zLmFkZChwYXJ0aWNsZS52ZWwuc2NhbGUoMC4xKSkpO1xuICAgICAgICB0aGlzLmNhbnZhcy5kcmF3TGluZShmcm9tLCB0bywgJ2RhcmtncmF5Jyk7XG4gICAgfSxcblxuICAgIGRyYXdQQmVzdChwYXJ0aWNsZSkge1xuICAgICAgICB0aGlzLmNhbnZhcy5kcmF3Q3Jvc3ModGhpcy50b1NjcmVlbkNvb3JkaW5hdGVzKHBhcnRpY2xlLnBCZXN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdyYXBoaWNzLnBCZXN0Q3Jvc3NTaXplLCBwYXJ0aWNsZS5jb2xvcik7XG4gICAgfSxcblxuICAgIF9kcmF3R3JpZCgpIHtcbiAgICAgICAgdGhpcy5jYW52YXMuZHJhd0xpbmUoe3g6IHRoaXMuY2FudmFzLndpZHRoLzIsIHk6IDB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eDogdGhpcy5jYW52YXMud2lkdGgvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHRoaXMuY2FudmFzLmhlaWdodH0gLCAnd2hpdGUnKTtcbiAgICAgICAgdGhpcy5jYW52YXMuZHJhd0xpbmUoe3g6IDAsIHk6IHRoaXMuY2FudmFzLmhlaWdodC8yfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3g6IHRoaXMuY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5jYW52YXMuaGVpZ2h0LzJ9LCAnd2hpdGUnKTtcbiAgICB9LFxuXG4gICAgX3JhbmRvbVBvc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gVmVjdG9yLmNyZWF0ZSh7eDogVXRpbHMucmFuZCh0aGlzLm1pblgsIHRoaXMubWF4WCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBVdGlscy5yYW5kKHRoaXMubWluWSwgdGhpcy5tYXhZKX0pO1xuICAgIH1cbn07XG5cbmxldCBHcmFwaGljcyA9IHtcbiAgICBjcmVhdGUoY2FudmFzKSB7XG4gICAgICAgIGxldCBnID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG4gICAgICAgIGcuY2FudmFzID0gY2FudmFzO1xuICAgICAgICBnLm1pblggPSAtMTI7XG4gICAgICAgIGcubWF4WCA9IC1nLm1pblg7XG4gICAgICAgIGcubWluWSA9IGcubWluWCAqIGNhbnZhcy5oZWlnaHQvY2FudmFzLndpZHRoO1xuICAgICAgICBnLm1heFkgPSAtZy5taW5ZO1xuICAgICAgICBnLnhTcGFuID0gZy5tYXhYIC0gZy5taW5YO1xuICAgICAgICBnLnlTcGFuID0gZy5tYXhZIC0gZy5taW5ZO1xuXG4gICAgICAgIHJldHVybiBnO1xuICAgIH1cbn07XG5cbkdyYXBoaWNzLnBhcnRpY2xlU2l6ZSA9IDI7XG5HcmFwaGljcy5nQmVzdENyb3NzQ29sb3IgPSAnYmxhY2snO1xuR3JhcGhpY3MuZ0Jlc3RDcm9zc1NpemUgPSAyMDtcbkdyYXBoaWNzLnBCZXN0Q3Jvc3NTaXplID0gMTA7XG5cblxuZXhwb3J0IHtHcmFwaGljc307XG4iLCJsZXQgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dCcpO1xuXG5sZXQgTG9nZ2VyID0ge1xuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIG91dHB1dC50ZXh0Q29udGVudCA9ICcnO1xuICAgIH0sXG5cbiAgICBzZXRUZXh0KHRleHQpIHtcbiAgICAgICAgb3V0cHV0LnRleHRDb250ZW50ID0gdGV4dDtcbiAgICB9XG59O1xuXG5leHBvcnQge0xvZ2dlcn07XG4iLCJpbXBvcnQge0NhbnZhc30gZnJvbSAnLi9jYW52YXMnO1xuaW1wb3J0IHtBcHB9IGZyb20gJy4vYXBwJztcblxubGV0IGNhbnZhcyA9IENhbnZhcy5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RyYXdpbmctY2FudmFzJykpLFxuICAgIGFwcCA9IEFwcC5jcmVhdGUoY2FudmFzKTtcbmFwcC5pbml0KCk7XG4iLCJcbmxldCBwcm90byA9IHtcbiAgICBtb3ZlKGR0KSB7XG4gICAgICAgIHRoaXMucG9zID0gdGhpcy5wb3MuYWRkKHRoaXMudmVsLnNjYWxlKGR0KSk7XG4gICAgICAgIHRoaXMucG9zSGlzdG9yeS5wdXNoKHRoaXMucG9zKTtcbiAgICB9XG59O1xuXG5sZXQgUGFydGljbGUgPSB7XG4gICAgY3JlYXRlKHBvcywgdmVsLCBjb2xvcikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKHByb3RvKSwge1xuICAgICAgICAgICAgcG9zOiBwb3MsXG4gICAgICAgICAgICB2ZWw6IHZlbCxcbiAgICAgICAgICAgIHBvc0hpc3Rvcnk6IFtwb3NdLFxuICAgICAgICAgICAgcEJlc3Q6IHBvcyxcbiAgICAgICAgICAgIGNvbG9yOiBjb2xvclxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5cbmV4cG9ydCB7UGFydGljbGV9O1xuIiwiaW1wb3J0IHtVdGlsc30gZnJvbSAnLi91dGlscyc7XG5cbmZ1bmN0aW9uIG5ld1ZlbG9jaXR5KHBhcnRpY2xlLCBnQmVzdCwgYzEsIGMyLCBrKSB7XG4gICAgbGV0IGdCZXN0Q29tcG9uZW50ID0gZ0Jlc3Quc3VidHJhY3QocGFydGljbGUucG9zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNjYWxlKGMxKk1hdGgucmFuZG9tKCkpLFxuICAgICAgICBwQmVzdENvbXBvbmVudCA9IHBhcnRpY2xlLnBCZXN0LnN1YnRyYWN0KHBhcnRpY2xlLnBvcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZShjMipNYXRoLnJhbmRvbSgpKTtcbiAgICByZXR1cm4gcGFydGljbGUudmVsLnNjYWxlKGspXG4gICAgICAgICAgICAgICAgICAgICAgIC5hZGQoZ0Jlc3RDb21wb25lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgIC5hZGQocEJlc3RDb21wb25lbnQpO1xufVxuXG5sZXQgcHJvdG8gPSB7XG5cbiAgICB1cGRhdGUoc2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgIHAubW92ZShzZXR0aW5ncy5kdCk7XG4gICAgICAgICAgICBwLnBCZXN0ID0gdGhpcy5zZWxlY3RGaXR0ZXN0UG9zaXRpb24oW3AucEJlc3QsIHAucG9zXSk7XG4gICAgICAgICAgICBwLnZlbCA9IG5ld1ZlbG9jaXR5KHAsIHRoaXMuZ0Jlc3QsIHNldHRpbmdzLmMxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5jMiwgc2V0dGluZ3Muayk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdCZXN0ID0gdGhpcy5jYWxjdWxhdGVHQmVzdCgpO1xuICAgIH0sXG5cbiAgICBjYWxjdWxhdGVHQmVzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0Rml0dGVzdFBvc2l0aW9uKHRoaXMucGFydGljbGVzLm1hcChwID0+IHAucEJlc3QpKTtcbiAgICB9LFxufTtcblxubGV0IFBTTyA9IHtcbiAgICBjcmVhdGUocGFydGljbGVzLCBmaXRuZXNzRnVuY3Rpb24pIHtcbiAgICAgICAgbGV0IHBzbyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShwcm90byksIHtcbiAgICAgICAgICAgIHBhcnRpY2xlczogcGFydGljbGVzLFxuICAgICAgICAgICAgZml0bmVzc0Z1bmN0aW9uOiBmaXRuZXNzRnVuY3Rpb25cbiAgICAgICAgfSk7XG4gICAgICAgIHBzby5zZWxlY3RGaXR0ZXN0UG9zaXRpb24gPSBVdGlscy5tYXhCeS5iaW5kKG51bGwsIGZpdG5lc3NGdW5jdGlvbik7XG4gICAgICAgIHBzby5nQmVzdCA9IHBzby5jYWxjdWxhdGVHQmVzdCgpO1xuICAgICAgICByZXR1cm4gcHNvO1xuICAgIH1cbn07XG5cblxuZXhwb3J0IHtQU099O1xuIiwibGV0IGZmZmZmZiA9IE51bWJlci5wYXJzZUludCgnZmZmZmZmJywgMTYpO1xuXG5sZXQgVXRpbHMgPSB7XG5cbiAgICByYW5kKG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiBtaW4gKyBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbik7XG4gICAgfSxcblxuICAgIHJhbmRDb2xvcigpIHtcbiAgICAgICAgcmV0dXJuICcjJyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpmZmZmZmYpLnRvU3RyaW5nKDE2KTtcbiAgICB9LFxuXG4gICAgaW5pdEFycmF5KHNpemUsIGdlbmVyYXRvcikge1xuICAgICAgICBsZXQgYXJyYXkgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGFycmF5LnB1c2goZ2VuZXJhdG9yKCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9LFxuXG4gICAgbWF4QnkodHJhbnNmb3JtLCBpdGVtcykge1xuICAgICAgICByZXR1cm4gaXRlbXMubWFwKGkgPT4gKFxuICAgICAgICAgICAge2l0ZW06IGksIHZhbHVlOiB0cmFuc2Zvcm0oaSl9XG4gICAgICAgICkpLnJlZHVjZSgoYmVzdCwgY3VycmVudCkgPT4gKFxuICAgICAgICAgICAgKGN1cnJlbnQudmFsdWUgPiBiZXN0LnZhbHVlKSA/IGN1cnJlbnQgOiBiZXN0XG4gICAgICAgICkpLml0ZW07XG4gICAgfSxcblxuICAgIGludGVycG9sYXRlKHZhbHVlLCBvbGRNaW4sIG9sZE1heCwgbmV3TWluLCBuZXdNYXgpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gKHZhbHVlIC0gb2xkTWluKSAvIChvbGRNYXggLSBvbGRNaW4pO1xuICAgICAgICByZXR1cm4gbmV3TWluICsgcmF0aW8gKiAobmV3TWF4IC0gbmV3TWluKTtcbiAgICB9LFxuXG4gICAgZG9Ob3RoaW5nKCkge31cbn07XG5cblxuZXhwb3J0IHtVdGlsc307XG4iLCJsZXQgcHJvdG8gPSB7XG5cbiAgICBhZGQob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIFZlY3Rvci5jcmVhdGUoe3g6IHRoaXMueCArIG90aGVyLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLnkgKyBvdGhlci55fSk7XG4gICAgfSxcblxuICAgIHN1YnRyYWN0KG90aGVyKSB7XG4gICAgICAgIHJldHVybiBWZWN0b3IuY3JlYXRlKHt4OiB0aGlzLnggLSBvdGhlci54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogdGhpcy55IC0gb3RoZXIueX0pO1xuICAgIH0sXG5cbiAgICBzY2FsZShmYWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIFZlY3Rvci5jcmVhdGUoe3g6IGZhY3RvciAqIHRoaXMueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGZhY3RvciAqIHRoaXMueX0pO1xuICAgIH0sXG5cbiAgICBzcXVhcmVEaXN0YW5jZShvdGhlcikge1xuICAgICAgICByZXR1cm4gTWF0aC5wb3codGhpcy54IC0gb3RoZXIueCwgMikgK1xuICAgICAgICAgICAgICAgICBNYXRoLnBvdyh0aGlzLnkgLSBvdGhlci55LCAyKTtcbiAgICB9LFxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnKCcgKyB0aGlzLngudG9GaXhlZCgyKSArICcsICcgKyB0aGlzLnkudG9GaXhlZCgyKSArICcpJztcbiAgICB9XG59O1xuXG5sZXQgVmVjdG9yID0ge1xuICAgIGNyZWF0ZShjb29yZHMpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShwcm90byksIHtcbiAgICAgICAgICAgIHg6IGNvb3Jkcy54LFxuICAgICAgICAgICAgeTogY29vcmRzLnlcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuVmVjdG9yLk9SSUdJTiA9IFZlY3Rvci5jcmVhdGUoe3g6IDAsIHk6IDB9KTtcblxuXG5leHBvcnQge1ZlY3Rvcn07XG4iXX0=
