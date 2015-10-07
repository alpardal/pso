var Utils = {

    randFloat: function(min, max) {
        return min + Math.random() * (max - min);
    },

    randInt: function(min, max) {
        return Math.round(Utils.randFloat(min, max));
    },

    randColor: function() {
        return '#' +
            Math.floor(Math.random()*16777215).toString(16);
    },

    initArray: function(size, generator) {
        var array = [];
        for (var i = 0; i < size; i++) {
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

    interpolate: function(value, max, newMin, newMax) {
        return newMin + (newMax - newMin) * value/max;
    },

    accessor: function(propName) {
        return function(item) { return item[propName]; };
    }
};

export {Utils};
