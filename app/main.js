import {Canvas} from './canvas';
import {App} from './app';

var app = new App(new Canvas(document.getElementById('drawing-canvas')));
app.init();
