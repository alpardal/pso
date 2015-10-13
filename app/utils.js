let ffffff = Number.parseInt('ffffff', 16);

let Utils = {

    rand: function(min, max) {
        return min + Math.random() * (max - min);
    },

    randColor: function() {
        return '#' +
            Math.floor(Math.random()*ffffff).toString(16);
    },

    initArray: function(size, generator) {
        let array = [];
        for (let i = 0; i < size; i++) {
            array.push(generator());
        }
        return array;
    },

    maxBy: function(items, transform) {
        return items.map(function(i) {
            return {item: i, value: transform(i)};
        }).reduce(function(best, current) {
            return (current.value > best.value) ? current : best;
        }).item;
    },

    interpolate: function(value, oldMin, oldMax, newMin, newMax) {
        let ratio = (value - oldMin) / (oldMax - oldMin);
        return newMin + ratio * (newMax - newMin);
    },

    accessor: function(propName) {
        return function(item) { return item[propName]; };
    }
};

export {Utils};
