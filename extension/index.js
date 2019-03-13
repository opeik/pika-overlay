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

        let commentatorState = nodecg.Replicant("commentator-state",
            { defaultValue : {
                commentator1 : {
                    id : 0,
                    name : "Commentator 1",
                    social : "@commentator_1"
                },

                commentator2 : {
                    id : 0,
                    name : "Commentator 2",
                    social : "@commentator_2"
                }
        }});

        return { scoreboardState, commentatorState };
    }

    /*
     * Set up nodecg hooks.
     */
    function setupHooks() {
        nodecg.listenFor("getPlayers", function(value, ack) {
            if (ack && !ack.handled) {
                sql.getPlayers(function(err, result) {
                    if (err) {
                        nodecg.log.error(err);
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
                            nodecg.log.error(err);
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
                            nodecg.log.error(err);
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

                            ack(null, newId);
                            nodecg.log.info("Player '" + value.name + "' with ID " +
                                newId + " created");
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
                            nodecg.log.error(err);
                            ack(new Error(err));
                        } else {
                            sql.getPlayerById(value.id, function(err, newPlayer) {
                                if (err) {
                                    nodecg.log.error(err);
                                } else {
                                    nodecg.sendMessage("playerModified", newPlayer);
                                }
                            });

                            ack(null);

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
                        nodecg.log.error(err);
                        ack(new Error(err));
                    } else {
                        nodecg.sendMessage("playerRemoved", value.id);
                        ack(null);

                        nodecg.log.info("Player '" + name + "' with ID " +
                            value.id + " removed");

                    }
                });
            }
        });

        nodecg.listenFor("getCommentators", function(value, ack) {
            if (ack && !ack.handled) {
                sql.getCommentators(function(err, result) {
                    if (err) {
                        nodecg.log.error(err);
                        ack(new Error(err));
                    } else {
                        ack(null, result);
                    }
                });
            }
        });

        nodecg.listenFor("getCommentator", function(value, ack) {
            if (ack && !ack.handled) {
                sql.getCommentatorById(value.id,
                    function(err, result) {
                        if (err) {
                            nodecg.log.error(err);
                            ack(new Error(err));
                        } else {
                            ack(null, result);
                        }
                });
            }
        });

        nodecg.listenFor("createCommentator", function(value, ack) {
            if (ack && !ack.handled) {
                sql.createCommentator(value.name, value.social,
                    function(err, result) {
                        if (err) {
                            nodecg.log.error(err);
                            ack(new Error(err));
                        } else {
                            let newId = result.lastID;

                            sql.getCommentatorById(newId, function(err, newCommentator) {
                                if (err) {
                                    nodecg.log.error(err);
                                } else {
                                    nodecg.sendMessage("commentatorCreated", newCommentator);
                                }
                            });

                            ack(null, newId);
                            nodecg.log.info("Commentator '" + value.name + "' with ID " +
                                newId + " created");
                        }
                });
            }
        });

        nodecg.listenFor("modifyCommentator", function(value, ack) {
            if (ack && !ack.handled) {
                let oldName = "";

                sql.getCommentatorById(value.id, function(err, result) {
                    if (err) {
                        nodecg.log.error(err);
                    } else {
                        oldName = result.name;
                    }
                });

                sql.modifyCommentator(value.id, value.name, value.social,
                    function(err, result) {
                        if (err) {
                            ack(new Error(err));
                        } else {
                            sql.getCommentatorById(value.id, function(err, newCommentator) {
                                if (err) {
                                    nodecg.log.error(err);
                                } else {
                                    nodecg.sendMessage("commentatorModified", newCommentator);
                                }
                            });

                            ack(null);

                            if (oldName != value.name) {
                                nodecg.log.info("Commentator '" + oldName +
                                                "' with ID " + value.id +
                                                " modified, name is now '" +
                                                value.name + "'");
                            } else {
                                nodecg.log.info("Commentator '" + oldName +
                                                "' with ID " +
                                                value.id + " modified");
                            }

                        }
                });
            }
        });

        nodecg.listenFor("removeCommentator", function(value, ack) {
            if (ack && !ack.handled) {
                let name = "";

                sql.getCommentatorById(value.id, function(err, result) {
                    if (err) {
                        nodecg.log.error(err);
                    } else {
                        name = result.name;
                    }
                });

                sql.removeCommentator(value.id, function(err, result) {
                    if (err) {
                        nodecg.log.error(err);
                        ack(new Error(err));
                    } else {
                        nodecg.sendMessage("commentatorRemoved", value.id);
                        ack(null);

                        nodecg.log.info("Commentator '" + name + "' with ID " +
                            value.id + " removed");

                    }
                });
            }
        });
    }
};
