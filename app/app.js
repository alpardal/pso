import {Controls} from './controls';
import {Graphics} from './graphics';
import {Particle} from './particle';
import {Utils} from './utils';
import {PSO} from './pso';

function App(goal, canvas) {
    this.goal = goal;
    this.controls = new Controls(this._settingsChanged.bind(this),
                                 this.start.bind(this));
    this.settings = this.controls.currentSettings();
    this.graphics = new Graphics(canvas);
    this.fitnessFunction = function (position) {
        return position.squareDistance(goal);
    };
    this.pso = new PSO(this.fitnessFunction);
}

App.prototype.start = function() {
    this.particles = Utils.initArray(this.settings.numOfParticles,
                                     Particle.createParticle);
    this.stopRequested = false;
    this._loop();
};

App.prototype.step = function() {
    this._update();
    this._render();
};

App.prototype._loop = function() {
    this.step();

    if (!this._shouldStop()) {
        window.requestAnimationFrame(this._loop.bind(this));
    }
};

App.prototype._settingsChanged = function(settings) {
    this.settings = settings;
};

App.prototype._shouldStop = function() {
    return this.stopRequested || (this.fitnessFunction(this.gBest) <= 1);
};

App.prototype._update = function() {
    this.gBest = this.pso.gBest(this.particles);
    this.particles.forEach(function (p) {
        p.move(this.settings.dt);
        p.pBest = this.pso.fittestPosition([p.pBest, p.pos]);
        p.vel = this.pso.newVelocity(p, this.gBest, this.settings.c1,
                                     this.settings.c2, this.settings.k);
    }, this);
};

App.prototype._render = function() {
    this.graphics.drawBackground();

    if (this.settings.showGBest) {
        this.graphics.drawGBest(this.gBest);
    }

    this.particles.forEach(function(p) {
        this.graphics.drawParticle(p);

        if (this.settings.showTrace) {
            this.graphics.drawTrace(p);
        }

        if (this.settings.showVelocity) {
            this.graphics.drawVelocity(p);
        }
    }, this);
};

export {App};
