import {Vector} from './vector';
import {Canvas} from './canvas';
import {Utils} from './utils';

var Particle = function(pos, vel) {
    this.pos = pos;
    this.posHistory = [pos];
    this.vel = vel;
};

Particle.prototype.move = function(dt) {
    this.pos = this.pos.add(this.vel.scale(dt));
    this.posHistory.push(this.pos);
};

Particle.getPos = function(particle) {
    return particle.pos;
};

var maxSpeed = 0.001;

Particle.createParticle = function() {
    var pos = new Vector({x: Utils.randInt(0, Canvas.width),
                          y: Utils.randInt(0, Canvas.height)});
    var p = new Particle(pos, Vector.ORIGIN);
    p.pBest = p.pos;
    p.color = Utils.randColor();
    return p;
}

export {Particle};
