import {Vector} from './vector';

let proto = {

    clearBackground() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    },

    fillCircle(pos, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius, 0, 2*Math.PI);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    },

    drawLine(p1, p2, color) {
        this.drawLines([p1, p2], color);
    },

    drawLines(points, color) {
        this.ctx.beginPath();
        this.ctx.closePath();

        for (let i = 0; i < points.length-1; i++) {
            let p1 = points[i],
                p2 = points[i+1];
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
        }

        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    },

    drawCross(pos, size, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x-size/2, pos.y);
        this.ctx.lineTo(pos.x+size/2, pos.y);
        this.ctx.moveTo(pos.x, pos.y-size/2);
        this.ctx.lineTo(pos.x, pos.y+size/2);
        this.ctx.closePath();
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    },

    addHoverTrackingFunction(fun) {
        this.dom_canvas.addEventListener('mousemove', event => {
            fun(Vector.create({x: event.offsetX, y: event.offsetY}));
        });
    }
};

let Canvas = {
    create(dom_canvas) {
        return Object.assign(Object.create(proto), {
            dom_canvas: dom_canvas,
            ctx: dom_canvas.getContext('2d'),
            width: dom_canvas.width,
            height: dom_canvas.height
        });
    }
};


export {Canvas};
