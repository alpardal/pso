import {Vector} from './vector';


var Canvas = function(dom_canvas){
    this.dom_canvas = dom_canvas;
    this.ctx = dom_canvas.getContext('2d');
    this.width = dom_canvas.width;
    this.height = dom_canvas.height;
};

Canvas.prototype.clearBackground = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
};

Canvas.prototype.fillCircle = function(pos, radius, color) {
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, radius, 0, 2*Math.PI);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
};

Canvas.prototype.drawLine = function(p1, p2, color) {
    this.drawLines([p1, p2], color);
};

Canvas.prototype.drawLines = function(points, color) {
    this.ctx.beginPath();
    this.ctx.closePath();

    for (var i = 0; i < points.length-1; i++) {
        var p1 = points[i],
            p2 = points[i+1];
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
    }

    this.ctx.strokeStyle = color;
    this.ctx.stroke();
};

Canvas.prototype.drawCross = function(pos, size, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x-size/2, pos.y);
    this.ctx.lineTo(pos.x+size/2, pos.y);
    this.ctx.moveTo(pos.x, pos.y-size/2);
    this.ctx.lineTo(pos.x, pos.y+size/2);
    this.ctx.closePath();
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
};

Canvas.prototype.addHoverTrackingFunction = function(fun) {
    this.dom_canvas.addEventListener('mousemove', function(event) {
        fun(new Vector({x: event.offsetX, y: event.offsetY}));
    });
};

export {Canvas};
