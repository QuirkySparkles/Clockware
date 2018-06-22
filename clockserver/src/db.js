var mysql = require('mysql');
var mode = process.env.NODE_ENV;
var devConfig = {
    host: 'localhost',
    user: 'server1',
    password: 'dnmgdsal2',
    database: 'clockbase',
    timezone: 'Z',
    multipleStatements: true
};

var prodConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'heroku_758a2f80740381e',
    timezone: 'Z',
    multipleStatements: true
};

function newConnection() {
    if(mode == 'development') return mysql.createConnection(devConfig);
    else return mysql.createConnection(prodConfig);
}

function handleDisconnect() {
    var connection = newConnection();
    connection.connect( function(err) {
        if(err) console.log(err);
    });
    
    connection.on("error", function (err) {
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log("SQL connection error: " + err);
            console.log("Reconnecting to DB...");
            handleDisconnect();
        }
        else throw err;
    });
    
    module.exports.connection = connection;
}

module.exports.getConnection = function() {
    if ((module.exports.connection) && (module.exports.connection._socket)
            && (module.exports.connection._socket.readable)
            && (module.exports.connection._socket.writable)) {
        return module.exports.connection;
    }
    
    handleDisconnect();
    return module.exports.connection;
};

module.exports.getConnection();