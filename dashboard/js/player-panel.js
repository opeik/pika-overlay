'use strict';

let playerData;
let lastId = 0;

const NEW_PLAYER_ID = 0;

$(document).ready(function() {
    $("#player-dropdown").selectmenu({ style: "dropdown" });
    $("#player-country-dropdown").selectmenu({ style: "dropdown" });

    $("#submit-button").button();
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

    $("#player-modified-dialog").dialog({
        modal: true,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
            }
        }
    });

    /* Populate the country dropdown. */
    populateCountryDropdown();

    /* Get all players. */
    updatePlayerList();

    /* Update the fields once a player is selected. */
    $("#player-dropdown").on("selectmenuselect", function(event, ui) {
        let id = $("#player-dropdown").find(":selected").val()

        if (lastId != id) {
            updateFields(id);
            lastId = id;
        }
    });

    /* Register click events. */
    $("#submit-button").click(submitPlayer);
    $("#remove-button").click(removePlayer);
});

function clearFields() {
    $("#player-name-text").val("");
    $("#player-sponsor-text").val("");
    $("#player-country-dropdown option:eq(0)").prop("selected", true);
    $("#player-country-dropdown").selectmenu("refresh");
}

function clearSelectMenu(name) {
    $(name).find("option").remove().end();
    $(name).selectmenu("destroy").selectmenu({ style: "dropdown" });
}

function updatePlayerList(callback) {
    clearSelectMenu("#player-dropdown");

    clearFields();
    $("#player-dropdown").append(new Option("Create new player...", NEW_PLAYER_ID));
    $("#player-dropdown option:eq(0)").prop("selected", true);
    $("#player-dropdown").selectmenu("refresh");

    nodecg.sendMessage("getPlayers", (err, result) => {
        if (err) {
            typeof callback === 'function' && callback(new Error(err));
        } else {
            playerData = result;

            playerData.forEach((player) =>{
                $("#player-dropdown").append(new Option(player.name, player.id));
            });

            $("#player-dropdown").selectmenu("refresh");
            typeof callback === 'function' && callback(new Error(err));
        }
    });

    nodecg.sendMessage("playerDataUpdated");
}

function updateFields(id, callback) {
    if (id == NEW_PLAYER_ID) {
        clearFields();
    } else {
        let index = playerData.findIndex(function(e) {
            return e.id == id;
        });

        if (index != -1) {
            $("#player-name-text").val(playerData[index].name);
            $("#player-sponsor-text").val(playerData[index].sponsor);
            $("#player-country-dropdown").val(playerData[index].country);
            $("#player-country-dropdown").selectmenu("refresh");

            typeof callback === 'function' && callback(null);
        } else {
            typeof callback === 'function' && callback(new Error("Unable to find player"));
        }
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

    nodecg.sendMessage("createPlayer", {name, sponsor, country}, (err, result) => {
        let newId = result.lastID;

        if (err) {
            openOkDialog("Error", err);
        } else {
            openOkDialog("Success", "Player '" + name + "' created successfully!");

            updatePlayerList(function(err, result) {
                $("#player-dropdown").val(newId);
                $("#player-dropdown").selectmenu("refresh");

                updateFields(newId);
            });
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
            openOkDialog("Error", err);
        } else {
            nodecg.sendMessage("playerDataUpdated");
            openOkDialog("Success", "Player '" + name + "' modified successfully!");

            updatePlayerList(function(err, result) {
                $("#player-dropdown").val(id);
                $("#player-dropdown").selectmenu("refresh");

                updateFields(id);
            });
        }
    });
}

function removePlayer() {
    let id = $("#player-dropdown").val();
    let name = $("#player-name-text").val();

    if (id != NEW_PLAYER_ID) {
        openConfirmDialog("Confirmation", "Are you sure you want to remove player '" + name + "'?",
            function() {
                nodecg.sendMessage("removePlayer", {id}, (err, result) => {
                    if (err) {
                        openOkDialog("Error", err);
                    } else {
                        openOkDialog("Success", "Player '" + name + "' removed successfully!");
                        updatePlayerList();
                    }
                });
            });
    }
}

function submitPlayer() {
    let id = $("#player-dropdown").val();
    let name = $("#player-name-text").val();

    if (id == NEW_PLAYER_ID) {
        openConfirmDialog("Confirm player creation",
            "Are you sure you want to create player '" + name + "'?",
            function() {
                createPlayer();
            });

    } else{
        openConfirmDialog("Confirm player modification",
            "Are you sure you want to modify player '" + name + "'?",
            function() {
                modifyPlayer();
            });
    }
}

let dialogCount = 0;
function openDialog(title, msg, onClose) {
    let rawName = "dialog-" + dialogCount;
    let name = "#" + rawName;

    if ($(name).length == 0) {
        $(document.body).append(
            '<div id="' + rawName + '" title="' + title + '">' +
                "<p>" + msg + "</p>" +
            '</div>');
    } else {
        $(name).html(msg);
    }

    $(name).dialog({
        autoOpen: false,
    });
    $(name).dialog("open");

    $(name).on('dialogclose', function(event) {
        typeof onClose === 'function' && onClose();
    });

    ++dialogCount;
}

function openOkDialog(title, msg, onOk, onClose) {
    let rawName = "dialog-" + dialogCount;
    let name = "#" + rawName;

    if ($(name).length == 0) {
        $(document.body).append(
            '<div id="' + rawName + '" title="' + title + '">' +
                "<p>" + msg + "</p>" +
            '</div>');
    } else {
        $(name).html(msg);
    }

    $(name).dialog({
        autoOpen: false,
        buttons: {
            "Okay" : function() {
                typeof onYes === 'function' && onOk();
                $(name).dialog("close");
            }
        }
    });
    $(name).dialog("open");

    $(name).on('dialogclose', function(event) {
        typeof onClose === 'function' && onClose();
    });

    ++dialogCount;
}

function openConfirmDialog(title, msg, onYes, onNo, onClose) {
    let rawName = "dialog-" + dialogCount;
    let name = "#" + rawName;

    if ($(name).length == 0) {
        $(document.body).append(
            '<div id="' + rawName + '" title="' + title + '">' +
                "<p>" + msg + "</p>" +
            '</div>');
    } else {
        $(name).html(msg);
    }

    $(name).dialog({
        autoOpen: false,
        buttons: {
            "Confirm" : function() {
                typeof onYes === 'function' && onYes();
                $(name).dialog("close");
            },
            "Cancel" : function() {
                typeof onNo === 'function' && onNo();
                $(name).dialog("close");
            }
        }
    });
    $(name).dialog("open");

    $(name).on('dialogclose', function(event) {
        typeof onClose === 'function' && onClose();
    });

    ++dialogCount;
}
