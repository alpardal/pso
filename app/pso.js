import {Utils} from './utils';

let proto = {

    update(settings) {
        this.particles.forEach(p => {
            p.move(settings.dt);
            p.pBest = this._fittestPosition([p.pBest, p.pos]);
            p.vel = this._newVelocity(p, this.gBest, settings.c1,
                                      settings.c2, settings.k);
        });
        this.gBest = this._calculateGBest();
    },

    _calculateGBest() {
        return this._fittestPosition(this.particles.map(Utils.accessor('pBest')));
    },

    _fittestPosition(positions) {
        return Utils.maxBy(positions, this.fitnessFunction);
    },

    _newVelocity(particle, gBest, c1, c2, k) {
        let gBestComponent = gBest.subtract(particle.pos)
                                  .scale(c1*Math.random()),
            pBestComponent = particle.pBest.subtract(particle.pos)
                                           .scale(c2*Math.random());
        return particle.vel.scale(k)
                           .add(gBestComponent)
                           .add(pBestComponent);
    }
};

let PSO = {
    create(particles, fitnessFunction) {
        let pso = Object.assign(Object.create(proto), {
            particles: particles,
            fitnessFunction: fitnessFunction
        });
        pso.gBest = pso._calculateGBest();
        return pso;
    }
};


export {PSO};
