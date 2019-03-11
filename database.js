const sqlite3 = require("sqlite3").verbose();

const DB_PATH = "players.db"
const DB_SCHEMA = ` CREATE TABLE IF NOT EXISTS Players (
                        id INTEGER NOT NULL PRIMARY KEY,
                        name TEXT NOT NULL,
                        sponsor TEXT NOT NULL,
                        country TEXT NOT NULL);`

exports.dbOpen = false;

/* Connect to the players database. */
const db = new sqlite3.Database(DB_PATH, function(err){
    if (err) {
        console.log(new Error(err));
        return;
    } else {
        db.exec(DB_SCHEMA, function(err) {
            if (err) {
                console.log(new Error(err));
            }
        });
    }

    console.log("Connected to " + DB_PATH + " database");
    exports.dbOpen = true;
});

/*
 * Returns all players in the players database.
 */
exports.getPlayers = function getPlayers(callback) {
    let sql = "SELECT * "
       sql += "FROM Players "
       sql += "ORDER BY name "

    db.all(sql, [], function(err, result) {
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
 * Gets a player from the players database.
 */
exports.getPlayerById = function getPlayerById(id, callback) {
    let sql = "SELECT * "
       sql += "FROM Players "
       sql += "WHERE id = ? "

    db.get(sql, id, function(err, result) {
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
 * Creates a player in the players database.
 */
exports.createPlayer = function createPlayer(name, sponsor, country, callback) {
    let sql = "INSERT INTO Players (name, sponsor, country)"
       sql += "VALUES (? ,?, ?) "

    db.run(sql, [name, sponsor, country], function(err, result) {
        if (err) {
            callback(new Error(err));
        } else {
            callback(null, this);
        }
    });
}

/*
 * Modifies an existing player in the players database.
 */
exports.modifyPlayer = function modifyPlayer(id, name, sponsor, country, callback) {
    let sql = "UPDATE Players "
       sql += "SET name = ?, sponsor = ?, country = ? "
       sql += "WHERE id = ? "

    db.run(sql, [name, sponsor, country, id], function(err) {
        if (err) {
            callback(new Error(err));
        } else {
            callback(null);
        }
    });
}

exports.removePlayer = function removePlayer(id, callback) {
    let sql = "DELETE FROM Players "
       sql += "WHERE id = ? "

    db.run(sql, [id], function(err) {
        if (err) {
            callback(new Error(err));
        } else {
            callback(null);
        }
    });
}

/*
 * Closes the database if it's open.
 */
exports.closeDatabase = function closeDatabase() {
    if (exports.dbOpen) {
        db.close();
    }
}

/*
 * Close the database on exit.
 */
process.on('SIGINT', () => {
    exports.closeDatabase();
    process.exit()
});

process.on('SIGTERM', () => {
    exports.closeDatabase();
    process.exit()
});

