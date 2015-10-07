import {Utils} from './utils';

function PSO(particles, fitnessFunction) {
    this.particles = particles;
    this.fitnessFunction = fitnessFunction;
    this.gBest = this._calculateGBest();
}

PSO.prototype.update = function(settings) {
    this.particles.forEach(function (p) {
        p.move(settings.dt);
        p.pBest = this._fittestPosition([p.pBest, p.pos]);
        p.vel = this._newVelocity(p, this.gBest, settings.c1,
                                 settings.c2, settings.k);
    }, this);
    this.gBest = this._calculateGBest();
};

PSO.prototype.foundGoodSolution = function() {
    return this.fitnessFunction(this.gBest) <= 1;
};

PSO.prototype._calculateGBest = function() {
    return this._fittestPosition(this.particles.map(Utils.accessor('pBest')));
};

PSO.prototype._fittestPosition = function(positions) {
    return Utils.minBy(positions, this.fitnessFunction);
};

PSO.prototype._newVelocity = function(particle, gBest, c1, c2, k) {
    var gBestComponent = gBest.subtract(particle.pos)
                              .scale(c1*Math.random()),
        pBestComponent = particle.pBest.subtract(particle.pos)
                                       .scale(c2*Math.random());
    return particle.vel.scale(k)
                       .add(gBestComponent)
                       .add(pBestComponent);
}

export {PSO};
