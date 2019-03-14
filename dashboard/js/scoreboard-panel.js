'use strict';

$(document).ready(function() {
    const PLACEHOLDER_INDEX = 0;
    const PENDING_CHANGES_TEXT = "Pending changes";

    let scoreboardState = nodecg.Replicant("scoreboard-state");

    let players       = [];
    let playersSorted = [];

    let labelText              = $("#label-text");
    let player1NameDropdown    = $("#player-1-name-dropdown");
    let player1ScoreSpinner    = $("#player-1-score-spinner");
    let player1NameText        = $("#player-1-name-text");
    let player1SponsorText     = $("#player-1-sponsor-text");
    let player1CountryDropdown = $("#player-1-country-dropdown");
    let player2NameDropdown    = $("#player-2-name-dropdown");
    let player2ScoreSpinner    = $("#player-2-score-spinner");
    let player2NameText        = $("#player-2-name-text");
    let player2SponsorText     = $("#player-2-sponsor-text");
    let player2CountryDropdown = $("#player-2-country-dropdown");
    let updateButton           = $("#update-button");
    let swapButton             = $("#swap-button");
    let pendingChangesLabel    = $("#pending-changes-label");

    let initialStateSetup = false;
    let pendingChanges = false;
    let isSwapping = false;

    /* Set up the initial panel state. */
    NodeCG.waitForReplicants(scoreboardState).then(function() {
        let s = scoreboardState.value;
        let player1 = s.player1;
        let player2 = s.player2;

        setupElements();

        getPlayers(function() {
            populatePlayerDropdown();
            updateFieldsFromScoreboard();
            setupHooks();

            initialStateSetup = true;
        });

        populateCountryDropdown();
    });

    function setupElements() {
        const TEXT_CLASSES = "ui-widget ui-widget-content ui-corner-all";

        labelText.addClass(TEXT_CLASSES);
        player1NameDropdown.selectmenu();
        player1ScoreSpinner.spinner({decimals: 0, min: 0, max: 99});
        player1NameText.addClass(TEXT_CLASSES);
        player1SponsorText.addClass(TEXT_CLASSES);
        player1CountryDropdown.selectmenu();
        player2NameDropdown.selectmenu();
        player2ScoreSpinner.spinner({decimals: 0, min: 0, max: 99});
        player2NameText.addClass(TEXT_CLASSES);
        player2SponsorText.addClass(TEXT_CLASSES);
        player2CountryDropdown.selectmenu();
        updateButton.button();
        swapButton.button();

        updateButton.click(updateClick);
        swapButton.click(swapClick);

        player1NameDropdown.on("selectmenuselect", selectPlayer);
        player1CountryDropdown.on("selectmenuselect", selectCountry);
        player1NameText.on("input propertychange paste", updatePendingChangesWarning);
        player1SponsorText.on("input propertychange paste", updatePendingChangesWarning);

        player2NameDropdown.on("selectmenuselect", selectPlayer);
        player2CountryDropdown.on("selectmenuselect", selectCountry);
        player2NameText.on("input propertychange paste", updatePendingChangesWarning);
        player2SponsorText.on("input propertychange paste", updatePendingChangesWarning);

        labelText.on("input propertychange paste", updatePendingChangesWarning);

        $(".ui-spinner-button").click(function(event, ui) {
           $(this).siblings("input").change();
            updatePendingChangesWarning(event, ui);
        });

        player1ScoreSpinner.bind("keydown", function (event) {
            event.preventDefault();
        });

        player2ScoreSpinner.bind("keydown", function (event) {
            event.preventDefault();
        });
    }

    function setupHooks() {
        function updatePlayers(value) {
            let s = scoreboardState.value;
            let player1 = s.player1;
            let player2 = s.player2;

            players[value.id] = {
                "id" : value.id,
                "name" : value.name,
                "sponsor" : value.sponsor,
                "country" : value.country
            };

            /* Refresh the sorted players cache. */
            playersSorted = players.slice();
            playersSorted.sort(sortByName);

            /* Repopulate the players dropdown. */
            populatePlayerDropdown();

            player1NameDropdown.val(player1.id);
            player2NameDropdown.val(player2.id);
            player1NameDropdown.selectmenu("refresh");
            player2NameDropdown.selectmenu("refresh");

            updatePendingChangesWarning();
        }

        nodecg.listenFor("playerCreated", function(value) {
            updatePlayers(value);
        });

        nodecg.listenFor("playerModified", function(value) {
            updatePlayers(value);
        });

        nodecg.listenFor("playerRemoved", function(value) {
            let s = scoreboardState.value;
            let player1 = s.player1;
            let player2 = s.player2;

            players[value] = undefined;

            /* Refresh the sorted players cache. */
            playersSorted = players.slice();
            playersSorted.sort(sortByName);

            /* Repopulate the players dropdown. */
            populatePlayerDropdown();

            if (player1.id == value) {
                player1.id = PLACEHOLDER_INDEX;
                player1NameDropdown.val(PLACEHOLDER_INDEX);
            } else {
                player1NameDropdown.val(player1.id);
            }

            if (player2.id == value) {
                player2.id = PLACEHOLDER_INDEX;
                player2NameDropdown.val(PLACEHOLDER_INDEX);
            } else {
                player2NameDropdown.val(player2.id);
            }

            player1NameDropdown.selectmenu("refresh");
            player2NameDropdown.selectmenu("refresh");
        });
    }

    /*
     * Updates the name, sponsor, and country fields from the scoreboard state.
     */
    function updateFieldsFromScoreboard() {
        let s = scoreboardState.value;
        let player1 = s.player1;
        let player2 = s.player2;

        player1NameDropdown.val(player1.id);
        player1NameDropdown.selectmenu("refresh");
        player1CountryDropdown.val(player1.country);
        player1CountryDropdown.selectmenu("refresh");
        player1ScoreSpinner.val(player1.score);
        player1NameText.val(player1.name);
        player1SponsorText.val(player1.sponsor);

        player2NameDropdown.val(player2.id);
        player2NameDropdown.selectmenu("refresh");
        player2CountryDropdown.val(player2.country);
        player2CountryDropdown.selectmenu("refresh");
        player2ScoreSpinner.val(player2.score);
        player2NameText.val(player2.name);
        player2SponsorText.val(player2.sponsor);

        labelText.val(s.label);

        updatePendingChangesWarning();
    }

    /*
     * Checks if there are any pending changes, and displays the warning if so.
     */
    function updatePendingChangesWarning(event, ui) {
        let s = scoreboardState.value;
        let player1 = s.player1;
        let player2 = s.player2;

        let player1Name    = player1NameText.val();
        let player1Sponsor = player1SponsorText.val();
        let player1Country = player1CountryDropdown.val();
        let player1Score   = player1ScoreSpinner.val();

        let player2Name    = player2NameText.val();
        let player2Sponsor = player2SponsorText.val();
        let player2Country = player2CountryDropdown.val();
        let player2Score   = player2ScoreSpinner.val();

        let label       = labelText.val();
        let elementName = "";

        if (event != null) {
            elementName = event.target.id;
        }

        function hasPlayer1Changed() {
            return player1Name != player1.name || player1Sponsor != player1.sponsor ||
                   player1Country != player1.country || player1Score != player1.score;
        }

        function hasPlayer2Changed() {
            return player2Name != player2.name || player2Sponsor != player2.sponsor ||
                   player2Country != player2.country || player2Score != player2.score;
        }


        /* Check if the update was called from a player selectmenu. */
        if (elementName == "player-1-name-dropdown") {
            if (hasPlayer1Changed()) {
                pendingChanges = true;
            } else {
                pendingChanges = false;
            }
        } else if (elementName == "player-2-name-dropdown") {
            if (hasPlayer2Changed()) {
                pendingChanges = true;
            } else {
                pendingChanges = false;
            }
        } else {
            if (hasPlayer1Changed() || hasPlayer2Changed() || label != s.label) {
                pendingChanges = true;
            } else {
                pendingChanges = false;
            }
        }

        if (pendingChanges && !isSwapping) {
            pendingChangesLabel.text(PENDING_CHANGES_TEXT);
        } else {
            pendingChangesLabel.text("");
        }
    }

    /*
     * Updates the name, sponsor, and country fields from a player ID.
     */
    function updateFields(id, playerNum) {
        let name = "#player-" + playerNum;

        $(name + "-name-text").val(players[id].name);
        $(name + "-sponsor-text").val(players[id].sponsor);
        $(name + "-country-dropdown").val(players[id].country);
        $(name + "-country-dropdown").selectmenu("refresh");
    }

    /*
     * Called when a country is selected.
     */
    function selectCountry(event, ui) {
        if (initialStateSetup) {
            updatePendingChangesWarning(event, ui);
        }
    }

    /*
     * Called when a player is selected.
     */
    function selectPlayer(event, ui) {
        let elementName = event.target.id;
        let id = ui.item.value;

        if (id != PLACEHOLDER_INDEX) {
            if (elementName === "player-1-name-dropdown") {
                updateFields(id, 1);
            } else {
                updateFields(id, 2);
            }

            if (initialStateSetup) {
                updatePendingChangesWarning(event, ui);
            }
        }
    }

    /*
     * Called when the update button is clicked.
     */
    function updateClick() {
        let s = scoreboardState.value;
        let player1 = s.player1;
        let player2 = s.player2;

        let player1Score = Number(player1ScoreSpinner.val());
        let player2Score = Number(player2ScoreSpinner.val());

        /* Don't you ever try to junkyard me. */
        if (labelText.val().isNullOrWhiteSpace()) {
            okDialog("Error", "Label cannot be empty.");
        } else if (player1NameText.val().isNullOrWhiteSpace()) {
            okDialog("Error", "Player 1 name cannot be empty.");
        } else if (Number.isNaN(player1Score) || !Number.isInteger(player1Score)) {
            okDialog("Error", "Player 1 score must be an integer.");
        } else if (player1Score < 0) {
            okDialog("Error", "Player 1 score must be above zero.");
        } else if (player2NameText.val().isNullOrWhiteSpace()) {
            okDialog("Error", "Player 2 name cannot be empty.");
        } else if (Number.isNaN(player2Score) || !Number.isInteger(player2Score)) {
            okDialog("Error", "Player 2 score must be an integer.");
        } else if (player1Score < 0) {
            okDialog("Error", "Player 2 score must be above zero.");
        } else {
            player1.id      = player1NameDropdown.val();
            player1.name    = player1NameText.val();
            player1.sponsor = player1SponsorText.val();
            player1.country = player1CountryDropdown.val();
            player1.score   = player1Score;

            player2.id      = player2NameDropdown.val();
            player2.name    = player2NameText.val();
            player2.sponsor = player2SponsorText.val();
            player2.country = player2CountryDropdown.val();
            player2.score   = player2Score;

            s.label = labelText.val();

            if (pendingChanges) {
                pendingChanges = false;
                pendingChangesLabel.text("");
            }
        }
    }

    /*
     * Called when the swap button is clicked.
     */
    function swapClick() {
        let s = scoreboardState.value;
        let player1 = s.player1;
        let player2 = s.player2;

        let player1Id      = player1NameDropdown.val();
        let player1Name    = player1NameText.val();
        let player1Sponsor = player1SponsorText.val();
        let player1Country = player1CountryDropdown.val();
        let player1Score   = player1ScoreSpinner.val();

        let player2Id      = player2NameDropdown.val();
        let player2Name    = player2NameText.val();
        let player2Sponsor = player2SponsorText.val();
        let player2Country = player2CountryDropdown.val();
        let player2Score   = player2ScoreSpinner.val();

        isSwapping = true;

        [player1.id,player2.id] = [player2.id,player1.id];
        [player1.name,player2.name] = [player2.name,player1.name];
        [player1.sponsor,player2.sponsor] = [player2.sponsor,player1.sponsor];
        [player1.score,player2.score] = [player2.score,player1.score];
        [player1.country,player2.country] = [player2.country,player1.country];

        setTimeout(function() {
            player1NameDropdown.val(player2Id);
            player1NameDropdown.selectmenu("refresh");

            player1NameText.val(player2Name);
            player1SponsorText.val(player2Sponsor);
            player1CountryDropdown.val(player2Country);
            player1ScoreSpinner.val(player2Score);

            player2NameDropdown.val(player1Id);
            player2NameDropdown.selectmenu("refresh");

            player2NameText.val(player1Name);
            player2SponsorText.val(player1Sponsor);
            player2CountryDropdown.val(player1Country);
            player2ScoreSpinner.val(player1Score);

            setTimeout(function() {
                player1CountryDropdown.selectmenu("refresh");
                player2CountryDropdown.selectmenu("refresh");
                isSwapping = false;
                updateClick();
            });
        });
    }

    /*
     * Fetches all the players in the database.
     */
    function getPlayers(callback) {
        nodecg.sendMessage("getPlayers", function(err, result) {
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
     * Populates the player dropdown with the current players.
     */
    function populatePlayerDropdown() {
        /* Remove the old entries. */
        player1NameDropdown.find("option").remove().end();
        player1NameDropdown.selectmenu("destroy").selectmenu();
        player2NameDropdown.find("option").remove().end();
        player2NameDropdown.selectmenu("destroy").selectmenu();

        player1NameDropdown.append(new Option("Select player...", PLACEHOLDER_INDEX));
        player2NameDropdown.append(new Option("Select player...", PLACEHOLDER_INDEX));

        playersSorted.forEach(function(player) {
            if (player) {
                player1NameDropdown.append(new Option(player.name, player.id));
                player2NameDropdown.append(new Option(player.name, player.id));
            }
        });

        player1NameDropdown.selectmenu("refresh");
        player2NameDropdown.selectmenu("refresh");
    }

    /*
     * Populates the country dropdown.
     */
    function populateCountryDropdown() {
        country.data.forEach(function(entry) {
            player1CountryDropdown.append(new Option(entry.name, entry.code));
            player2CountryDropdown.append(new Option(entry.name, entry.code));
        });

        player1CountryDropdown.val("AU");
        player2CountryDropdown.val("AU");
        player1CountryDropdown.selectmenu("refresh");
        player2CountryDropdown.selectmenu("refresh");
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
