'use strict';

let scoreboardState = nodecg.Replicant("scoreboard-state");

$(document).ready(function() {
    /* Set up input elements. */
    $("#player-1-name-dropdown").selectmenu();
    $("#player-1-score-spinner").spinner();
    $("#player-1-country-dropdown").selectmenu();

    $("#player-2-name-dropdown").selectmenu();
    $("#player-2-score-spinner").spinner();
    $("#player-2-country-dropdown").selectmenu();

    $("#update-button").button();
    $("#switch-button").button();

    $("input").addClass("ui-widget ui-widget-content ui-corner-all");
    $("#label-text").css({
        "width" : "140px",
        "height" : "25px",
        "text-align" : "center"
    });

    $("#player-1-sponsor-text").css({
        "width" : "70px",
        "height" : "25px",
        "text-align" : "center"
    });

    $("#player-1-name-text").css({
        "width" : "150px",
        "height" : "25px",
        "text-align" : "center"
    });

    $("#player-2-sponsor-text").css({
        "width" : "70px",
        "height" : "25px",
        "text-align" : "center"
    });

    $("#player-2-name-text").css({
        "width" : "150px",
        "height" : "25px",
        "text-align" : "center"
    });

    $("#update-button").click(function() {
        updateScoreboardState();
    });

    $("#switch-button").click(function() {
        switchPlayers();
    });

    populateCountryDropdowns();
    setupReplicants();
});

function populateCountryDropdowns() {
    country.data.forEach((entry) =>{
        $("#player-1-country-dropdown").append(new Option(entry.name, entry.code));
        $("#player-2-country-dropdown").append(new Option(entry.name, entry.code));
    });

    $("#player-1-country-dropdown option:eq(0)").prop("selected", true);
    $("#player-1-country-dropdown").selectmenu("refresh");
    $("#player-2-country-dropdown option:eq(0)").prop("selected", true);
    $("#player-2-country-dropdown").selectmenu("refresh");
}

function setupReplicants() {
    scoreboardState.on("change", (newValue, oldValue) => {
        loadScoreboardState();
    });

    NodeCG.waitForReplicants(scoreboardState).then(() => {
        loadScoreboardState();
    });
}

function loadScoreboardState() {
    let s = scoreboardState.value;
    let player1 = s.player1;
    let player2 = s.player2;

    $("#player-1-name-text").val(player1.name);
    $("#player-1-sponsor-text").val(player1.sponsor);
    $("#player-1-score-spinner").val(player1.score);
    $("#player-1-country-dropdown").val(player1.country);
    $("#player-1-country-dropdown").selectmenu("refresh");

    $("#player-2-name-text").val(player2.name);
    $("#player-2-sponsor-text").val(player2.sponsor);
    $("#player-2-score-spinner").val(player2.score);
    $("#player-2-country-dropdown").val(player2.country);
    $("#player-2-country-dropdown").selectmenu("refresh");

    $("#label-text").val(s.label);
}

function updateScoreboardState() {
    let s = scoreboardState.value;
    let player1 = s.player1;
    let player2 = s.player2;

    player1.name    = $("#player-1-name-text").val();
    player1.sponsor = $("#player-1-sponsor-text").val();
    player1.score   = $("#player-1-score-spinner").val();
    player1.country = $("#player-1-country-dropdown").val();

    player2.name   = $("#player-2-name-text").val();
    player2.sponsor = $("#player-2-sponsor-text").val();
    player2.score   = $("#player-2-score-spinner").val();
    player2.country = $("#player-2-country-dropdown").val();

    s.label = $("#label-text").val();
}

function switchPlayers() {
    let s = scoreboardState.value;
    let player1 = s.player1;
    let player2 = s.player2;

    [player1.name,player2.name] = [player2.name,player1.name];
    [player1.sponsor,player2.sponsor] = [player2.sponsor,player1.sponsor];
    [player1.score,player2.score] = [player2.score,player1.score];
    [player1.country,player2.country] = [player2.country,player1.country];

    loadScoreboardState();
}
