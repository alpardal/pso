let ffffff = Number.parseInt('ffffff', 16);

let Utils = {

    rand(min, max) {
        return min + Math.random() * (max - min);
    },

    randColor() {
        return '#' +
            Math.floor(Math.random()*ffffff).toString(16);
    },

    initArray(size, generator) {
        let array = [];
        for (let i = 0; i < size; i++) {
            array.push(generator());
        }
        return array;
    },

    maxBy(items, transform) {
        return items.map(i => (
            {item: i, value: transform(i)}
        )).reduce((best, current) => (
            (current.value > best.value) ? current : best
        )).item;
    },

    interpolate(value, oldMin, oldMax, newMin, newMax) {
        let ratio = (value - oldMin) / (oldMax - oldMin);
        return newMin + ratio * (newMax - newMin);
    }
};

export {Utils};
