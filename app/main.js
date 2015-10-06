import {Vector} from './vector';
import {Canvas} from './canvas';
import {Particle} from './particle';
import {Arrays} from './utils';

var numOfParticles = 10,
    particleSize = 2,
    goal = new Vector({x: Canvas.width/2, y: Canvas.height/2}),
    k = 0.8,
    c1 = 2,
    c2 = 1.5,
    dt = 0.001,
    gBest;

function bestPosition(goal, positions) {
    return positions.map(function (p) {
               return {position: p,
                       score: p.squareDistance(goal)};
           }).reduce(function(best, current) {
               return (current.score < best.score) ? current : best;
           }).position;
}

function newVelocity(particle, gBest) {
    var gBestComponent = gBest.subtract(particle.pos)
                              .scale(c1 * Math.random()),
        pBestComponent = particle.pBest.subtract(particle.pos)
                                        .scale(c2 * Math.random());
    return particle.vel.scale(k).add(gBestComponent).add(pBestComponent);

}

function renderParticle(particle) {
    Canvas.drawCross(gBest.x, gBest.y, 20, 'black');
    Canvas.fillCircle(particle.pos.x, particle.pos.y,
                      particleSize, particle.color);
}

function updateParticle(particle) {
    particle.move(dt);
    particle.pBest = bestPosition(goal, [particle.pBest, particle.pos]);
    particle.vel = newVelocity(particle, gBest);
}

function render(particles) {
    Canvas.clearBackground('white');
    particles.forEach(renderParticle);
}

function update(particles) {
    gBest = bestPosition(goal, particles.map(function(p) { return p.pBest; }));
    particles.forEach(updateParticle);
}

function closeEnough(gBest) {
    return gBest.squareDistance(goal) <= 1;
}

function loop(particles) {
    update(particles);
    render(particles);

    if (!closeEnough(gBest)) {
        window.requestAnimationFrame(loop.bind(null, particles));
    }
}

var particles = Arrays.range(1,numOfParticles).map(Particle.createParticle);
window.iterate = loop.bind(null, particles);
loop(particles);
