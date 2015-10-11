
var Particle = function(pos, vel, color) {
    this.pos = pos;
    this.vel = vel;
    this.posHistory = [pos];
    this.pBest = this.pos;
    this.color = color;
};

Particle.prototype.move = function(dt) {
    this.pos = this.pos.add(this.vel.scale(dt));
    this.posHistory.push(this.pos);
};

export {Particle};
