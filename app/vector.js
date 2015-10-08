var Vector = function(coords) {
    this.x = coords.x;
    this.y = coords.y;
};

Vector.ORIGIN = new Vector({x: 0, y: 0});

Vector.prototype.add = function(other) {
    return new Vector({x: this.x + other.x,
                       y: this.y + other.y});
};

Vector.prototype.subtract = function(other) {
    return new Vector({x: this.x - other.x,
                       y: this.y - other.y});
};

Vector.prototype.scale = function(factor) {
    return new Vector({x: factor * this.x,
                       y: factor * this.y});
};

Vector.prototype.squareDistance = function(other) {
    return Math.pow(this.x - other.x, 2) +
            Math.pow(this.y - other.y, 2);
};

Vector.prototype.toString = function() {
    return '(' + this.x.toFixed(2) + ', ' + this.y.toFixed(2) + ')';
};

export {Vector};
