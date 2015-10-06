var PSO = {

    bestPosition: function(goal, positions) {
        return positions.map(function (p) {
                   return {position: p,
                           score: p.squareDistance(goal)};
               }).reduce(function(best, current) {
                   return (current.score < best.score) ? current : best;
               }).position;
    },

    newVelocity: function(particle, gBest, c1, c2, k) {
        var gBestComponent = gBest.subtract(particle.pos)
                                  .scale(c1*Math.random()),
            pBestComponent = particle.pBest.subtract(particle.pos)
                                           .scale(c2*Math.random());
        return particle.vel.scale(k)
                           .add(gBestComponent)
                           .add(pBestComponent);
    }
};

export {PSO};
