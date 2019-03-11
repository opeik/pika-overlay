const sqlite3 = require("sqlite3").verbose();
const pika = require("./index.js");

const DB_SCHEMA = ` CREATE TABLE IF NOT EXISTS Players (
                        id INTEGER NOT NULL PRIMARY KEY,
                        name TEXT NOT NULL,
                        sponsor TEXT NOT NULL,
                        country TEXT NOT NULL);`

exports.dbOpen = false;

/*
 * Opens the database.
 */
exports.openDatabase = function openDatabase(path, callback) {
    exports.db = new sqlite3.Database(path, function(err){
        if (err) {
            callback(new Error(err));
        } else {
            exports.db.exec(DB_SCHEMA, function(err) {
                if (err) {
                    callback(new Error(err));
                }
            });
        }

        exports.dbOpen = true;
        typeof callback === 'function' && callback(null);
    });
}

/*
 * Returns all players in the database.
 */
exports.getPlayers = function getPlayers(callback) {
    let query = "SELECT * "
       query += "FROM Players "
       query += "ORDER BY name "

    exports.db.all(query, [], function(err, result) {
        if (err) {
            callback(new Error(err));
        }

        if (typeof result !== "undefined") {
            callback(null, result);
        } else {
            callback(new Error("Unable to find any players"));
        }
    });
}

/*
 * Gets a player from the database.
 */
exports.getPlayerById = function getPlayerById(id, callback) {
    let query = "SELECT * "
       query += "FROM Players "
       query += "WHERE id = ? "

    exports.db.get(query, id, function(err, result) {
        if (err) {
            callback(new Error(err));
        }

        if (typeof result !== "undefined") {
            callback(null, result);
        } else {
            callback(new Error("Unable to find player with id = " + id));
        }
    });
}

/*
 * Creates a player in the database.
 */
exports.createPlayer = function createPlayer(name, sponsor, country, callback) {
    let query = "INSERT INTO Players (name, sponsor, country)"
       query += "VALUES (? ,?, ?) "

    exports.db.run(query, [name, sponsor, country], function(err, result) {
        if (err) {
            callback(new Error(err));
        } else {
            callback(null, this);
        }
    });
}

/*
 * Modifies a player in the database.
 */
exports.modifyPlayer = function modifyPlayer(id, name, sponsor, country, callback) {
    let query = "UPDATE Players "
       query += "SET name = ?, sponsor = ?, country = ? "
       query += "WHERE id = ? "

    exports.db.run(query, [name, sponsor, country, id], function(err) {
        if (err) {
            callback(new Error(err));
        } else {
            callback(null, this);
        }
    });
}

/*
 * Removes a player from the database.
 */
exports.removePlayer = function removePlayer(id, callback) {
    let query = "DELETE FROM Players "
       query += "WHERE id = ? "

    exports.db.run(query, [id], function(err) {
        if (err) {
            callback(new Error(err));
        } else {
            callback(null, id);
        }
    });
}

/*
 * Closes the database if it's open.
 */
exports.closeDatabase = function closeDatabase() {
    if (exports.sqlOpen) {
        pika.nodecg.log.info("Database closed");
        db.close();
    }
}

/* Close the database on exit. */
process.on('SIGINT', function() {
    exports.closeDatabase();
    process.exit()
});

process.on('SIGTERM', function() {
    exports.closeDatabase();
    process.exit()
});
