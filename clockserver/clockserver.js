var express = require("express");
var bodyParser = require("body-parser");
var clockserver = express();
var jsonParser = bodyParser.json();
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'server1',
    password: 'dnmgdsal2',
    database: 'clockbase'
});

connection.connect();

clockserver.get("/", function(request, response) {
    console.log("I got this!");
    response.send("<h2>Test</h2>");
});

clockserver.post("/check", jsonParser, function(request, response, next) {
    var newRequest = prepareNewRequest(request.body.orderTime, request.body.clocksize);
    connection.query('SELECT order_time, master_id, clocksize FROM orders WHERE city = ? AND order_date = ?', [request.body.city, request.body.orderDate],
    function (err, results, fields) {
        if (err) console.log(err);
        if(!results) request.lockedMasters = false;
        request.lockedMasters = checkMasters(prepareExOrders(results), newRequest);
        next()
    });
},  function(request, response) {
        if(!request.lockedMasters) {
            connection.query('SELECT * FROM masters WHERE city = ?', [request.body.city], 
            function (err, results, fields) {
                if (err) console.log(err);
                response.json(results);
            });
        } else { connection.query('SELECT * FROM masters WHERE city = ? AND id NOT in (?)', [request.body.city, request.lockedMasters],
        function(err, results, fields) {
            if (err) console.log(err);
            response.json(results);
        }); }
});

clockserver.post("/register", jsonParser, function(request, response, next) {
    checkLength(request, next);
}, function(request, response, next) {
        connection.query("INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?)", [request.orderCount, request.body.city, request.body.masterId, request.body.clocksize[0], request.body.orderDate, request.body.orderTime], function(err, results, fields) {
            if (err) console.log(err);
            console.log("Order inserted!");
            next();
        });
}, function(request, response) {
        connection.query("INSERT INTO clients VALUES (?, ?, ?, ?, ?, ?)",
        [request.clientCount, request.body.name, request.body.email, request.body.clocksize[0], request.body.city, request.body.orderDate],
        function(err, results, fields) {
            if (err) console.log(err);
            console.log("Client inserted!");
        });
    response.send('ok');
});


function checkMasters(madeOrders, newRequest) {
    var lockedMasters = [];
    madeOrders.filter( (item) => {
        if(item[0] < newRequest[0] && item[2] < newRequest[0]) return true;
        else if(item[0] > newRequest[0] && item[0] > newRequest[1]) return true;
        else {
            if( lockedMasters.every( (item2) => item2 != item[1]) )
                lockedMasters.push(item[1]);
            return false;
        }
    });
    return (lockedMasters[0]) ? lockedMasters : false;        
}

function prepareNewRequest(requestedTime, requestClocksize) {
    if(requestedTime.indexOf(':') == 1) 
        var timeStart = Number(requestedTime.slice(0, 1));
    else var timeStart = Number(requestedTime.slice(0, 2));
    var timeEnd = timeStart;
    if (requestClocksize == 'small') timeEnd += 1;
    else if (requestClocksize == 'medium') timeEnd += 2;
    else timeEnd += 3;
    return [timeStart, timeEnd];
}

function prepareExOrders(exOrders) {
    var madeOrders = [];
    exOrders.forEach( (item, i) => {
        madeOrders.push([]);
        madeOrders[i].push( Number(item.order_time.slice(0, 2)) );
        madeOrders[i].push(item.master_id)
        madeOrders[i].push(item.clocksize);
        });
    madeOrders.map( (item) => {
        if(item[2] == 's') item[2] = item[0] + 1;
        else if(item[2] == 'm') item[2] = item[0] + 2;
        else item[2] = item[0] + 3;
    });
    return madeOrders;
}

function checkLength(request, next) {
    connection.query("SELECT (SELECT COUNT(*) FROM orders) as orders, (SELECT COUNT(*) FROM clients) as clients", function(err, results, fields) {
        if (err) console.log(err);
        request.orderCount = results[0].orders + 1;
        request.clientCount = results[0].clients + 1;
        next();
    });
}

clockserver.listen(8081);
