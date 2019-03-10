'use strict';

let playerData;
let scoreboardState = nodecg.Replicant("scoreboard-state");
const PLACEHOLDER_ID = 0;

$(document).ready(function() {
    /* Set up input elements. */
    $("#player-1-name-dropdown").selectmenu();
    $("#player-1-score-spinner").spinner();
    $("#player-1-country-dropdown").selectmenu();

    $("#player-2-name-dropdown").selectmenu();
    $("#player-2-score-spinner").spinner();
    $("#player-2-country-dropdown").selectmenu();

    $("#update-button").button();
    $("#swap-button").button();

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

    $("#update-button").click(updateScoreboardState);
    $("#swap-button").click(swapPlayers);

    NodeCG.waitForReplicants(scoreboardState).then(() => {
        getPlayerData(function() {
            populatePlayerList();
        })

        populateCountryDropdowns();
        setupReplicants();

        nodecg.listenFor("playerDataUpdated", handlePlayerDataUpdated);

        /* Update the fields once a player is selected. */
        $("#player-1-name-dropdown").on("selectmenuselect", function(event, ui) {
            let id = $("#player-1-name-dropdown").find(":selected").val()

            if (id != PLACEHOLDER_ID) {
                updateFields(1, id);
            }
        });

        $("#player-2-name-dropdown").on("selectmenuselect", function(event, ui) {
            let id = $("#player-2-name-dropdown").find(":selected").val()

            if (id != PLACEHOLDER_ID) {
                updateFields(2, id);
            }
        });
    });
});

let handled = false;
function handlePlayerDataUpdated() {
    if (!handled) {
        let s = scoreboardState.value;
        let player1 = s.player1;
        let player2 = s.player2;

        getPlayerData(function() {
            populatePlayerList();

            let player1Index = playerData.findIndex(function(e) {
                return e.id == player1.id;
            });

            let player2Index = playerData.findIndex(function(e) {
                return e.id == player2.id;
            });

            console.log(playerData);
            console.log(player1.id, player2.id);
            console.log(player1Index, player2Index);

            if (player1Index != -1) {
                player1.name = playerData[player1Index].name;
                player1.sponsor = playerData[player1Index].sponsor;
                player1.country = playerData[player1Index].country;

                $("#player-1-name-dropdown").val(player1.id);
                $("#player-1-name-dropdown").selectmenu("refresh");
            } else {
                $("#player-1-name-dropdown option:eq(0)").prop("selected", true);
                $("#player-1-name-dropdown").selectmenu("refresh");
                updateFields(1, 0);
            }

            if (player2Index != -1) {
                player2.name = playerData[player2Index].name;
                player2.sponsor = playerData[player2Index].sponsor;
                player2.country = playerData[player2Index].country;

                $("#player-2-name-dropdown").val(player2.id);
                $("#player-2-name-dropdown").selectmenu("refresh");
            } else {
                $("#player-2-name-dropdown option:eq(0)").prop("selected", true);
                $("#player-2-name-dropdown").selectmenu("refresh");
                updateFields(2, 0);
            }
        })

        handled = true;
    } else {
        handled = false;
    }
}

function getPlayerData(callback) {
    nodecg.sendMessage("getPlayers", (err, result) => {
        if (err) {
            typeof callback === 'function' && callback(new Error(err));
        } else {
            playerData = result;
            typeof callback === 'function' && callback(new Error(err));
        }
    });
}

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

    $("#player-1-name-dropdown").val(player1.id);
    $("#player-1-name-dropdown").selectmenu("refresh");

    $("#player-1-name-text").val(player1.name);
    $("#player-1-sponsor-text").val(player1.sponsor);
    $("#player-1-score-spinner").val(player1.score);
    $("#player-1-country-dropdown").val(player1.country);
    $("#player-1-country-dropdown").selectmenu("refresh");


    $("#player-2-name-dropdown").val(player2.id);
    $("#player-2-name-dropdown").selectmenu("refresh");

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

    if ($("#player-1-name-dropdown").val() != PLACEHOLDER_ID) {
        player1.id      = $("#player-1-name-dropdown").val();
    }

    player1.name    = $("#player-1-name-text").val();
    player1.sponsor = $("#player-1-sponsor-text").val();
    player1.score   = $("#player-1-score-spinner").val();
    player1.country = $("#player-1-country-dropdown").val();

    if ($("#player-2-name-dropdown").val() != PLACEHOLDER_ID) {
        player2.id      = $("#player-2-name-dropdown").val();
    }

    player2.name    = $("#player-2-name-text").val();
    player2.sponsor = $("#player-2-sponsor-text").val();
    player2.score   = $("#player-2-score-spinner").val();
    player2.country = $("#player-2-country-dropdown").val();

    s.label = $("#label-text").val();
}

function swapPlayers() {
    let s = scoreboardState.value;
    let player1 = s.player1;
    let player2 = s.player2;

    [player1.id,player2.id] = [player2.id,player1.id];
    [player1.name,player2.name] = [player2.name,player1.name];
    [player1.sponsor,player2.sponsor] = [player2.sponsor,player1.sponsor];
    [player1.score,player2.score] = [player2.score,player1.score];
    [player1.country,player2.country] = [player2.country,player1.country];

    loadScoreboardState();
}

function clearSelectMenu(name) {
    $(name).find("option").remove().end();
    $(name).selectmenu("destroy").selectmenu({ style: "dropdown" });
}

function populatePlayerList() {
    clearSelectMenu("#player-1-name-dropdown");
    clearSelectMenu("#player-2-name-dropdown");

    $("#player-1-name-dropdown").append(new Option("Select player...", PLACEHOLDER_ID));
    $("#player-1-name-dropdown option:eq(0)").prop("selected", true);
    $("#player-2-name-dropdown").append(new Option("Select player...", PLACEHOLDER_ID));
    $("#player-2-name-dropdown option:eq(0)").prop("selected", true);

    playerData.forEach((player) =>{
        $("#player-1-name-dropdown").append(new Option(player.name, player.id));
        $("#player-2-name-dropdown").append(new Option(player.name, player.id));
    });

    $("#player-1-name-dropdown option:eq(0)").prop("selected", true);
    $("#player-1-name-dropdown").selectmenu("refresh");
    $("#player-2-name-dropdown option:eq(0)").prop("selected", true);
    $("#player-2-name-dropdown").selectmenu("refresh");
}

function updateFields(player, id, callback) {
    let index = playerData.findIndex(function(e) {
        return e.id == id;
    });

    if (index != -1) {
        $("#player-" + player + "-name-text").val(playerData[index].name);
        $("#player-" + player + "-sponsor-text").val(playerData[index].sponsor);
        $("#player-" + player + "-country-dropdown").val(playerData[index].country);
        $("#player-" + player + "-country-dropdown").selectmenu("refresh");

        typeof callback === 'function' && callback(null);
    } else {
        typeof callback === 'function' && callback(new Error("Unable to find player"));
    }
}
