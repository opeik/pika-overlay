'use strict';

module.exports = function (nodecg) {
    let scoreboardState = nodecg.Replicant("scoreboard", {defaultValue : {
        player1Name : "Player 1",
        player1Sponsor : "",
        player1Score : 0,
        player2Name : "Player 2",
        player2Sponsor : "",
        player2Score : 0,
        label : "Pools"
    }});
};
