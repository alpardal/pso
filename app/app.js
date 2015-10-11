import {Controls} from './controls';
import {Graphics} from './graphics';
import {Utils} from './utils';
import {PSO} from './pso';
import {Logger} from './logger';

function sombrero(position) {
    var x2 = position.x * position.x,
        y2 = position.y * position.y;
    return 6 * Math.cos(Math.sqrt(x2 + y2)) / (x2 + y2 + 6);
}

function App(canvas) {
    this.controls = new Controls(this._settingsChanged.bind(this),
                                 this.run.bind(this),
                                 this.step.bind(this));
    this.settings = this.controls.currentSettings();
    this.graphics = new Graphics(canvas);
    this.fitnessFunction = sombrero;
    this.running = false;
    canvas.addHoverTrackingFunction(this._logScreenPosition.bind(this));
}

App.prototype.init = function() {
    this._reset();
    this._loop();
};

App.prototype._reset = function() {
    this.currentIterations = 0;
    var particles = Utils.initArray(this.settings.numOfParticles,
                                    this.graphics.randomParticle.bind(this.graphics));
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
      ' em ' + this.pso.gBest.toString());
};

App.prototype._logScreenPosition = function(screenPos) {
    var pos = this.graphics.fromScreenCoordinates(screenPos);
    console.log(this.fitnessFunction(pos).toFixed(5) + ' @ ' +
                pos.toString());
};

App.prototype._settingsChanged = function(settings) {
    this.settings = settings;
};

export {App};
