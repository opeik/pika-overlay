'use strict';

$(document).ready(function() {
    let commentaryState = nodecg.Replicant("commentary-state");

    /* Update the commentary when the commentary state changes. */
    commentaryState.on("change", (newValue, oldValue) => {
        updateCommentary(newValue, oldValue);
    });

    /*
     * Updates the commentary.
     */
    function updateCommentary(newValue, oldValue) {
        let commentator1 = newValue.commentator1;
        let commentator2 = newValue.commentator2;

        $("#commentator-1-name").text(commentator1.name);
        $("#commentator-1-social").text(commentator1.social);

        $("#commentator-2-name").text(commentator2.name);
        $("#commentator-2-social").text(commentator2.social);
    }
});
