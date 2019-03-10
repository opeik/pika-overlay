'use strict';

const db = require("./database");

module.exports = function (nodecg) {
    let playerState = nodecg.Replicant("player-state", {persistent: false, defaultValue : {}});
    let scoreboardState = nodecg.Replicant("scoreboard-state", {defaultValue : {
        player1 : {
            id : 0,
            name : "Player 1",
            sponsor : "Sponsor",
            country : "AU",
            score : 0
        },

        player2 : {
            id : 0,
            name : "Player 2",
            sponsor : "Sponsor",
            country : "AU",
            score : 0
        },

        label : "Pools"
    }});

    nodecg.listenFor("getPlayers", (value, ack) => {
        if (ack && !ack.handled) {
            db.getPlayers(function(err, result) {
                if (err) {
                    ack(new Error(err));
                } else {
                    ack(null, result);
                }
            });
        }
    });

    nodecg.listenFor("getPlayer", (value, ack) => {
        if (ack && !ack.handled) {
            db.getPlayerById(value.id,
                function(err, result) {
                    if (err) {
                        ack(new Error(err));
                    } else {
                        ack(null, result);
                    }
            });
        }
    });

    nodecg.listenFor("createPlayer", (value, ack) => {
        if (ack && !ack.handled) {
            db.createPlayer(value.name, value.sponsor, value.country,
                function(err, result) {
                    if (err) {
                        ack(new Error(err));
                    } else {
                        ack(null, result);
                    }
            });
        }
    });

    nodecg.listenFor("modifyPlayer", (value, ack) => {
        if (ack && !ack.handled) {
            db.modifyPlayer(value.id, value.name, value.sponsor, value.country,
                function(err, result) {
                    if (err) {
                        ack(new Error(err));
                    } else {
                        ack(null);
                    }
            });
        }
    });

    nodecg.listenFor("removePlayer", (value, ack) => {
        if (ack && !ack.handled) {
            db.removePlayer(value.id, function(err, result) {
                if (err) {
                    ack(new Error(err));
                } else {
                    ack(null);
                }
            });
        }
    });
};
