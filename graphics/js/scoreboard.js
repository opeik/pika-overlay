'use strict';

$(document).ready(function() {
    let scoreboardState = nodecg.Replicant("scoreboard-state");

    scoreboardState.on('change', (newValue, oldValue) => {
        updateScoreboard(newValue, oldValue);
    });

    function updateScoreboard(newValue, oldValue) {
        let player1 = newValue.player1;
        let player2 = newValue.player2;
        let label = newValue.label;
        console.log(label);

        $('#player-1-name').text(player1.name);
        $('#player-1-sponsor').text(player1.sponsor);
        $('#player-1-score').text(player1.score);

        $('#player-2-name').text(player2.name);
        $('#player-2-sponsor').text(player2.sponsor);
        $('#player-2-score').text(player2.score);

        $('#label-text').text(label);
    }
});
