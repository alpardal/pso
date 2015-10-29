import {Utils} from './utils';

function newVelocity(particle, gBest, c1, c2, k) {
    let gBestComponent = gBest.subtract(particle.pos)
                              .scale(c1*Math.random()),
        pBestComponent = particle.pBest.subtract(particle.pos)
                                       .scale(c2*Math.random());
    return particle.vel.scale(k)
                       .add(gBestComponent)
                       .add(pBestComponent);
}

let proto = {

    update(settings) {
        this.particles.forEach(p => {
            p.move(settings.dt);
            p.pBest = this.selectFittestPosition([p.pBest, p.pos]);
            p.vel = newVelocity(p, this.gBest, settings.c1,
                                settings.c2, settings.k);
        });
        this.gBest = this.calculateGBest();
    },

    calculateGBest() {
        return this.selectFittestPosition(this.particles.map(p => p.pBest));
    },
};

let PSO = {
    create(particles, fitnessFunction) {
        let pso = Object.assign(Object.create(proto), {
            particles: particles,
            fitnessFunction: fitnessFunction
        });
        pso.selectFittestPosition = Utils.maxBy.bind(null, fitnessFunction);
        pso.gBest = pso.calculateGBest();
        return pso;
    }
};


export {PSO};
