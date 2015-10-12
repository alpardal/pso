var proto = {

    add(other) {
        return Vector.create({x: this.x + other.x,
                              y: this.y + other.y});
    },

    subtract(other) {
        return Vector.create({x: this.x - other.x,
                              y: this.y - other.y});
    },

    scale(factor) {
        return Vector.create({x: factor * this.x,
                              y: factor * this.y});
    },

    squareDistance(other) {
        return Math.pow(this.x - other.x, 2) +
                 Math.pow(this.y - other.y, 2);
    },

    toString() {
        return '(' + this.x.toFixed(2) + ', ' + this.y.toFixed(2) + ')';
    }
};

var Vector = {
    create(coords) {
        return Object.assign(Object.create(proto), {
            x: coords.x,
            y: coords.y
        });
    }
};

Vector.ORIGIN = Vector.create({x: 0, y: 0});


export {Vector};
