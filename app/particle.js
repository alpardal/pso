import {Canvas} from './canvas';
import {Rand, Arrays} from './utils';

var Particle = function(pos, vel) {
    this.pos = pos;
    this.vel = vel;
};

var colors = ['green', 'blue', 'red', 'orange', 'teal', 'brown', 'yellow'],
    maxSpeed = 1;

Particle.createParticle = function() {
    var p = new Particle({x: Rand.int(0, Canvas.width),
                          y: Rand.int(0, Canvas.height)},
                         {vx: Rand.float(-maxSpeed, maxSpeed),
                          vy: Rand.float(-maxSpeed, maxSpeed)});
    p.pBest = p.pos;
    p.color = Arrays.sample(colors);
    return p;
}

export {Particle};
