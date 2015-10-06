var inputs = {
    numberOfParticles: document.getElementById('numberOfParticles'),
    c1: document.getElementById('c1'),
    c2: document.getElementById('c2'),
    k: document.getElementById('k'),
    dt: document.getElementById('dt'),
    showGBest: document.getElementById('showGBest'),
    showTrace: document.getElementById('showTrace'),
    showVelocity: document.getElementById('showVelocity')
};

function intValue(field) {
    return Number.parseInt(field.value);
}

function floatValue(field) {
    return Number.parseFloat(field.value);
}

var Controls = function (changeSettings){
    this.changeSettings = changeSettings;

    Object.keys(inputs).forEach(function (k) {
        inputs[k].addEventListener('change', this.changed.bind(this));
    }, this);
};

Controls.prototype.changed = function() {
    this.changeSettings(this.currentSettings());
};

Controls.prototype.currentSettings = function() {
    return {
        numOfParticles: intValue(inputs.numberOfParticles),
        c1: floatValue(inputs.c1),
        c2: floatValue(inputs.c2),
        k: floatValue(inputs.k),
        dt: floatValue(inputs.dt),
        showGBest: inputs.showGBest.checked,
        showTrace: inputs.showTrace.checked,
        showVelocity: inputs.showVelocity.checked
    };
};

export {Controls};