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
}

App.prototype.start = function() {
    this.particles = Utils.range(1, this.settings.numOfParticles)
                          .map(Particle.createParticle);
    this.stopRequested = false;
    this._loop();
};

App.prototype.step = function() {
    this._update();
    this._render();
};

App.prototype._settingsChanged = function(settings) {
    this.settings = settings;
};

App.prototype._loop = function() {
    this.step();

    if (!this._shouldStop()) {
        window.requestAnimationFrame(this._loop.bind(this));
    }
};

App.prototype._shouldStop = function() {
    return this.stopRequested ||
            (this.gBest.squareDistance(this.goal) <= 1);
};

App.prototype._findGBest = function() {
    var candidates = this.particles.map(function(p) {return p.pBest;});
    return PSO.bestPosition(this.goal, candidates);
};

App.prototype._update = function() {
    this.gBest = this._findGBest();
    this.particles.forEach(function (p) {
        p.move(this.settings.dt);
        p.pBest = PSO.bestPosition(this.goal, [p.pBest, p.pos]);
        p.vel = PSO.newVelocity(p, this.gBest, this.settings.c1,
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
