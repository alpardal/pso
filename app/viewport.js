import {Utils} from './utils';
import {Vector} from './vector';

function Viewport(canvas, logicWidth) {
    this.screenWidth = canvas.width;
    this.screenHeight = canvas.height;
    this.logicWidth = logicWidth;
    this.logicHeight = logicWidth * this.screenHeight/this.screenWidth;
}

Viewport.prototype.toLogicCoordinates = function(screenPosition) {
    var logicX = Utils.interpolate(screenPosition.x, this.screenWidth,
                                   -this.logicWidth/2, this.logicWidth/2),
        logicY = Utils.interpolate(screenPosition.y, this.screenHeight,
                                   this.logicHeight/2, -this.logicHeight/2);

    return new Vector({x: logicX, y: logicY});
};

export {Viewport};
