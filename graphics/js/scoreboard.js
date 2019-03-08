'use strict';

$(document).ready(function() {
    let scoreboardState = nodecg.Replicant("scoreboard");

    scoreboardState.on('change', (newValue, oldValue) => {
        updateScoreboard(newValue, oldValue);
    });

    function updateScoreboard(newValue, oldValue) {
        $('#player-1-name').text(newValue.player1Name);
        $('#player-1-sponsor').text(newValue.player1Sponsor);
        $('#player-1-score').text(newValue.player1Score);

        $('#player-2-name').text(newValue.player2Name);
        $('#player-2-sponsor').text(newValue.player2Sponsor);
        $('#player-2-score').text(newValue.player2Score);

        $('#label-text').text(newValue.label);
    }
});
