import {Vector} from './vector';
import {Canvas} from './canvas';
import {Rand, Arrays} from './utils';

var Particle = function(pos, vel) {
    this.pos = pos;
    this.vel = vel;
};

Particle.prototype.move = function(dt) {
    this.pos = this.pos.add(this.vel.scale(dt));
};

var colors = ['green', 'blue', 'red', 'orange', 'teal', 'brown', 'yellow'],
    maxSpeed = 0.01;

Particle.createParticle = function() {
    var pos = new Vector({x: Rand.int(0, Canvas.width),
                          y: Rand.int(0, Canvas.height)}),
        vel = new Vector({x: Rand.float(-maxSpeed, maxSpeed),
                          y: Rand.float(-maxSpeed, maxSpeed)});
    var p = new Particle(pos, vel);
    p.pBest = p.pos;
    p.color = Arrays.sample(colors);
    return p;
}

export {Particle};
