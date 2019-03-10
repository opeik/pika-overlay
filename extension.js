'use strict';

const db = require("./database");

module.exports = function (nodecg) {
    let scoreboardState = nodecg.Replicant("scoreboard", {defaultValue : {
        player1Name : "Player 1",
        player1Sponsor : "",
        player1Score : 0,
        player2Name : "Player 2",
        player2Sponsor : "",
        player2Score : 0,
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
