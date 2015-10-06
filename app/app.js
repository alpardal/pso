import {Controls} from './controls';
import {Canvas} from './canvas';
import {Particle} from './particle';
import {Utils} from './utils';
import {PSO} from './pso';

function App(goal) {
    this.goal = goal;
    this.particleSize = 2;
    this.controls = new Controls(this.settingsChanged.bind(this));
    this.settings = this.controls.currentSettings();
    this.particles = Utils.range(1, this.settings.numOfParticles)
                          .map(Particle.createParticle);
}

App.prototype.start = function() {
    this.stopRequested = false;
    this.loop();
};

App.prototype.stop = function() {
    this.stopRequested = true;
};

App.prototype.loop = function() {
    this.step();

    if (!this.shouldStop()) {
        window.requestAnimationFrame(this.loop.bind(this));
    }
};

App.prototype.shouldStop = function() {
    return this.stopRequested ||
            (this.gBest.squareDistance(this.goal) <= 1);
};

App.prototype.step = function() {
    this.update();
    this.render();
};

App.prototype.settingsChanged = function(settings) {
    this.settings = settings;
};

App.prototype.update = function() {
    this.gBest = PSO.bestPosition(this.goal,
          this.particles.map(function(p) { return p.pBest; }));
    this.particles.forEach(function (p) {
        p.move(this.settings.dt);
        p.pBest = PSO.bestPosition(this.goal, [p.pBest, p.pos]);
        p.vel = PSO.newVelocity(p, this.gBest, this.settings.c1,
                                this.settings.c2, this.settings.k);
    }, this);
};

App.prototype.render = function() {
    Canvas.clearBackground();
    Canvas.drawCross(this.gBest.x, this.gBest.y, 20, 'black');

    this.particles.forEach(function (p) {
        Canvas.fillCircle(p.pos.x, p.pos.y,
                          this.particleSize, p.color);
        if (this.settings.showTrace) {
            Canvas.drawLines(p.posHistory, p.color);
        }
    }, this);
};

export {App};
