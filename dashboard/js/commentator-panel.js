'use strict';

$(document).ready(function() {
    const PLACEHOLDER_INDEX = 0;

    let commentators       = [];
    let commentatorsSorted = [];

    let commentatorDropdown   = $("#commentator-dropdown");
    let commentatorNameText   = $("#commentator-name-text");
    let commentatorSocialText = $("#commentator-social-text");
    let submitButton          = $("#submit-button");
    let removeButton          = $("#remove-button");

    /* Set up the initial panel state. */
    setupElements();

    getCommentators(function() {
        populateCommentatorDropdown();
    });

    function setupElements() {
        const TEXT_CLASSES = "ui-widget ui-widget-content ui-corner-all";

        commentatorDropdown.selectmenu();
        commentatorNameText.addClass(TEXT_CLASSES);
        commentatorSocialText.addClass(TEXT_CLASSES);
        submitButton.button();
        removeButton.button();

        submitButton.click(submitClick);
        removeButton.click(removeClick);
        commentatorDropdown.on("selectmenuselect", selectCommentator);
    }

    /*
     * Fetches all the commentators in the database.
     */
    function getCommentators(callback) {
        nodecg.sendMessage("getCommentators", (err, result) => {
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
     * Updates the name and social fields from a commentator ID.
     */
    function updateFields(id) {
        commentatorNameText.val(commentators[id].name);
        commentatorSocialText.val(commentators[id].social);
    }

    /*
     * Creates a new commentator.
     */
    function createCommentator(name, social) {
        nodecg.sendMessage("createCommentator", {name, social},
            function(err, result) {
                let newId = result;

                if (err) {
                    openOkDialog("Error", err);
                } else {
                    /* Add the commentator to the local cache. */
                    commentators[newId] = {
                        "id" : newId,
                        "name" : name,
                        "social" : social
                    };

                    /* Refresh the sorted commentators cache. */
                    commentatorsSorted = commentators.slice();
                    commentatorsSorted.sort(sortByName);

                    /* Repopulate the commentators dropdown. */
                    populateCommentatorDropdown();

                    /* Select the new commentator. */
                    commentatorDropdown.val(newId);
                    commentatorDropdown.selectmenu("refresh");
                }
            }
        );
    }

    /*
     * Modifies a commentator.
     */
    function modifyCommentator(id, name, social) {
        nodecg.sendMessage("modifyCommentator", {id, name, social},
            function(err, result) {
                if (err) {
                    okDialog("Error", err);
                } else {
                    /* Update the commentator in the cache. */
                    commentators[id] = {
                        "id" : id,
                        "name" : name,
                        "social" : social
                    };

                    /* Refresh the sorted commentators cache. */
                    commentatorsSorted = commentators.slice();
                    commentatorsSorted.sort(sortByName);

                    /* Repopulate the commentators dropdown. */
                    populateCommentatorDropdown();

                    /* Select the modified commentator. */
                    commentatorDropdown.val(id);
                    commentatorDropdown.selectmenu("refresh");
                }
            }
        );
    }

    /*
     * Removes a commentator.
     */
    function removeCommentator(id, name) {
        nodecg.sendMessage("removeCommentator", {id}, function(err, result) {
            if (err) {
                okDialog("Error", err);
            } else {
                /* Remove the commentator from the cache. */
                commentators[id] = undefined;

                /* Refresh the sorted commentators cache. */
                commentatorsSorted = commentators.slice();
                commentatorsSorted.sort(sortByName);

                /* Repopulate the commentators dropdown. */
                populateCommentatorDropdown();
                commentatorDropdown.selectmenu("refresh");

                /* Clear the commentator fields. */
                commentatorNameText.val("");
                commentatorSocialText.val("");
            }
        });
    }

    function hasCommentatorChanged(id) {
        let name = commentatorNameText.val().trim();
        let social = commentatorSocialText.val().trim();

        return commentators[id].name != name || commentators[id].social != social;
    }

    /*
     * Called when the submit button is clicked.
     */
    function submitClick() {
        let id = Number(commentatorDropdown.val());
        let name = commentatorNameText.val().trim();
        let social = commentatorSocialText.val().trim();

        if (name.isNullOrWhiteSpace()) {
            okDialog("Error", "Name cannot be empty.");
        } else {
            if (id == PLACEHOLDER_INDEX) {
                confirmDialog("Confirm commentator creation",
                              "Are you sure you want to create commentator '" + name + "'?",
                                function() {
                                    createCommentator(name, social);
                                    okDialog("Success", "Commentator '" + name + "' created successfully!");
                                }
                );
            } else {
                if (!hasCommentatorChanged(id)) {
                    okDialog("Error", "There are no changes to be submitted.")
                } else {
                    confirmDialog("Confirm commentator modification",
                                  "Are you sure you want to modify commentator '" + commentators[id].name + "'?",
                                    function() {
                                        modifyCommentator(id, name, social);
                                        okDialog("Success", "Commentator '" + name + "' modified successfully!");
                                    }
                    );
                }
            }
        }
    }

    /*
     * Called when the remove button is clicked.
     */
    function removeClick() {
        let id = Number(commentatorDropdown.val());
        let name = commentators[id].name;

        if (id == PLACEHOLDER_INDEX) {
            okDialog("Error", "Please select a commentator to remove.");
        } else {
            confirmDialog("Confirm commentator removal",
                          "Are you sure you want to remove commentator '" + name + "'?",
                            function() {
                                removeCommentator(id, name);
                                okDialog("Success", "Commentator '" + name + "' successfully removed!");
                            }
            );
        }
    }

    /*
     * Called when a commentator is selected.
     */
    function selectCommentator() {
        let id = Number(commentatorDropdown.val());

        if (id != PLACEHOLDER_INDEX) {
            updateFields(id);
        }
    }

    /*
     * Populates the commentator dropdown with the current commentators.
     */
    function populateCommentatorDropdown() {
        /* Remove the old entries. */
        commentatorDropdown.find("option").remove().end();
        commentatorDropdown.selectmenu("destroy").selectmenu();

        commentatorDropdown.append(new Option("Create new commentator...", PLACEHOLDER_INDEX));

        commentatorsSorted.forEach(function(commentator) {
            if (commentator) {
                commentatorDropdown.append(new Option(commentator.name, commentator.id));
            }
        });

        commentatorDropdown.selectmenu("refresh");
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
