'use strict';

var playerData;

$(document).ready(function() {
    $("#player-dropdown").selectmenu({ style: "dropdown" });
    $("#player-country-dropdown").selectmenu({ style: "dropdown" });

    $("#create-button").button();
    $("#modify-button").button();
    $("#remove-button").button();

    $("#player-name-text").addClass("ui-widget ui-widget-content ui-corner-all");
    $("#player-sponsor-text").addClass("ui-widget ui-widget-content ui-corner-all");


    $("#player-name-text").css({
        "width" : "230px",
        "height" : "20px",
    });

    $("#player-sponsor-text").css({
        "width" : "230px",
        "height" : "20px",
    });

    /* Populate the country dropdown. */
    populateCountryDropdown();

    /* Get all players. */
    updatePlayerList();

    /* Update the fields once a player is selected. */
    $("#player-dropdown").on("selectmenuselect", function(event, ui) {
        let id = $("#player-dropdown").find(":selected").val()
        updateFields(id);
    });

    /* Register click events. */
    $("#create-button").click(createPlayer);
    $("#modify-button").click(modifyPlayer);
    $("#remove-button").click(removePlayer);
});

function clearSelectMenu(name) {
    $(name).find("option").remove().end();
    $(name).selectmenu("destroy").selectmenu({ style: "dropdown" });
}

function updatePlayerList() {
    clearSelectMenu("#player-dropdown");

    nodecg.sendMessage("getPlayers", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            playerData = result;

            playerData.forEach((player) =>{
                $("#player-dropdown").append(new Option(player.name, player.id));
            });

            $("#player-dropdown option:eq(0)").prop("selected", true);
            $("#player-dropdown").selectmenu("refresh");

            let id = $("#player-dropdown").find(":selected").val()
            updateFields(id);
        }
    });
}

function updateFields(id) {
    let index = playerData.findIndex(function(e) {
        return e.id == id;
    });

    if (index != -1) {
        $("#player-name-text").val(playerData[index].name);
        $("#player-sponsor-text").val(playerData[index].sponsor);
        $("#player-country-dropdown").val(playerData[index].country);
        $("#player-country-dropdown").selectmenu("refresh");
    } else {
        console.log("Unable to find player");
    }
}

function populateCountryDropdown() {
    country.data.forEach((entry) =>{
        $("#player-country-dropdown").append(new Option(entry.name, entry.code));
    });

    $("#player-country-dropdown option:eq(0)").prop("selected", true);
    $("#player-country-dropdown").selectmenu("refresh");
}

function createPlayer() {
    let name = $("#player-name-text").val();
    let sponsor = $("#player-sponsor-text").val();
    let country = $("#player-country-dropdown").val();

    console.log(name, sponsor, country);

    nodecg.sendMessage("createPlayer", {name, sponsor, country}, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Created successfully!")
            updatePlayerList();
        }
    });
}

function modifyPlayer() {
    let id = $("#player-dropdown").val();
    let name = $("#player-name-text").val();
    let sponsor = $("#player-sponsor-text").val();
    let country = $("#player-country-dropdown").val();

    nodecg.sendMessage("modifyPlayer", {id, name, sponsor, country}, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Modified successfully!")
            updatePlayerList();

            //$("#player-dropdown").val(id);
            //$("#player-dropdown").selectmenu("refresh");
        }
    });
}

function removePlayer() {
    console.log("remove");
}
