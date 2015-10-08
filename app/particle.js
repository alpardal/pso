import {Vector} from './vector';
import {Canvas} from './canvas';
import {Utils} from './utils';

var Particle = function(pos) {
    this.pos = pos;
    this.vel = Vector.ORIGIN;
    this.posHistory = [pos];
    this.pBest = this.pos;
    this.color = Utils.randColor();
};

Particle.prototype.move = function(dt) {
    this.pos = this.pos.add(this.vel.scale(dt));
    this.posHistory.push(this.pos);
};

Particle.createParticle = function() {
    return new Particle(randomPosition());
};

function randomPosition() {
    return new Vector({x: Utils.randInt(0, Canvas.width),
                       y: Utils.randInt(0, Canvas.height)});
}

export {Particle};
