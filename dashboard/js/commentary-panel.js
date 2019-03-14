'use strict';

$(document).ready(function() {
    const PLACEHOLDER_INDEX = 0;
    const PENDING_CHANGES_TEXT = "Pending changes";

    let commentatorState = nodecg.Replicant("commentator-state");

    let commentators       = [];
    let commentatorsSorted = [];

    let commentator1NameDropdown = $("#commentator-1-name-dropdown");
    let commentator1NameText     = $("#commentator-1-name-text");
    let commentator1SocialText   = $("#commentator-1-social-text");
    let commentator2NameDropdown = $("#commentator-2-name-dropdown");
    let commentator2NameText     = $("#commentator-2-name-text");
    let commentator2SocialText   = $("#commentator-2-social-text");
    let updateButton             = $("#update-button");
    let swapButton               = $("#swap-button");
    let pendingChangesLabel      = $("#pending-changes-label");

    let initialStateSetup = false;
    let pendingChanges = false;

    /* Set up the initial panel state. */
    NodeCG.waitForReplicants(commentatorState).then(function() {
        let s = commentatorState.value;
        let commentator1 = s.commentator1;
        let commentator2 = s.commentator2;

        setupElements();

        getCommentators(function() {
            populateCommentatorDropdown();
            updateFieldsFromCommentator();
            setupHooks();

            initialStateSetup = true;
        });
    });

    function setupElements() {
        const TEXT_CLASSES = "ui-widget ui-widget-content ui-corner-all";

        commentator1NameDropdown.selectmenu();
        commentator1NameText.addClass(TEXT_CLASSES);
        commentator1SocialText.addClass(TEXT_CLASSES);
        commentator2NameDropdown.selectmenu();
        commentator2NameText.addClass(TEXT_CLASSES);
        commentator2SocialText.addClass(TEXT_CLASSES);
        updateButton.button();
        swapButton.button();

        updateButton.click(updateClick);
        swapButton.click(swapClick);

        commentator1NameDropdown.on("selectmenuselect", selectCommentator);
        commentator1NameText.on("input propertychange paste", updatePendingChangesWarning);
        commentator1SocialText.on("input propertychange paste", updatePendingChangesWarning);

        commentator2NameDropdown.on("selectmenuselect", selectCommentator);
        commentator2NameText.on("input propertychange paste", updatePendingChangesWarning);
        commentator2SocialText.on("input propertychange paste", updatePendingChangesWarning);

        $(".ui-spinner-button").click(function(event, ui) {
           $(this).siblings("input").change();
            updatePendingChangesWarning(event, ui);
        });
    }

    function setupHooks() {
        function updateCommentators(value) {
            let s = commentatorState.value;
            let commentator1 = s.commentator1;
            let commentator2 = s.commentator2;

            commentators[value.id] = {
                "id" : value.id,
                "name" : value.name,
                "social" : value.social
            };

            /* Refresh the sorted commentators cache. */
            commentatorsSorted = commentators.slice();
            commentatorsSorted.sort(sortByName);

            /* Repopulate the commentators dropdown. */
            populateCommentatorDropdown();

            commentator1NameDropdown.val(commentator1.id);
            commentator2NameDropdown.val(commentator2.id);
            commentator1NameDropdown.selectmenu("refresh");
            commentator2NameDropdown.selectmenu("refresh");

            updatePendingChangesWarning();
        }

        nodecg.listenFor("commentatorCreated", function(value) {
            updateCommentators(value);
        });

        nodecg.listenFor("commentatorModified", function(value) {
            updateCommentators(value);
        });

        nodecg.listenFor("commentatorRemoved", function(value) {
            let s = commentatorState.value;
            let commentator1 = s.commentator1;
            let commentator2 = s.commentator2;

            commentators[value] = undefined;

            /* Refresh the sorted commentators cache. */
            commentatorsSorted = commentators.slice();
            commentatorsSorted.sort(sortByName);

            /* Repopulate the commentators dropdown. */
            populateCommentatorDropdown();

            if (commentator1.id == value) {
                commentator1.id = PLACEHOLDER_INDEX;
                commentator1NameDropdown.val(PLACEHOLDER_INDEX);
            } else {
                commentator1NameDropdown.val(commentator1.id);
            }

            if (commentator2.id == value) {
                commentator2.id = PLACEHOLDER_INDEX;
                commentator2NameDropdown.val(PLACEHOLDER_INDEX);
            } else {
                commentator2NameDropdown.val(commentator2.id);
            }

            commentator1NameDropdown.selectmenu("refresh");
            commentator2NameDropdown.selectmenu("refresh");
        });
    }

    /*
     * Updates the name and social fields from the commentator state.
     */
    function updateFieldsFromCommentator() {
        let s = commentatorState.value;
        let commentator1 = s.commentator1;
        let commentator2 = s.commentator2;

        commentator1NameDropdown.val(commentator1.id);
        commentator1NameDropdown.selectmenu("refresh");
        commentator1NameText.val(commentator1.name);
        commentator1SocialText.val(commentator1.social);

        commentator2NameDropdown.val(commentator2.id);
        commentator2NameDropdown.selectmenu("refresh");
        commentator2NameText.val(commentator2.name);
        commentator2SocialText.val(commentator2.social);

        updatePendingChangesWarning();
    }

    /*
     * Checks if there are any pending changes, and displays the warning if so.
     */
    function updatePendingChangesWarning(event, ui) {
        let s = commentatorState.value;
        let commentator1 = s.commentator1;
        let commentator2 = s.commentator2;

        let commentator1Name   = commentator1NameText.val();
        let commentator1Social = commentator1SocialText.val();

        let commentator2Name   = commentator2NameText.val();
        let commentator2Social = commentator2SocialText.val();

        let elementName = "";

        if (event != null) {
            elementName = event.target.id;
        }

        function hasCommentator1Changed() {
            return commentator1Name != commentator1.name ||
                   commentator1Social != commentator1.social;
        }

        function hasCommentator2Changed() {
            return commentator2Name != commentator2.name ||
                   commentator2Social != commentator2.social;
        }

        /* Check if the update was called from a commentator selectmenu. */
        if (elementName == "commentator-1-name-dropdown") {
            if (hasCommentator1Changed()) {
                pendingChanges = true;
            } else {
                pendingChanges = false;
            }
        } else if (elementName == "commentator-2-name-dropdown") {
            if (hasCommentator2Changed()) {
                pendingChanges = true;
            } else {
                pendingChanges = false;
            }
        } else {
            if (hasCommentator1Changed() || hasCommentator2Changed()) {
                pendingChanges = true;
            } else {
                pendingChanges = false;
            }
        }

        if (pendingChanges) {
            pendingChangesLabel.text(PENDING_CHANGES_TEXT);
        } else {
            pendingChangesLabel.text("");
        }
    }

    /*
     * Updates the name and social fields from a commentator ID.
     */
    function updateFields(id, commentatorNum) {
        let name = "#commentator-" + commentatorNum;

        $(name + "-name-text").val(commentators[id].name);
        $(name + "-social-text").val(commentators[id].social);
    }

    /*
     * Called when a commentator is selected.
     */
    function selectCommentator(event, ui) {
        let elementName = event.target.id;
        let id = ui.item.value;

        if (id != PLACEHOLDER_INDEX) {
            if (elementName === "commentator-1-name-dropdown") {
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
        let s = commentatorState.value;
        let commentator1 = s.commentator1;
        let commentator2 = s.commentator2;

        /* Don't you ever try to junkyard me. */
        if (commentator1NameText.val().isNullOrWhiteSpace()) {
            okDialog("Error", "Commentator 1 name cannot be empty.");
        } else if (commentator2NameText.val().isNullOrWhiteSpace()) {
            okDialog("Error", "Commentator 2 name cannot be empty.");
        } else {
            commentator1.id     = commentator1NameDropdown.val();
            commentator1.name   = commentator1NameText.val();
            commentator1.social = commentator1SocialText.val();

            commentator2.id     = commentator2NameDropdown.val();
            commentator2.name   = commentator2NameText.val();
            commentator2.social = commentator2SocialText.val();

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
        let s = commentatorState.value;
        let commentator1 = s.commentator1;
        let commentator2 = s.commentator2;

        let commentator1Id     = commentator1NameDropdown.val();
        let commentator1Name   = commentator1NameText.val();
        let commentator1Social = commentator1SocialText.val();

        let commentator2Id     = commentator2NameDropdown.val();
        let commentator2Name   = commentator2NameText.val();
        let commentator2Social = commentator2SocialText.val();

        [commentator1.id,commentator2.id] = [commentator2.id,commentator1.id];
        [commentator1.name,commentator2.name] = [commentator2.name,commentator1.name];
        [commentator1.social,commentator2.social] = [commentator2.social,commentator1.social];

        setTimeout(function() {
            commentator1NameDropdown.val(commentator2Id);
            commentator1NameDropdown.selectmenu("refresh");

            commentator1NameText.val(commentator2Name);
            commentator1SocialText.val(commentator2Social);

            commentator2NameDropdown.val(commentator1Id);
            commentator2NameDropdown.selectmenu("refresh");

            commentator2NameText.val(commentator1Name);
            commentator2SocialText.val(commentator1Social);

            updateClick();
        });
    }

    /*
     * Fetches all the commentators in the database.
     */
    function getCommentators(callback) {
        nodecg.sendMessage("getCommentators", function(err, result) {
            if (err) {
                typeof callback === 'function' && callback(new Error(err));
            } else {
                /* Add the commentators to the local cache. */
                result.forEach(function(commentator) {
                    commentators[commentator.id] = commentator;
                });

                /* Refresh the sorted commentators cache. */
                commentatorsSorted = commentators.slice();
                commentatorsSorted.sort(sortByName);

                typeof callback === 'function' && callback(null);
            }
        });
    }

    /*
     * Populates the commentator dropdown with the current commentators.
     */
    function populateCommentatorDropdown() {
        /* Remove the old entries. */
        commentator1NameDropdown.find("option").remove().end();
        commentator1NameDropdown.selectmenu("destroy").selectmenu();
        commentator2NameDropdown.find("option").remove().end();
        commentator2NameDropdown.selectmenu("destroy").selectmenu();

        commentator1NameDropdown.append(new Option("Select commentator...", PLACEHOLDER_INDEX));
        commentator2NameDropdown.append(new Option("Select commentator...", PLACEHOLDER_INDEX));

        commentatorsSorted.forEach(function(commentator) {
            if (commentator) {
                commentator1NameDropdown.append(new Option(commentator.name, commentator.id));
                commentator2NameDropdown.append(new Option(commentator.name, commentator.id));
            }
        });

        commentator1NameDropdown.selectmenu("refresh");
        commentator2NameDropdown.selectmenu("refresh");
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
