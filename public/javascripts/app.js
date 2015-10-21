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
        return this._fittestPosition(this.particles.map(function (p) {
            return p.pBest;
        }));
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvYXBwLmpzIiwiL2hvbWUvYW5kcmUvY29kZS9wc28vYXBwL2NhbnZhcy5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9jb250cm9scy5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9ncmFwaGljcy5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9sb2dnZXIuanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvbWFpbi5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9wYXJ0aWNsZS5qcyIsIi9ob21lL2FuZHJlL2NvZGUvcHNvL2FwcC9wc28uanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvdXRpbHMuanMiLCIvaG9tZS9hbmRyZS9jb2RlL3Bzby9hcHAvdmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozt3QkNBdUIsWUFBWTs7d0JBQ1osWUFBWTs7cUJBQ2YsU0FBUzs7bUJBQ1gsT0FBTzs7c0JBQ0osVUFBVTs7QUFFL0IsU0FBUyxRQUFRLENBQUMsUUFBUSxFQUFFO0FBQ3hCLFFBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDNUIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUNqQyxXQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFDO0NBQzNEOztBQUVELElBQUksS0FBSyxHQUFHOztBQUVSLFFBQUksRUFBQSxnQkFB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QUc7QUFDVCxVQUFNLEVBQUEsZ0JBQUMsTUFBTSxFQUFFO0FBQ1gsZUFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDdkMsYUFBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ1gsYUFBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2QsQ0FBQyxDQUFDO0tBQ047Q0FDSixDQUFDOztBQUVGLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7O1FBR3BDLE1BQU0sR0FBTixNQUFNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7Q29udHJvbHN9IGZyb20gJy4vY29udHJvbHMnO1xuaW1wb3J0IHtHcmFwaGljc30gZnJvbSAnLi9ncmFwaGljcyc7XG5pbXBvcnQge1V0aWxzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7UFNPfSBmcm9tICcuL3Bzbyc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi9sb2dnZXInO1xuXG5mdW5jdGlvbiBzb21icmVybyhwb3NpdGlvbikge1xuICAgIGxldCB4MiA9IHBvc2l0aW9uLnggKiBwb3NpdGlvbi54LFxuICAgICAgICB5MiA9IHBvc2l0aW9uLnkgKiBwb3NpdGlvbi55O1xuICAgIHJldHVybiA2ICogTWF0aC5jb3MoTWF0aC5zcXJ0KHgyICsgeTIpKSAvICh4MiArIHkyICsgNik7XG59XG5cbmxldCBwcm90byA9IHtcblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuX3Jlc2V0KCk7XG4gICAgICAgIHRoaXMuX2xvb3AoKTtcbiAgICB9LFxuXG4gICAgX3Jlc2V0KCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRJdGVyYXRpb25zID0gMDtcbiAgICAgICAgbGV0IHBhcnRpY2xlcyA9IFV0aWxzLmluaXRBcnJheSh0aGlzLnNldHRpbmdzLm51bU9mUGFydGljbGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MucmFuZG9tUGFydGljbGUuYmluZCh0aGlzLmdyYXBoaWNzKSk7XG4gICAgICAgIHRoaXMucHNvID0gUFNPLmNyZWF0ZShwYXJ0aWNsZXMsIHRoaXMuZml0bmVzc0Z1bmN0aW9uKTtcbiAgICAgICAgTG9nZ2VyLmNsZWFyKCk7XG4gICAgfSxcblxuICAgIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlYWNoZWRNYXhJdGVyYXRpb25zKCkpIHsgdGhpcy5fcmVzZXQoKTsgfVxuICAgICAgICBpZiAodGhpcy5ydW5uaW5nKSB7IHRoaXMuX3Jlc2V0KCk7IH1cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgc3RlcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlYWNoZWRNYXhJdGVyYXRpb25zKCkpIHsgdGhpcy5fcmVzZXQoKTsgfVxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgfSxcblxuICAgIF9sb29wKCkge1xuICAgICAgICB0aGlzLl9yZW5kZXIoKTtcblxuICAgICAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9yZWFjaGVkTWF4SXRlcmF0aW9ucygpKXtcbiAgICAgICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9sb29wLmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBfcmVhY2hlZE1heEl0ZXJhdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRJdGVyYXRpb25zID4gdGhpcy5zZXR0aW5ncy5tYXhJdGVyYXRpb25zO1xuICAgIH0sXG5cbiAgICBfdXBkYXRlKCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRJdGVyYXRpb25zKys7XG4gICAgICAgIHRoaXMucHNvLnVwZGF0ZSh0aGlzLnNldHRpbmdzKTtcbiAgICAgICAgdGhpcy5fbG9nR0Jlc3QoKTtcbiAgICB9LFxuXG4gICAgX3JlbmRlcigpIHtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5kcmF3QmFja2dyb3VuZCgpO1xuXG4gICAgICAgIHRoaXMucHNvLnBhcnRpY2xlcy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5kcmF3UGFydGljbGUocCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnNob3dUcmFjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuZHJhd1RyYWNlKHApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5zaG93VmVsb2NpdHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmRyYXdWZWxvY2l0eShwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2hvd1BCZXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5kcmF3UEJlc3QocCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnNob3dHQmVzdCkge1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5kcmF3R0Jlc3QodGhpcy5wc28uZ0Jlc3QpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9sb2dHQmVzdCgpIHtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5maXRuZXNzRnVuY3Rpb24odGhpcy5wc28uZ0Jlc3QpO1xuICAgICAgICBMb2dnZXIuc2V0VGV4dChgVmFsb3IgbcOheGltbyBhdHVhbDogJHt2YWx1ZS50b0ZpeGVkKDUpfWAgK1xuICAgICAgICAgIGAgZW0gJHt0aGlzLnBzby5nQmVzdH1gKTtcbiAgICB9LFxuXG4gICAgX2xvZ1NjcmVlblBvc2l0aW9uKHNjcmVlblBvcykge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5ncmFwaGljcy5mcm9tU2NyZWVuQ29vcmRpbmF0ZXMoc2NyZWVuUG9zKTtcbiAgICAgICAgY29uc29sZS5sb2coYCR7dGhpcy5maXRuZXNzRnVuY3Rpb24ocG9zKS50b0ZpeGVkKDUpfSBAICR7cG9zfWApO1xuICAgIH0sXG5cbiAgICBfc2V0dGluZ3NDaGFuZ2VkKHNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB9XG59O1xuXG5sZXQgQXBwID0ge1xuICAgIGNyZWF0ZShjYW52YXMpIHtcbiAgICAgICAgbGV0IGFwcCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICAgICAgICBhcHAuY29udHJvbHMgPSBDb250cm9scy5jcmVhdGUoYXBwLl9zZXR0aW5nc0NoYW5nZWQuYmluZChhcHApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwLnJ1bi5iaW5kKGFwcCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHAuc3RlcC5iaW5kKGFwcCkpO1xuICAgICAgICBhcHAuc2V0dGluZ3MgPSBhcHAuY29udHJvbHMuY3VycmVudFNldHRpbmdzKCk7XG4gICAgICAgIGFwcC5ncmFwaGljcyA9IEdyYXBoaWNzLmNyZWF0ZShjYW52YXMpO1xuICAgICAgICBhcHAuZml0bmVzc0Z1bmN0aW9uID0gc29tYnJlcm87XG4gICAgICAgIGFwcC5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIGNhbnZhcy5hZGRIb3ZlclRyYWNraW5nRnVuY3Rpb24oYXBwLl9sb2dTY3JlZW5Qb3NpdGlvbi5iaW5kKGFwcCkpO1xuXG4gICAgICAgIHJldHVybiBhcHA7XG4gICAgfVxufTtcblxuXG5leHBvcnQge0FwcH07XG4iLCJpbXBvcnQge1ZlY3Rvcn0gZnJvbSAnLi92ZWN0b3InO1xuXG5sZXQgcHJvdG8gPSB7XG5cbiAgICBjbGVhckJhY2tncm91bmQoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfSxcblxuICAgIGZpbGxDaXJjbGUocG9zLCByYWRpdXMsIGNvbG9yKSB7XG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5hcmMocG9zLngsIHBvcy55LCByYWRpdXMsIDAsIDIqTWF0aC5QSSk7XG4gICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xuICAgIH0sXG5cbiAgICBkcmF3TGluZShwMSwgcDIsIGNvbG9yKSB7XG4gICAgICAgIHRoaXMuZHJhd0xpbmVzKFtwMSwgcDJdLCBjb2xvcik7XG4gICAgfSxcblxuICAgIGRyYXdMaW5lcyhwb2ludHMsIGNvbG9yKSB7XG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGgtMTsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgcDEgPSBwb2ludHNbaV0sXG4gICAgICAgICAgICAgICAgcDIgPSBwb2ludHNbaSsxXTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhwMS54LCBwMS55KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhwMi54LCBwMi55KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgIH0sXG5cbiAgICBkcmF3Q3Jvc3MocG9zLCBzaXplLCBjb2xvcikge1xuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHBvcy54LXNpemUvMiwgcG9zLnkpO1xuICAgICAgICB0aGlzLmN0eC5saW5lVG8ocG9zLngrc2l6ZS8yLCBwb3MueSk7XG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhwb3MueCwgcG9zLnktc2l6ZS8yKTtcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHBvcy54LCBwb3MueStzaXplLzIpO1xuICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgfSxcblxuICAgIGFkZEhvdmVyVHJhY2tpbmdGdW5jdGlvbihmdW4pIHtcbiAgICAgICAgdGhpcy5kb21fY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGZ1bihWZWN0b3IuY3JlYXRlKHt4OiBldmVudC5vZmZzZXRYLCB5OiBldmVudC5vZmZzZXRZfSkpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5sZXQgQ2FudmFzID0ge1xuICAgIGNyZWF0ZShkb21fY2FudmFzKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUocHJvdG8pLCB7XG4gICAgICAgICAgICBkb21fY2FudmFzOiBkb21fY2FudmFzLFxuICAgICAgICAgICAgY3R4OiBkb21fY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgICAgICB3aWR0aDogZG9tX2NhbnZhcy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogZG9tX2NhbnZhcy5oZWlnaHRcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuXG5leHBvcnQge0NhbnZhc307XG4iLCJsZXQgaW5wdXRzID0ge1xuICAgICAgICBudW1iZXJPZlBhcnRpY2xlczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ251bWJlck9mUGFydGljbGVzJyksXG4gICAgICAgIGMxOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYzEnKSxcbiAgICAgICAgYzI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjMicpLFxuICAgICAgICBrOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaycpLFxuICAgICAgICBkdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R0JyksXG4gICAgICAgIG1heEl0ZXJhdGlvbnM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXhJdGVyYXRpb25zJyksXG4gICAgICAgIHNob3dHQmVzdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3dHQmVzdCcpLFxuICAgICAgICBzaG93UEJlc3Q6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaG93UEJlc3QnKSxcbiAgICAgICAgc2hvd1RyYWNlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd1RyYWNlJyksXG4gICAgICAgIHNob3dWZWxvY2l0eTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3dWZWxvY2l0eScpXG4gICAgfSxcbiAgICBidXR0b25zID0ge1xuICAgICAgICBydW46IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKSxcbiAgICAgICAgc3RlcDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0ZXBCdXR0b24nKVxuICAgIH1cblxuZnVuY3Rpb24gaW50VmFsdWUoZmllbGQpIHtcbiAgICByZXR1cm4gTnVtYmVyLnBhcnNlSW50KGZpZWxkLnZhbHVlKTtcbn1cblxuZnVuY3Rpb24gZmxvYXRWYWx1ZShmaWVsZCkge1xuICAgIHJldHVybiBOdW1iZXIucGFyc2VGbG9hdChmaWVsZC52YWx1ZSk7XG59XG5cbmxldCBwcm90byA9IHtcbiAgICBjaGFuZ2VkKCkge1xuICAgICAgICB0aGlzLmNoYW5nZVNldHRpbmdzKHRoaXMuY3VycmVudFNldHRpbmdzKCkpO1xuICAgIH0sXG5cbiAgICBjdXJyZW50U2V0dGluZ3MoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBudW1PZlBhcnRpY2xlczogaW50VmFsdWUoaW5wdXRzLm51bWJlck9mUGFydGljbGVzKSxcbiAgICAgICAgICAgIGMxOiBmbG9hdFZhbHVlKGlucHV0cy5jMSksXG4gICAgICAgICAgICBjMjogZmxvYXRWYWx1ZShpbnB1dHMuYzIpLFxuICAgICAgICAgICAgazogZmxvYXRWYWx1ZShpbnB1dHMuayksXG4gICAgICAgICAgICBkdDogZmxvYXRWYWx1ZShpbnB1dHMuZHQpLFxuICAgICAgICAgICAgbWF4SXRlcmF0aW9uczogaW50VmFsdWUoaW5wdXRzLm1heEl0ZXJhdGlvbnMpLFxuICAgICAgICAgICAgc2hvd0dCZXN0OiBpbnB1dHMuc2hvd0dCZXN0LmNoZWNrZWQsXG4gICAgICAgICAgICBzaG93UEJlc3Q6IGlucHV0cy5zaG93UEJlc3QuY2hlY2tlZCxcbiAgICAgICAgICAgIHNob3dUcmFjZTogaW5wdXRzLnNob3dUcmFjZS5jaGVja2VkLFxuICAgICAgICAgICAgc2hvd1ZlbG9jaXR5OiBpbnB1dHMuc2hvd1ZlbG9jaXR5LmNoZWNrZWRcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5sZXQgQ29udHJvbHMgPSB7XG4gICAgY3JlYXRlKGNoYW5nZVNldHRpbmdzLCBydW4sIHN0ZXApIHtcbiAgICAgICAgbGV0IGMgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgICAgICAgYy5jaGFuZ2VTZXR0aW5ncyA9IGNoYW5nZVNldHRpbmdzO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGlucHV0cykuZm9yRWFjaChrID0+IHtcbiAgICAgICAgICAgIGlucHV0c1trXS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjLmNoYW5nZWQuYmluZChjKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGJ1dHRvbnMucnVuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcnVuKTtcbiAgICAgICAgYnV0dG9ucy5zdGVwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3RlcCk7XG5cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxufTtcblxuXG5leHBvcnQge0NvbnRyb2xzfTtcbiIsImltcG9ydCB7VmVjdG9yfSBmcm9tICcuL3ZlY3Rvcic7XG5pbXBvcnQge1V0aWxzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7UGFydGljbGV9IGZyb20gJy4vcGFydGljbGUnO1xuXG5sZXQgcHJvdG8gPSB7XG5cbiAgICByYW5kb21QYXJ0aWNsZSgpIHtcbiAgICAgICAgcmV0dXJuIFBhcnRpY2xlLmNyZWF0ZSh0aGlzLl9yYW5kb21Qb3NpdGlvbigpLCBWZWN0b3IuT1JJR0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLnJhbmRDb2xvcigpKTtcbiAgICB9LFxuXG4gICAgdG9TY3JlZW5Db29yZGluYXRlcyhwb3MpIHtcbiAgICAgICAgbGV0IHggPSBVdGlscy5pbnRlcnBvbGF0ZShwb3MueCwgdGhpcy5taW5YLCB0aGlzLm1heFgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsIHRoaXMuY2FudmFzLndpZHRoKSxcbiAgICAgICAgICAgIHkgPSBVdGlscy5pbnRlcnBvbGF0ZShwb3MueSwgdGhpcy5taW5ZLCB0aGlzLm1heFksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIHJldHVybiBWZWN0b3IuY3JlYXRlKHt4OiB4LCB5OiB5fSk7XG4gICAgfSxcblxuICAgIGZyb21TY3JlZW5Db29yZGluYXRlcyhzY3JlZW5Qb3MpIHtcbiAgICAgICAgbGV0IHggPSBVdGlscy5pbnRlcnBvbGF0ZShzY3JlZW5Qb3MueCwgMCwgdGhpcy5jYW52YXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWluWCwgdGhpcy5tYXhYKSxcbiAgICAgICAgICAgIHkgPSBVdGlscy5pbnRlcnBvbGF0ZShzY3JlZW5Qb3MueSwgMCwgdGhpcy5jYW52YXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1pblksIHRoaXMubWF4WSk7XG4gICAgICAgIHJldHVybiBWZWN0b3IuY3JlYXRlKHt4OiB4LCB5OiB5fSk7XG4gICAgfSxcblxuICAgIGRyYXdCYWNrZ3JvdW5kKCkge1xuICAgICAgICB0aGlzLmNhbnZhcy5jbGVhckJhY2tncm91bmQoKTtcbiAgICAgICAgdGhpcy5fZHJhd0dyaWQoKTtcbiAgICB9LFxuXG4gICAgZHJhd0dCZXN0KGdCZXN0KSB7XG4gICAgICAgIHRoaXMuY2FudmFzLmRyYXdDcm9zcyh0aGlzLnRvU2NyZWVuQ29vcmRpbmF0ZXMoZ0Jlc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR3JhcGhpY3MuZ0Jlc3RDcm9zc1NpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHcmFwaGljcy5nQmVzdENyb3NzQ29sb3IpO1xuICAgIH0sXG5cbiAgICBkcmF3UGFydGljbGUocGFydGljbGUpIHtcbiAgICAgICAgdGhpcy5jYW52YXMuZmlsbENpcmNsZSh0aGlzLnRvU2NyZWVuQ29vcmRpbmF0ZXMocGFydGljbGUucG9zKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHcmFwaGljcy5wYXJ0aWNsZVNpemUsIHBhcnRpY2xlLmNvbG9yKTtcbiAgICB9LFxuXG4gICAgZHJhd1RyYWNlKHBhcnRpY2xlKSB7XG4gICAgICAgIGxldCBwb2ludHMgPSBwYXJ0aWNsZS5wb3NIaXN0b3J5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAodGhpcy50b1NjcmVlbkNvb3JkaW5hdGVzLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmNhbnZhcy5kcmF3TGluZXMocG9pbnRzLCBwYXJ0aWNsZS5jb2xvcik7XG4gICAgfSxcblxuICAgIGRyYXdWZWxvY2l0eShwYXJ0aWNsZSkge1xuICAgICAgICBsZXQgZnJvbSA9IHRoaXMudG9TY3JlZW5Db29yZGluYXRlcyhwYXJ0aWNsZS5wb3MpLFxuICAgICAgICAgICAgdG8gPSB0aGlzLnRvU2NyZWVuQ29vcmRpbmF0ZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljbGUucG9zLmFkZChwYXJ0aWNsZS52ZWwuc2NhbGUoMC4xKSkpO1xuICAgICAgICB0aGlzLmNhbnZhcy5kcmF3TGluZShmcm9tLCB0bywgJ2RhcmtncmF5Jyk7XG4gICAgfSxcblxuICAgIGRyYXdQQmVzdChwYXJ0aWNsZSkge1xuICAgICAgICB0aGlzLmNhbnZhcy5kcmF3Q3Jvc3ModGhpcy50b1NjcmVlbkNvb3JkaW5hdGVzKHBhcnRpY2xlLnBCZXN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdyYXBoaWNzLnBCZXN0Q3Jvc3NTaXplLCBwYXJ0aWNsZS5jb2xvcik7XG4gICAgfSxcblxuICAgIF9kcmF3R3JpZCgpIHtcbiAgICAgICAgdGhpcy5jYW52YXMuZHJhd0xpbmUoe3g6IHRoaXMuY2FudmFzLndpZHRoLzIsIHk6IDB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eDogdGhpcy5jYW52YXMud2lkdGgvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHRoaXMuY2FudmFzLmhlaWdodH0gLCAnd2hpdGUnKTtcbiAgICAgICAgdGhpcy5jYW52YXMuZHJhd0xpbmUoe3g6IDAsIHk6IHRoaXMuY2FudmFzLmhlaWdodC8yfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3g6IHRoaXMuY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5jYW52YXMuaGVpZ2h0LzJ9LCAnd2hpdGUnKTtcbiAgICB9LFxuXG4gICAgX3JhbmRvbVBvc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gVmVjdG9yLmNyZWF0ZSh7eDogVXRpbHMucmFuZCh0aGlzLm1pblgsIHRoaXMubWF4WCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBVdGlscy5yYW5kKHRoaXMubWluWSwgdGhpcy5tYXhZKX0pO1xuICAgIH1cbn07XG5cbmxldCBHcmFwaGljcyA9IHtcbiAgICBjcmVhdGUoY2FudmFzKSB7XG4gICAgICAgIGxldCBnID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG4gICAgICAgIGcuY2FudmFzID0gY2FudmFzO1xuICAgICAgICBnLm1pblggPSAtMTI7XG4gICAgICAgIGcubWF4WCA9IC1nLm1pblg7XG4gICAgICAgIGcubWluWSA9IGcubWluWCAqIGNhbnZhcy5oZWlnaHQvY2FudmFzLndpZHRoO1xuICAgICAgICBnLm1heFkgPSAtZy5taW5ZO1xuICAgICAgICBnLnhTcGFuID0gZy5tYXhYIC0gZy5taW5YO1xuICAgICAgICBnLnlTcGFuID0gZy5tYXhZIC0gZy5taW5ZO1xuXG4gICAgICAgIHJldHVybiBnO1xuICAgIH1cbn07XG5cbkdyYXBoaWNzLnBhcnRpY2xlU2l6ZSA9IDI7XG5HcmFwaGljcy5nQmVzdENyb3NzQ29sb3IgPSAnYmxhY2snO1xuR3JhcGhpY3MuZ0Jlc3RDcm9zc1NpemUgPSAyMDtcbkdyYXBoaWNzLnBCZXN0Q3Jvc3NTaXplID0gMTA7XG5cblxuZXhwb3J0IHtHcmFwaGljc307XG4iLCJsZXQgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dCcpO1xuXG5sZXQgTG9nZ2VyID0ge1xuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIG91dHB1dC50ZXh0Q29udGVudCA9ICcnO1xuICAgIH0sXG5cbiAgICBzZXRUZXh0KHRleHQpIHtcbiAgICAgICAgb3V0cHV0LnRleHRDb250ZW50ID0gdGV4dDtcbiAgICB9XG59O1xuXG5leHBvcnQge0xvZ2dlcn07XG4iLCJpbXBvcnQge0NhbnZhc30gZnJvbSAnLi9jYW52YXMnO1xuaW1wb3J0IHtBcHB9IGZyb20gJy4vYXBwJztcblxubGV0IGNhbnZhcyA9IENhbnZhcy5jcmVhdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RyYXdpbmctY2FudmFzJykpLFxuICAgIGFwcCA9IEFwcC5jcmVhdGUoY2FudmFzKTtcbmFwcC5pbml0KCk7XG4iLCJcbmxldCBwcm90byA9IHtcbiAgICBtb3ZlKGR0KSB7XG4gICAgICAgIHRoaXMucG9zID0gdGhpcy5wb3MuYWRkKHRoaXMudmVsLnNjYWxlKGR0KSk7XG4gICAgICAgIHRoaXMucG9zSGlzdG9yeS5wdXNoKHRoaXMucG9zKTtcbiAgICB9XG59O1xuXG5sZXQgUGFydGljbGUgPSB7XG4gICAgY3JlYXRlKHBvcywgdmVsLCBjb2xvcikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKHByb3RvKSwge1xuICAgICAgICAgICAgcG9zOiBwb3MsXG4gICAgICAgICAgICB2ZWw6IHZlbCxcbiAgICAgICAgICAgIHBvc0hpc3Rvcnk6IFtwb3NdLFxuICAgICAgICAgICAgcEJlc3Q6IHBvcyxcbiAgICAgICAgICAgIGNvbG9yOiBjb2xvclxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5cbmV4cG9ydCB7UGFydGljbGV9O1xuIiwiaW1wb3J0IHtVdGlsc30gZnJvbSAnLi91dGlscyc7XG5cbmxldCBwcm90byA9IHtcblxuICAgIHVwZGF0ZShzZXR0aW5ncykge1xuICAgICAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICAgICAgcC5tb3ZlKHNldHRpbmdzLmR0KTtcbiAgICAgICAgICAgIHAucEJlc3QgPSB0aGlzLl9maXR0ZXN0UG9zaXRpb24oW3AucEJlc3QsIHAucG9zXSk7XG4gICAgICAgICAgICBwLnZlbCA9IHRoaXMuX25ld1ZlbG9jaXR5KHAsIHRoaXMuZ0Jlc3QsIHNldHRpbmdzLmMxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5jMiwgc2V0dGluZ3Muayk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdCZXN0ID0gdGhpcy5fY2FsY3VsYXRlR0Jlc3QoKTtcbiAgICB9LFxuXG4gICAgX2NhbGN1bGF0ZUdCZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZml0dGVzdFBvc2l0aW9uKHRoaXMucGFydGljbGVzLm1hcChwID0+IHAucEJlc3QpKTtcbiAgICB9LFxuXG4gICAgX2ZpdHRlc3RQb3NpdGlvbihwb3NpdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLm1heEJ5KHBvc2l0aW9ucywgdGhpcy5maXRuZXNzRnVuY3Rpb24pO1xuICAgIH0sXG5cbiAgICBfbmV3VmVsb2NpdHkocGFydGljbGUsIGdCZXN0LCBjMSwgYzIsIGspIHtcbiAgICAgICAgbGV0IGdCZXN0Q29tcG9uZW50ID0gZ0Jlc3Quc3VidHJhY3QocGFydGljbGUucG9zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZShjMSpNYXRoLnJhbmRvbSgpKSxcbiAgICAgICAgICAgIHBCZXN0Q29tcG9uZW50ID0gcGFydGljbGUucEJlc3Quc3VidHJhY3QocGFydGljbGUucG9zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZShjMipNYXRoLnJhbmRvbSgpKTtcbiAgICAgICAgcmV0dXJuIHBhcnRpY2xlLnZlbC5zY2FsZShrKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZChnQmVzdENvbXBvbmVudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGQocEJlc3RDb21wb25lbnQpO1xuICAgIH1cbn07XG5cbmxldCBQU08gPSB7XG4gICAgY3JlYXRlKHBhcnRpY2xlcywgZml0bmVzc0Z1bmN0aW9uKSB7XG4gICAgICAgIGxldCBwc28gPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUocHJvdG8pLCB7XG4gICAgICAgICAgICBwYXJ0aWNsZXM6IHBhcnRpY2xlcyxcbiAgICAgICAgICAgIGZpdG5lc3NGdW5jdGlvbjogZml0bmVzc0Z1bmN0aW9uXG4gICAgICAgIH0pO1xuICAgICAgICBwc28uZ0Jlc3QgPSBwc28uX2NhbGN1bGF0ZUdCZXN0KCk7XG4gICAgICAgIHJldHVybiBwc287XG4gICAgfVxufTtcblxuXG5leHBvcnQge1BTT307XG4iLCJsZXQgZmZmZmZmID0gTnVtYmVyLnBhcnNlSW50KCdmZmZmZmYnLCAxNik7XG5cbmxldCBVdGlscyA9IHtcblxuICAgIHJhbmQobWluLCBtYXgpIHtcbiAgICAgICAgcmV0dXJuIG1pbiArIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKTtcbiAgICB9LFxuXG4gICAgcmFuZENvbG9yKCkge1xuICAgICAgICByZXR1cm4gJyMnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmZmZmZmZikudG9TdHJpbmcoMTYpO1xuICAgIH0sXG5cbiAgICBpbml0QXJyYXkoc2l6ZSwgZ2VuZXJhdG9yKSB7XG4gICAgICAgIGxldCBhcnJheSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgICAgYXJyYXkucHVzaChnZW5lcmF0b3IoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH0sXG5cbiAgICBtYXhCeShpdGVtcywgdHJhbnNmb3JtKSB7XG4gICAgICAgIHJldHVybiBpdGVtcy5tYXAoaSA9PiAoXG4gICAgICAgICAgICB7aXRlbTogaSwgdmFsdWU6IHRyYW5zZm9ybShpKX1cbiAgICAgICAgKSkucmVkdWNlKChiZXN0LCBjdXJyZW50KSA9PiAoXG4gICAgICAgICAgICAoY3VycmVudC52YWx1ZSA+IGJlc3QudmFsdWUpID8gY3VycmVudCA6IGJlc3RcbiAgICAgICAgKSkuaXRlbTtcbiAgICB9LFxuXG4gICAgaW50ZXJwb2xhdGUodmFsdWUsIG9sZE1pbiwgb2xkTWF4LCBuZXdNaW4sIG5ld01heCkge1xuICAgICAgICBsZXQgcmF0aW8gPSAodmFsdWUgLSBvbGRNaW4pIC8gKG9sZE1heCAtIG9sZE1pbik7XG4gICAgICAgIHJldHVybiBuZXdNaW4gKyByYXRpbyAqIChuZXdNYXggLSBuZXdNaW4pO1xuICAgIH1cbn07XG5cblxuZXhwb3J0IHtVdGlsc307XG4iLCJsZXQgcHJvdG8gPSB7XG5cbiAgICBhZGQob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIFZlY3Rvci5jcmVhdGUoe3g6IHRoaXMueCArIG90aGVyLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLnkgKyBvdGhlci55fSk7XG4gICAgfSxcblxuICAgIHN1YnRyYWN0KG90aGVyKSB7XG4gICAgICAgIHJldHVybiBWZWN0b3IuY3JlYXRlKHt4OiB0aGlzLnggLSBvdGhlci54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogdGhpcy55IC0gb3RoZXIueX0pO1xuICAgIH0sXG5cbiAgICBzY2FsZShmYWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIFZlY3Rvci5jcmVhdGUoe3g6IGZhY3RvciAqIHRoaXMueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGZhY3RvciAqIHRoaXMueX0pO1xuICAgIH0sXG5cbiAgICBzcXVhcmVEaXN0YW5jZShvdGhlcikge1xuICAgICAgICByZXR1cm4gTWF0aC5wb3codGhpcy54IC0gb3RoZXIueCwgMikgK1xuICAgICAgICAgICAgICAgICBNYXRoLnBvdyh0aGlzLnkgLSBvdGhlci55LCAyKTtcbiAgICB9LFxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnKCcgKyB0aGlzLngudG9GaXhlZCgyKSArICcsICcgKyB0aGlzLnkudG9GaXhlZCgyKSArICcpJztcbiAgICB9XG59O1xuXG5sZXQgVmVjdG9yID0ge1xuICAgIGNyZWF0ZShjb29yZHMpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShwcm90byksIHtcbiAgICAgICAgICAgIHg6IGNvb3Jkcy54LFxuICAgICAgICAgICAgeTogY29vcmRzLnlcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuVmVjdG9yLk9SSUdJTiA9IFZlY3Rvci5jcmVhdGUoe3g6IDAsIHk6IDB9KTtcblxuXG5leHBvcnQge1ZlY3Rvcn07XG4iXX0=
