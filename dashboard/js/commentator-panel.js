'use strict';

$(document).ready(function() {
    let commentatorDropdown   = $("#commentator-dropdown");
    let commentatorNameText   = $("#commentator-name-text");
    let commentatorSocialText = $("#commentator-social-text");
    let submitButton          = $("#submit-button");
    let removeButton          = $("#remove-button");

    setupElements();

    function setupElements() {
        const TEXT_CLASSES = "ui-widget ui-widget-content ui-corner-all";

        commentatorDropdown.selectmenu();
        commentatorNameText.addClass(TEXT_CLASSES);
        commentatorSocialText.addClass(TEXT_CLASSES);
        submitButton.button();
        removeButton.button();

        submitButton.click(submitClick);
        removeButton.click(removeClick);
        playerDropdown.on("selectmenuselect", selectPlayer);
    }
});
