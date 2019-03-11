'use strict';

const sql = require("./sql.js");
const DB_PATH = "bundles/pika/pika.db"

module.exports = function (nodecg) {
    exports.nodecg = nodecg;

    let replicants = setupReplicants();
    let playerState = replicants.playerState;
    let scoreboardState = replicants.scoreboardState;
    nodecg.log.info("Replicants created");

    sql.openDatabase(DB_PATH, function() {
        nodecg.log.info("Connected to database");
    });

    setupHooks();

    /*
     * Sets up nodecg replicants.
     */
    function setupReplicants() {
        let playerState = nodecg.Replicant("player-state",
            { $persistent: false, defaultValue : {} } );

        let scoreboardState = nodecg.Replicant("scoreboard-state",
            { defaultValue : {
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

        return { playerState, scoreboardState };
    }

    /*
     * Set up nodecg hooks.
     */
    function setupHooks() {
        nodecg.listenFor("getPlayers", (value, ack) => {
            if (ack && !ack.handled) {
                sql.getPlayers(function(err, result) {
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
                sql.getPlayerById(value.id,
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
                sql.createPlayer(value.name, value.sponsor, value.country,
                    function(err, result) {
                        if (err) {
                            ack(new Error(err));
                        } else {
                            ack(null, result);
                            nodecg.log.info("Player '" + value.name + "' created");
                        }
                });
            }
        });

        nodecg.listenFor("modifyPlayer", (value, ack) => {
            if (ack && !ack.handled) {
                sql.modifyPlayer(value.id, value.name, value.sponsor, value.country,
                    function(err, result) {
                        if (err) {
                            ack(new Error(err));
                        } else {
                            ack(null);
                            nodecg.log.info("Player '" + value.name + "' modified");
                        }
                });
            }
        });

        nodecg.listenFor("removePlayer", (value, ack) => {
            if (ack && !ack.handled) {
                let name = "";

                sql.getPlayerById(value.id, function(err, result) {
                    if (err) {
                        nodecg.log.error(err);
                    } else {
                        name = result.name;
                    }
                });

                sql.removePlayer(value.id, function(err, result) {
                    if (err) {
                        ack(new Error(err));
                    } else {
                        ack(null);
                        nodecg.log.info("Player '" + name + "' removed");
                    }
                });
            }
        });
    }
};
