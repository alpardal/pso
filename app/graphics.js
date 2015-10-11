import {Vector} from './vector';
import {Utils} from './utils';
import {Particle} from './particle';

function Graphics(canvas) {
    this.canvas = canvas;
    this.minX = -12;
    this.maxX = -this.minX;
    this.minY = this.minX * canvas.height/canvas.width;
    this.maxY = -this.minY;
    this.xSpan = this.maxX - this.minX;
    this.ySpan = this.maxY - this.minY;
}

Graphics.particleSize = 2;
Graphics.gBestCrossColor = 'black';
Graphics.gBestCrossSize = 20;
Graphics.pBestCrossSize = 10;

Graphics.prototype.randomParticle = function() {
    return new Particle(this._randomPosition(), Vector.ORIGIN,
                        Utils.randColor());
};

Graphics.prototype.toScreenCoordinates = function(pos) {
    var x = Utils.interpolate(pos.x, this.minX, this.maxX,
                                     0, this.canvas.width),
        y = Utils.interpolate(pos.y, this.minY, this.maxY,
                                     0, this.canvas.height);
    return new Vector({x: x, y: y});
};

Graphics.prototype.fromScreenCoordinates = function(screenPos) {
    var x = Utils.interpolate(screenPos.x, 0, this.canvas.width,
                                           this.minX, this.maxX),
        y = Utils.interpolate(screenPos.y, 0, this.canvas.height,
                                           this.minY, this.maxY);
    return new Vector({x: x, y: y});
};

Graphics.prototype.drawBackground = function() {
    this.canvas.clearBackground();
    this._drawGrid();
};

Graphics.prototype.drawGBest = function(gBest) {
    this.canvas.drawCross(this.toScreenCoordinates(gBest),
                          Graphics.gBestCrossSize,
                          Graphics.gBestCrossColor);
};

Graphics.prototype.drawParticle = function(particle) {
    this.canvas.fillCircle(this.toScreenCoordinates(particle.pos),
                           Graphics.particleSize, particle.color);
};

Graphics.prototype.drawTrace = function(particle) {
    this.canvas.drawLines(particle.posHistory.map(this.toScreenCoordinates.bind(this)),
                          particle.color);
};

Graphics.prototype.drawVelocity = function(particle) {
    var from = this.toScreenCoordinates(particle.pos),
        to = this.toScreenCoordinates(particle.pos.add(particle.vel.scale(0.1)));
    this.canvas.drawLine(from, to, 'darkgray');
};

Graphics.prototype.drawPBest = function(particle) {
    this.canvas.drawCross(this.toScreenCoordinates(particle.pBest),
                          Graphics.pBestCrossSize, particle.color);
};

Graphics.prototype._drawGrid = function() {
    this.canvas.drawLine({x: this.canvas.width/2, y: 0},
                         {x: this.canvas.width/2, y: this.canvas.height}
                         , 'white');
    this.canvas.drawLine({x: 0, y: this.canvas.height/2},
                         {x: this.canvas.width, y: this.canvas.height/2},
                         'white');
};

Graphics.prototype._randomPosition = function() {
    return new Vector({x: Utils.rand(this.minX, this.maxX),
                       y: Utils.rand(this.minY, this.maxY)});
};

export {Graphics};
