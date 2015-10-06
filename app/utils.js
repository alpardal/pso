var Rand = {

    float: function(min, max) {
        return min + Math.random() * (max - min);
    },

    int: function(min, max) {
        return Math.round(Rand.float(min, max));
    }
};

var Arrays = {

    sample: function(array) {
        return array[Rand.int(0, array.length-1)];
    },

    range: function(min, max) {
        var array = [];

        for (var i = min; i <= max; i++) {
            array.push(i);
        }

        return array;
    }
};


export {Rand, Arrays};
