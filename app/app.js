import {Controls} from './controls';
import {Graphics} from './graphics';
import {Particle} from './particle';
import {Utils} from './utils';
import {Vector} from './vector';
import {PSO} from './pso';
import {Viewport} from './viewport';
import {Logger} from './logger';

var solution_space_width = 12;

function sombrero(position) {
    var x2 = position.x * position.x,
        y2 = position.y * position.y;
    return Math.sin(Math.sqrt(x2 + y2)) / Math.sqrt(x2 + y2);
}

function App(canvas) {
    this.canvas = canvas;
    this.controls = new Controls(this._settingsChanged.bind(this),
                                 this.run.bind(this),
                                 this.step.bind(this));
    this.settings = this.controls.currentSettings();
    this.graphics = new Graphics(canvas);
    this.viewport = new Viewport(canvas, solution_space_width);
    this.fitnessFunction = function(position) {
        return sombrero(this.viewport.toLogicCoordinates(position));
    }.bind(this);
    canvas.addHoverTrackingFunction(function(pos) {
        console.log(this.fitnessFunction(pos).toFixed(5) + ' @ ' +
                    this.viewport.toLogicCoordinates(pos));
    }.bind(this));
    this.running = false;
}

App.prototype.init = function() {
    this._reset();
    this._loop();
};

App.prototype._reset = function() {
    this.currentIterations = 0;
    var createParticle = function() {
        var pos = new Vector({x: Utils.randInt(0, this.canvas.width),
                              y: Utils.randInt(0, this.canvas.height)});
        return new Particle(pos, Vector.ORIGIN, Utils.randColor());
    }.bind(this);
    var particles = Utils.initArray(this.settings.numOfParticles,
                                    createParticle);
    this.pso = new PSO(particles, this.fitnessFunction);
    Logger.clear();
};

App.prototype.run = function() {
    if (this._reachedMaxIterations()) { this._reset(); }
    if (this.running) { this._reset(); }
    this.running = true;
};

App.prototype.step = function() {
    if (this._reachedMaxIterations()) { this._reset(); }
    this.running = false;
    this._update();
};

App.prototype._loop = function() {
    this._render();

    if (this.running) {
        this._update();
    }

    if (this._reachedMaxIterations()){
        this.running = false;
    }

    window.requestAnimationFrame(this._loop.bind(this));
};

App.prototype._reachedMaxIterations = function() {
    return this.currentIterations > this.settings.maxIterations;
};

App.prototype._update = function() {
    this.currentIterations++;
    this.pso.update(this.settings);
    this._logGBest();
};

App.prototype._render = function() {
    this.graphics.drawBackground();

    this.pso.particles.forEach(function(p) {
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

App.prototype._logGBest = function() {
    var value = this.fitnessFunction(this.pso.gBest);
    Logger.setText('Valor máximo atual: ' + value.toFixed(5) +
      ' em ' + this.viewport.toLogicCoordinates(this.pso.gBest).toString());
};

App.prototype._settingsChanged = function(settings) {
    this.settings = settings;
};

export {App};
