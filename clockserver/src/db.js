var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'server1',
    password: 'dnmgdsal2',
    database: 'clockbase'
});

module.exports = connection;