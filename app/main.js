import {Particle} from './particle';
import {Rand, Arrays} from './utils';
import {Canvas} from './canvas';

var numOfParticles = 10,
    particleSize = 2;

function drawParticle(p) {
    Canvas.fillCircle(p.pos.x, p.pos.y, particleSize, p.color);
}

function render(particles) {
    Canvas.clearBackground('white');
    particles.forEach(drawParticle);
}

function moveParticle(particle) {
    particle.pos = {
        x: particle.pos.x + particle.vel.vx,
        y: particle.pos.y + particle.vel.vy
    }
};

function update(particles) {
    particles.forEach(moveParticle);
}

function loop(particles) {
    render(particles);
    update(particles);
    window.requestAnimationFrame(loop.bind(null, particles));
}

var particles = Arrays.range(1,numOfParticles).map(Particle.createParticle);
loop(particles);
