import {Canvas} from './canvas';
import {Vector} from './vector';
import {App} from './app';

var goal = new Vector({x: Canvas.width/2, y: Canvas.height/2}),
    app = new App(goal, Canvas);
app.init();
