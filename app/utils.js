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

    range: function(min, max) {
        var array = [];

        for (var i = min; i <= max; i++) {
            array.push(i);
        }

        return array;
    }
};

export {Utils};
