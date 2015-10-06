import {Utils} from './utils';

function PSO(fitnessFunction) {
    this.fitnessFunction = fitnessFunction;
}

PSO.prototype.gBest = function(particles) {
    return this.fittestPosition(particles.map(Utils.accessor('pBest')));
};

PSO.prototype.fittestPosition = function(positions) {
    return Utils.minBy(positions, this.fitnessFunction);
};

PSO.prototype.newVelocity = function(particle, gBest, c1, c2, k) {
    var gBestComponent = gBest.subtract(particle.pos)
                              .scale(c1*Math.random()),
        pBestComponent = particle.pBest.subtract(particle.pos)
                                       .scale(c2*Math.random());
    return particle.vel.scale(k)
                       .add(gBestComponent)
                       .add(pBestComponent);
}

export {PSO};
