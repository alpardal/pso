
var proto = {
    move(dt) {
        this.pos = this.pos.add(this.vel.scale(dt));
        this.posHistory.push(this.pos);
    }
};

var Particle = {
    create(pos, vel, color) {
        return Object.assign(Object.create(proto), {
            pos: pos,
            vel: vel,
            posHistory: [pos],
            pBest: pos,
            color: color
        });
    }
};


export {Particle};
