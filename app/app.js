import {Controls} from './controls';
import {Graphics} from './graphics';
import {Particle} from './particle';
import {Utils} from './utils';
import {PSO} from './pso';

function App(goal, canvas) {
    this.controls = new Controls(this._settingsChanged.bind(this),
                                 this.start.bind(this),
                                 this.step.bind(this));
    this.settings = this.controls.currentSettings();
    this.graphics = new Graphics(canvas);
    this.fitnessFunction = function (position) {
        return position.squareDistance(goal);
    };
    this.maxIterations = 100;
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

    if (this._shouldStop()){
        this.finished = true;
        this.running = false;
    }

    window.requestAnimationFrame(this._loop.bind(this));
};

App.prototype._shouldStop = function() {
    return this.pso.foundGoodSolution() || this._reachedMaxIterations();
};

App.prototype._reachedMaxIterations = function() {
    return this.currentIterations > this.maxIterations;
};

App.prototype._update = function() {
    this.currentIterations++;
    this.pso.update(this.settings);
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

App.prototype._settingsChanged = function(settings) {
    this.settings = settings;
};

export {App};
