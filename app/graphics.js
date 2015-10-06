function Graphics(canvas) {
    this.canvas = canvas;
}

Graphics.particleSize = 2;

Graphics.prototype.drawBackground = function() {
    this.canvas.clearBackground();
    this._drawGrid();
};

Graphics.prototype.drawGBest = function(gBest) {
    this.canvas.drawCross(gBest.x, gBest.y, 20, 'black');
};

Graphics.prototype.drawParticle = function(particle) {
    this.canvas.fillCircle(particle.pos.x, particle.pos.y,
                           Graphics.particleSize, particle.color);
};

Graphics.prototype.drawTrace = function(particle) {
    this.canvas.drawLines(particle.posHistory, particle.color);
};

Graphics.prototype.drawVelocity = function(particle) {
    this.canvas.drawLine(particle.pos,
                         particle.pos.add(particle.vel.scale(0.1)),
                         'darkgray');
};

Graphics.prototype._drawGrid = function() {
    this.canvas.drawLine({x: this.canvas.width/2, y: 0},
                         {x: this.canvas.width/2, y: this.canvas.height}
                         , 'white');
    this.canvas.drawLine({x: 0, y: this.canvas.height/2},
                         {x: this.canvas.width, y: this.canvas.height/2},
                         'white');
};

export {Graphics};
