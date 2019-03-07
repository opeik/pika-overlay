'use strict';

$(document).ready(function() {
    /* Set up input elements. */
    $("#player-1-name-dropdown").selectmenu();
    $("#player-2-name-dropdown").selectmenu();
    $("#player-1-score-spinner").spinner();
    $("#player-2-score-spinner").spinner();
    $("#update-button").button();
    $("#switch-button").button();

    $("input").addClass("ui-widget ui-widget-content ui-corner-all");
    $("#label-text").css({
        "width" : "140px",
        "height" : "25px",
        "text-align" : "center"
    });

    let scoreboardState = nodecg.Replicant("scoreboard");

    scoreboardState.on('change', (newValue, oldValue) => {
        loadScoreboardState();
    });

    NodeCG.waitForReplicants(scoreboardState).then(() => {
        loadScoreboardState();
    });

    $('#update-button').click(function() {
        updateScoreboardState();
    });

    function loadScoreboardState() {
        let s = scoreboardState.value;

        $('#player-1-score-spinner').val(s.player1Score);
        $('#player-2-score-spinner').val(s.player2Score);
        $('#label-text').val(s.label);
    }

    function updateScoreboardState() {
        let s = scoreboardState.value;

        s.player1Name = $('#player-1-name-dropdown').find("option:selected").text();
        s.player2Name = $('#player-2-name-dropdown').find("option:selected").text();
        s.player1Score = $('#player-1-score-spinner').val();
        s.player2Score = $('#player-2-score-spinner').val();
        s.label = $('#label-text').val();
    }
});
