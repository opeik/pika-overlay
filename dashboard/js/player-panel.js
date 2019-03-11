'use strict';

$(document).ready(function() {
    const PLACEHOLDER_INDEX = 0;

    let players       = [];
    let playersSorted = [];

    let playerDropdown        = $("#player-dropdown");
    let playerCountryDropdown = $("#player-country-dropdown");
    let playerNameText        = $("#player-name-text");
    let playerSponsorText     = $("#player-sponsor-text");
    let submitButton          = $("#submit-button");
    let removeButton          = $("#remove-button");

    /* Set up the initial panel state. */
    setupElements();

    getPlayers(function() {
        populatePlayerDropdown();
    });

    populateCountryDropdown();

    function setupElements() {
        const TEXT_CLASSES = "ui-widget ui-widget-content ui-corner-all";

        playerDropdown.selectmenu();
        playerCountryDropdown.selectmenu();
        playerNameText.addClass(TEXT_CLASSES);
        playerSponsorText.addClass(TEXT_CLASSES);
        submitButton.button();
        removeButton.button();

        submitButton.click(submitClick);
        removeButton.click(removeClick);
        playerDropdown.on("selectmenuselect", selectPlayer);
    }

    /*
     * Fetches all the players in the database.
     */
    function getPlayers(callback) {
        nodecg.sendMessage("getPlayers", (err, result) => {
            if (err) {
                typeof callback === 'function' && callback(new Error(err));
            } else {
                /* Add the players to the local cache. */
                result.forEach(function(player) {
                    players[player.id] = player;
                });

                /* Refresh the sorted players cache. */
                playersSorted = players.slice();
                playersSorted.sort(sortByName);

                typeof callback === 'function' && callback(null);
            }
        });
    }

    /*
     * Updates the name, sponsor, and country fields from a player ID.
     */
    function updateFields(id) {
        playerNameText.val(players[id].name);
        playerSponsorText.val(players[id].sponsor);
        playerCountryDropdown.val(players[id].country);
        playerCountryDropdown.selectmenu("refresh");
    }

    /*
     * Creates a new player.
     */
    function createPlayer(name, sponsor, country) {
        nodecg.sendMessage("createPlayer", {name, sponsor, country},
            function(err, result) {
                let newId = result.lastID;

                if (err) {
                    openOkDialog("Error", err);
                } else {
                    /* Add the player to the local cache. */
                    players[newId] = {
                        "id" : newId,
                        "name" : name,
                        "sponsor" : sponsor,
                        "country" : country
                    };

                    /* Refresh the sorted players cache. */
                    playersSorted = players.slice();
                    playersSorted.sort(sortByName);

                    /* Repopulate the players dropdown. */
                    populatePlayerDropdown();

                    /* Select the new player. */
                    playerDropdown.val(newId);
                    playerDropdown.selectmenu("refresh");
                }
            }
        );
    }

    /*
     * Modifies a player.
     */
    function modifyPlayer(id, name, sponsor, country) {
        nodecg.sendMessage("modifyPlayer", {id, name, sponsor, country},
            function(err, result) {
                if (err) {
                    okDialog("Error", err);
                } else {
                    /* Update the player in the cache. */
                    players[id] = {
                        "id" : id,
                        "name" : name,
                        "sponsor" : sponsor,
                        "country" : country
                    };

                    /* Refresh the sorted players cache. */
                    playersSorted = players.slice();
                    playersSorted.sort(sortByName);

                    /* Repopulate the players dropdown. */
                    populatePlayerDropdown();

                    /* Select the modified player. */
                    playerDropdown.val(id);
                    playerDropdown.selectmenu("refresh");

                }
            }
        );
    }

    /*
     * Removes a player.
     */
    function removePlayer(id, name) {
        nodecg.sendMessage("removePlayer", {id}, function(err, result) {
            if (err) {
                okDialog("Error", err);
            } else {
                /* Remove the player from the cache. */
                players[id] = undefined;

                /* Refresh the sorted players cache. */
                playersSorted = players.slice();
                playersSorted.sort(sortByName);

                /* Repopulate the players dropdown. */
                populatePlayerDropdown();
                playerDropdown.selectmenu("refresh");

                /* Clear the player fields. */
                playerCountryDropdown.val("AU");
                playerNameText.val("");
                playerSponsorText.val("");
                playerCountryDropdown.selectmenu("refresh");
            }
        });
    }

    /*
     * Called when the submit button is clicked.
     */
    function submitClick() {
        let id = playerDropdown.val();
        let name = playerNameText.val().trim();
        let sponsor = playerSponsorText.val().trim();
        let country = playerCountryDropdown.val();

        if (name.isNullOrWhiteSpace()) {
            okDialog("Error", "Name cannot be empty.");
        } else {
            if (id == PLACEHOLDER_INDEX) {
                confirmDialog("Confirm player creation",
                              "Are you sure you want to create player '" + name + "'?",
                                function() {
                                    createPlayer(name, sponsor, country);
                                    okDialog("Success", "Player '" + name + "' created successfully!");
                                }
                );
            } else {
                confirmDialog("Confirm player modification",
                              "Are you sure you want to modify player '" + name + "'?",
                                function() {
                                    modifyPlayer(id, name, sponsor, country);
                                    okDialog("Success", "Player '" + name + "' modified successfully!");
                                }
                );
            }
        }
    }

    /*
     * Called when the remove button is clicked.
     */
    function removeClick() {
        let id = playerDropdown.val();
        let name = players[id].name;

        if (id == PLACEHOLDER_INDEX) {
            okDialog("Error", "Please select a player to remove.");
        } else {
            confirmDialog("Confirm player removal",
                          "Are you sure you want to remove player '" + name + "'?",
                            function() {
                                removePlayer(id, name);
                                okDialog("Success", "Player '" + name + "' successfully removed!");
                            }
            );
        }
    }

    /*
     * Called when a player is selected.
     */
    function selectPlayer() {
        let id = playerDropdown.val();

        if (id != PLACEHOLDER_INDEX) {
            updateFields(id);
        }
    }

    /*
     * Populates the player dropdown with the current players.
     */
    function populatePlayerDropdown() {
        /* Remove the old entries. */
        playerDropdown.find("option").remove().end();
        playerDropdown.selectmenu("destroy").selectmenu();

        playerDropdown.append(new Option("Create new player...", PLACEHOLDER_INDEX));

        playersSorted.forEach(function(player) {
            if (player) {
                playerDropdown.append(new Option(player.name, player.id));
            }
        });

        playerDropdown.selectmenu("refresh");
    }

    /*
     * Populates the country dropdown.
     */
    function populateCountryDropdown() {
        country.data.forEach(function(entry) {
            playerCountryDropdown.append(new Option(entry.name, entry.code));
        });

        playerCountryDropdown.val("AU");
        playerCountryDropdown.selectmenu("refresh");
    }

    /*
     * Sorts values by name.
     */
    function sortByName(lhs, rhs) {
        lhs = lhs.name.toLowerCase();
        rhs = rhs.name.toLowerCase();

        if (lhs < rhs) {
            return -1;
        }

        if (lhs > rhs) {
            return 1;
        }

        return 0;
    }
});

/*
 * Returns true if a string is null or is only whitespace.
 */
String.prototype.isNullOrWhiteSpace = function() {
    return (!this || this.length === 0 || /^\s*$/.test(this))
}
