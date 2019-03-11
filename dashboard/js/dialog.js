'use strict';

var dialogCount = 0;

/*
 * Opens a dialog box.
 */
function dialog(title, msg, onClose) {
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

/*
 * Opens an ok dialog box.
 */
function okDialog(title, msg, onOk, onClose) {
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

/*
 * Opens a confirm dialog box.
 */
function confirmDialog(title, msg, onYes, onNo, onClose) {
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
