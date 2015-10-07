import {Controls} from './controls';
import {Graphics} from './graphics';
import {Particle} from './particle';
import {Utils} from './utils';
import {PSO} from './pso';
import {Viewport} from './viewport';
import {Logger} from './logger';

function sombrero(position) {
    var x2 = position.x * position.x,
        y2 = position.y * position.y;
    return Math.sin(Math.sqrt(x2 + y2)) / Math.sqrt(x2 + y2);
}

function App(canvas) {
    this.controls = new Controls(this._settingsChanged.bind(this),
                                 this.start.bind(this),
                                 this.step.bind(this));
    this.settings = this.controls.currentSettings();
    this.graphics = new Graphics(canvas);
    this.viewport = new Viewport(canvas, 12);
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
    this.finished = false;
    var particles = Utils.initArray(this.settings.numOfParticles,
                                     Particle.createParticle);
    this.pso = new PSO(particles, this.fitnessFunction);
    Logger.clear();
};

App.prototype.start = function() {
    if (this.finished) { this._reset(); }
    this.running = true;
};

App.prototype.step = function() {
    if (this.finished) { this._reset(); }
    this.running = false;
    this._update();
};

App.prototype._loop = function() {
    this._render();

    if (this.running) {
        this._update();
    }

    if (this._reachedMaxIterations()){
        this.finished = true;
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
