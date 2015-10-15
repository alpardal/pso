import {Vector} from './vector';
import {Utils} from './utils';
import {Particle} from './particle';

let proto = {

    randomParticle() {
        return Particle.create(this._randomPosition(), Vector.ORIGIN,
                               Utils.randColor());
    },

    toScreenCoordinates(pos) {
        let x = Utils.interpolate(pos.x, this.minX, this.maxX,
                                         0, this.canvas.width),
            y = Utils.interpolate(pos.y, this.minY, this.maxY,
                                         0, this.canvas.height);
        return Vector.create({x: x, y: y});
    },

    fromScreenCoordinates(screenPos) {
        let x = Utils.interpolate(screenPos.x, 0, this.canvas.width,
                                               this.minX, this.maxX),
            y = Utils.interpolate(screenPos.y, 0, this.canvas.height,
                                               this.minY, this.maxY);
        return Vector.create({x: x, y: y});
    },

    drawBackground() {
        this.canvas.clearBackground();
        this._drawGrid();
    },

    drawGBest(gBest) {
        this.canvas.drawCross(this.toScreenCoordinates(gBest),
                              Graphics.gBestCrossSize,
                              Graphics.gBestCrossColor);
    },

    drawParticle(particle) {
        this.canvas.fillCircle(this.toScreenCoordinates(particle.pos),
                               Graphics.particleSize, particle.color);
    },

    drawTrace(particle) {
        let points = particle.posHistory
                             .map(this.toScreenCoordinates.bind(this));
        this.canvas.drawLines(points, particle.color);
    },

    drawVelocity(particle) {
        let from = this.toScreenCoordinates(particle.pos),
            to = this.toScreenCoordinates(
                            particle.pos.add(particle.vel.scale(0.1)));
        this.canvas.drawLine(from, to, 'darkgray');
    },

    drawPBest(particle) {
        this.canvas.drawCross(this.toScreenCoordinates(particle.pBest),
                              Graphics.pBestCrossSize, particle.color);
    },

    _drawGrid() {
        this.canvas.drawLine({x: this.canvas.width/2, y: 0},
                             {x: this.canvas.width/2,
                              y: this.canvas.height} , 'white');
        this.canvas.drawLine({x: 0, y: this.canvas.height/2},
                             {x: this.canvas.width,
                              y: this.canvas.height/2}, 'white');
    },

    _randomPosition() {
        return Vector.create({x: Utils.rand(this.minX, this.maxX),
                              y: Utils.rand(this.minY, this.maxY)});
    }
};

let Graphics = {
    create(canvas) {
        let g = Object.create(proto);
        g.canvas = canvas;
        g.minX = -12;
        g.maxX = -g.minX;
        g.minY = g.minX * canvas.height/canvas.width;
        g.maxY = -g.minY;
        g.xSpan = g.maxX - g.minX;
        g.ySpan = g.maxY - g.minY;

        return g;
    }
};

Graphics.particleSize = 2;
Graphics.gBestCrossColor = 'black';
Graphics.gBestCrossSize = 20;
Graphics.pBestCrossSize = 10;


export {Graphics};
