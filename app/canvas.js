
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
    }

};

export {Canvas};
