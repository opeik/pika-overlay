'use strict';

$(document).ready(function() {
    let player1NameDropdown = $("#player-1-name-dropdown").selectmenu();
    let player2NameDropdown = $("#player-2-name-dropdown").selectmenu();

    let player1ScoreSpinner = $("#player-1-score-spinner").spinner();
    let player2ScoreSpinner = $("#player-2-score-spinner").spinner();

    let updateButton = $("#update-button").button();
    let switchButton = $("#switch-button").button();

    $("input").addClass("ui-widget ui-widget-content ui-corner-all");
    $("#label-text").css({
        "width" : "120px",
        "height" : "25px",
        "text-align" : "center"
    });
});
