import {Canvas} from './canvas';
import {App} from './app';

let canvas = Canvas.create(document.getElementById('drawing-canvas')),
    app = App.create(canvas);
app.init();
