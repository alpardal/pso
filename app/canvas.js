
var canvas = document.getElementById('drawing-canvas'),
    ctx = canvas.getContext('2d');

var Canvas = {

    width: canvas.width,

    height: canvas.height,

    clearBackground: function(color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, this.width, this.height)
    },

    fillCircle: function(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    },

    drawLines: function(points, color) {
        ctx.beginPath();
        ctx.closePath();

        for (var i = 0; i < points.length-1; i++) {
            var p1 = points[i],
                p2 = points[i+1];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }

        ctx.strokeStyle = color;
        ctx.stroke();
    },

    drawCross: function(x, y, size, color) {
        ctx.beginPath();
        ctx.moveTo(x-size/2, y);
        ctx.lineTo(x+size/2, y);
        ctx.moveTo(x, y-size/2);
        ctx.lineTo(x, y+size/2);
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.stroke();
    }

};

export {Canvas};
