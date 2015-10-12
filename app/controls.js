var inputs = {
        numberOfParticles: document.getElementById('numberOfParticles'),
        c1: document.getElementById('c1'),
        c2: document.getElementById('c2'),
        k: document.getElementById('k'),
        dt: document.getElementById('dt'),
        maxIterations: document.getElementById('maxIterations'),
        showGBest: document.getElementById('showGBest'),
        showPBest: document.getElementById('showPBest'),
        showTrace: document.getElementById('showTrace'),
        showVelocity: document.getElementById('showVelocity')
    },
    buttons = {
        run: document.getElementById('runButton'),
        step: document.getElementById('stepButton')
    }

function intValue(field) {
    return Number.parseInt(field.value);
}

function floatValue(field) {
    return Number.parseFloat(field.value);
}

var proto = {
    changed() {
        this.changeSettings(this.currentSettings());
    },

    currentSettings() {
        return {
            numOfParticles: intValue(inputs.numberOfParticles),
            c1: floatValue(inputs.c1),
            c2: floatValue(inputs.c2),
            k: floatValue(inputs.k),
            dt: floatValue(inputs.dt),
            maxIterations: intValue(inputs.maxIterations),
            showGBest: inputs.showGBest.checked,
            showPBest: inputs.showPBest.checked,
            showTrace: inputs.showTrace.checked,
            showVelocity: inputs.showVelocity.checked
        };
    }
};

var Controls = {
    create(changeSettings, run, step) {
        var c = Object.create(proto);
        c.changeSettings = changeSettings;

        Object.keys(inputs).forEach(k => {
            inputs[k].addEventListener('change', c.changed.bind(c));
        });

        buttons.run.addEventListener('click', run);
        buttons.step.addEventListener('click', step);

        return c;
    }
};


export {Controls};
