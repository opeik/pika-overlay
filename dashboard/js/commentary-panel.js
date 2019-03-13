'use strict';

$(document).ready(function() {
    let commentator1NameDropdown = $("#commentator-1-name-dropdown");
    let commentator1NameText     = $("#commentator-1-name-text");
    let commentator1SocialText   = $("#commentator-1-social-text");
    let commentator2NameDropdown = $("#commentator-2-name-dropdown");
    let commentator2NameText     = $("#commentator-2-name-text");
    let commentator2SocialText   = $("#commentator-2-social-text");
    let updateButton             = $("#update-button");
    let swapButton               = $("#swap-button");
    let pendingChangesLabel      = $("#pending-changes-label");

    setupElements();

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
    }
});
