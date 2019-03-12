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
        nodecg.listenFor("getPlayers", function(value, ack) {
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

        nodecg.listenFor("getPlayer", function(value, ack) {
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

        nodecg.listenFor("createPlayer", function(value, ack) {
            if (ack && !ack.handled) {
                sql.createPlayer(value.name, value.sponsor, value.country,
                    function(err, result) {
                        if (err) {
                            ack(new Error(err));
                        } else {
                            let newId = result.lastID;

                            sql.getPlayerById(newId, function(err, newPlayer) {
                                if (err) {
                                    nodecg.log.error(err);
                                } else {
                                    nodecg.sendMessage("playerCreated", newPlayer);
                                }
                            });

                            nodecg.log.info("Player '" + value.name + "' with ID " +
                                newId + " created");
                            ack(null, newId);
                        }
                });
            }
        });

        nodecg.listenFor("modifyPlayer", function(value, ack) {
            if (ack && !ack.handled) {
                let oldName = "";

                sql.getPlayerById(value.id, function(err, result) {
                    if (err) {
                        nodecg.log.error(err);
                    } else {
                        oldName = result.name;
                    }
                });

                sql.modifyPlayer(value.id, value.name, value.sponsor, value.country,
                    function(err, result) {
                        if (err) {
                            ack(new Error(err));
                        } else {
                            if (oldName != value.name) {
                                nodecg.log.info("Player '" + oldName +
                                                "' with ID " + value.id +
                                                " modified, name is now '" +
                                                value.name + "'");
                            } else {
                                nodecg.log.info("Player '" + oldName +
                                                "' with ID " +
                                                value.id + " modified");
                            }

                            nodecg.sendMessage("playerModified", value.id);
                            ack(null);
                        }
                });
            }
        });

        nodecg.listenFor("removePlayer", function(value, ack) {
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
                        nodecg.log.info("Player '" + name + "' with ID " +
                            value.id + " removed");
                        nodecg.sendMessage("playerRemoved", value.id);
                        ack(null);
                    }
                });
            }
        });
    }
};
