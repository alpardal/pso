import {Controls} from './controls';
import {Graphics} from './graphics';
import {Utils} from './utils';
import {PSO} from './pso';
import {Logger} from './logger';

function sombrero(position) {
    let x2 = position.x * position.x,
        y2 = position.y * position.y;
    return 6 * Math.cos(Math.sqrt(x2 + y2)) / (x2 + y2 + 6);
}

let proto = {

    init() {
        this._reset();
        this._loop();
    },

    _reset() {
        this.currentIterations = 0;
        let particles = Utils.initArray(this.settings.numOfParticles,
                                        this.graphics.randomParticle.bind(this.graphics));
        this.pso = PSO.create(particles, this.fitnessFunction);
        Logger.clear();
    },

    run() {
        if (this._reachedMaxIterations()) { this._reset(); }
        if (this.running) { this._reset(); }
        this.running = true;
    },

    step() {
        if (this._reachedMaxIterations()) { this._reset(); }
        this.running = false;
        this._update();
    },

    _loop() {
        this._render();

        if (this.running) {
            this._update();
        }

        if (this._reachedMaxIterations()){
            this.running = false;
        }

        window.requestAnimationFrame(this._loop.bind(this));
    },

    _reachedMaxIterations() {
        return this.currentIterations > this.settings.maxIterations;
    },

    _update() {
        this.currentIterations++;
        this.pso.update(this.settings);
        this._logGBest();
    },

    _render() {
        this.graphics.drawBackground();

        this.pso.particles.forEach(p => {
            this.graphics.drawParticle(p);
            this.drawTrace(p);
            this.drawVelocity(p);
            this.drawPBest(p);
        });

        this.drawGBest(this.pso.gBest);
    },

    _logGBest() {
        let value = this.fitnessFunction(this.pso.gBest);
        Logger.setText(`Valor máximo atual: ${value.toFixed(5)}` +
          ` em ${this.pso.gBest}`);
    },

    _logScreenPosition(screenPos) {
        let pos = this.graphics.fromScreenCoordinates(screenPos);
        console.log(`${this.fitnessFunction(pos).toFixed(5)} @ ${pos}`);
    },

    _settingsChanged(settings) {
        this.settings = settings;
        this.drawTrace = settings.showTrace ?
                            this.graphics.drawTrace.bind(this.graphics) :
                            Utils.doNothing;
        this.drawVelocity = settings.showVelocity ?
                                this.graphics.drawVelocity.bind(this.graphics) :
                                Utils.doNothing;
        this.drawPBest = settings.showPBest ?
                            this.graphics.drawPBest.bind(this.graphics) :
                            Utils.doNothing;

        this.drawGBest = settings.showGBest ?
                            this.graphics.drawGBest.bind(this.graphics) :
                            Utils.doNothing;
    }
};

let App = {
    create(canvas) {
        let app = Object.create(proto);
        app.controls = Controls.create(app._settingsChanged.bind(app),
                                       app.run.bind(app),
                                       app.step.bind(app));
        app.graphics = Graphics.create(canvas);
        app.fitnessFunction = sombrero;
        app.running = false;
        app.controls.changed();
        canvas.addHoverTrackingFunction(app._logScreenPosition.bind(app));

        return app;
    }
};


export {App};
