var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var clockserver = express(),
    mailer = require("express-mailer");
var jsonParser = bodyParser.json();
var mysql = require('mysql');
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");

var saltRounds = 10; //количество раундов хэширования

//шаблон и загрузчик для формирования писем, которые отправляются 
//клиентам при регистрации
clockserver.set('views', './views');
clockserver.set('view engine', 'pug');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'server1',
    password: 'dnmgdsal2',
    database: 'clockbase'
});

mailer.extend(clockserver, {
    from: "support@clockware.com",
    host: "smtp.gmail.com",
    secureConnection: true,
    port: 465,
    transportMethod: "SMTP",
    auth: {
        user: "example@example.com",
        pass: "password"
    }
});

var corsOptions = {
    origin: 'http://localhost:8080',
    credentials: true
}

// Для обработки сложных CORS запросов, которые перед основным запросом
// делают предзапрос.
clockserver.use(function (request, response, next) {
        if (request.method === "OPTIONS") {
            response.header('Access-Control-Allow-Origin', 'http://localhost:8080');
            response.header('Access-Control-Allow-Credentials', true);
            response.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
            response.sendStatus(200);
        }
        else next();
});

connection.connect();

clockserver.use(cors());
clockserver.use(cookieParser());

clockserver.get("/", function(request, response) {
    console.log("I got this!");
    response.send("Test completed!");
});

clockserver.post("/check", jsonParser, function (request, response, next) {
    var newRequest = prepareNewRequest(request.body.orderTime, request.body.clocksize);
    connection.query('SELECT order_time, master_id, clocksize FROM orders WHERE city = ? AND order_date = ?', [request.body.city, request.body.orderDate],
        function (err, results, fields) {
            if (err) {
                console.log(err);
                response.send("DB error");
            }
            if (!results) request.lockedMasters = false;
            request.lockedMasters = checkMasters(prepareExOrders(results), newRequest);
            next();
        });
},
    function (request, response) {
        if (!request.lockedMasters) {
            connection.query('SELECT * FROM masters WHERE city = ?', [request.body.city], 
                function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        response.send("DB error");
                    }
                    response.json(results);
                });
        } else { connection.query('SELECT * FROM masters WHERE city = ? AND id NOT in (?)', [request.body.city, request.lockedMasters],
            function (err, results, fields) {
                if (err) {
                    console.log(err);
                    response.send("DB error");
                }
                response.json(results);
            });
        }
    });

clockserver.post("/register", jsonParser, function (request, response, next) {
    checkLength(request, response, next);
},
    function (request, response, next) {
        checkEmail(request, response, next);
    },
    function (request, response, next) {
        connection.query("INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?)", [request.orderCount, request.body.city, request.body.masterId, request.body.clocksize[0], request.body.orderDate, request.body.orderTime], function (err, results, fields) {
            if (err) {
                console.log(err);
                response.send("DB error");
            }
            console.log("Order inserted!");
            next();
        });
    },
    function (request, response, next) {
        clockserver.mailer.send("email", prepareEmailForm(request), function (err) {
            if (err) {
                console.log(err);
                response.send("Email Error");
            }
            if (request.newClient) next();
            
            else response.send('ok');
        });
    },
    function (request, response) {
        connection.query("INSERT INTO clients VALUES (?, ?, ?, ?, ?, ?)",
            [request.clientCount, request.body.name, request.body.email, request.body.clocksize[0], request.body.city, request.body.orderDate],
            function (err, results, fields) {
                if (err) {
                    console.log(err);
                    response.send("DB error");
                }
                console.log("Client inserted!");
            });
        response.send('ok');
    });


clockserver.post("/auth", jsonParser, cors(corsOptions), function (request, response, next) {
        var adminLogin = "admin@example.com";
        var original = '$2b$10$jWTDY29jWWWL9eE2D0YgIudRIJvO9DcqZ1mkCD9thLynNuy78EEQ2';
        if (!request.body.login || !request.body.password) 
            return response.sendStatus(400);
        if (request.body.login !== adminLogin) return response.sendStatus(400);
        bcrypt.compare(request.body.password, original, function(err, res) {
            if (err) return response.sendStatus(500);
            if (!res) return response.sendStatus(400);
            request.legit = res;
            next();
        });
    },
    function(request, response) {
        if (!request.legit) return response.sendStatus(500);
        var token = jwt.sign({ login: request.body.login }, "confidential");
        response.cookie('access_token', token, { httpOnly: false, secure: false }).send();
});

clockserver.get("/admin", function (request, response) {
        if(!request.headers['authorization']) return response.sendStatus(401);
        try {
            var cookie = request.headers['authorization'];
            cookie = cookie.slice( cookie.indexOf('=') + 1 );
            var admintoken = jwt.verify(cookie, "confidential");
            if (admintoken.login == "admin@example.com") response.send("Access granted");
            else response.sendStatus(400);
        } catch (err) {
            console.log(err);
            return response.send('Access denied');
        }
});

//connection.end();

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
    else timeStart = Number(requestedTime.slice(0, 2));
    var timeEnd = timeStart;
    if (requestClocksize == 'small') timeEnd += 1;
    else if (requestClocksize == 'medium') timeEnd += 2;
    else timeEnd += 3;
    return [timeStart, timeEnd];
}

function prepareExOrders(existentOrders) {
    var madeOrders = [];
    existentOrders.forEach( (item, i) => {
        madeOrders.push([]);
        madeOrders[i].push( Number(item.order_time.slice(0, 2)) );
        madeOrders[i].push(item.master_id);
        madeOrders[i].push(item.clocksize);
        });
    madeOrders.map( (item) => {
        if(item[2] == 's') item[2] = item[0] + 1;
        else if(item[2] == 'm') item[2] = item[0] + 2;
        else item[2] = item[0] + 3;
    });
    return madeOrders;
}

function checkLength(request, response, next) {
    connection.query("SELECT (SELECT COUNT(*) FROM orders) as orders, (SELECT COUNT(*) FROM clients) as clients", function(err, results, fields) {
            if (err) {
                console.log(err);
                response.send("DB error");
            }
        request.orderCount = results[0].orders + 1;
        request.clientCount = results[0].clients + 1;
        next();
    });
}

function checkEmail(request, response, next) {
    var template = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/;
    if(!request.body.email.match(template)) response.send("Email error");
    connection.query("SELECT email FROM clients as email", 
        function(err, results, fields) {
            if (err) {
                console.log(err);
                response.send("DB error");
            }
        request.newClient = !results.some( (index) => index.email == request.body.email);
        next();
    });
}

function prepareEmailForm(request) {
    var time;
    var emailForm = {
        to: request.body.email,
        subject: "Компания Clockwork",
        name: request.body.name,
        city: request.body.city,
        time: request.body.orderTime
    };
    if(request.body.clocksize === "small") {
        emailForm.clocksize = "маленькие";
        time = "1 час";
    } else if(request.body.clocksize === "medium") {
        emailForm.clocksize = "средние";
        time = "2 часа";
    } else {
        emailForm.clocksize = "большие";
        time = "3 часа";
    }
    
    emailForm.message = `Починка Ваших часов займет примерно ${time}.`;
    
    emailForm.orderdate = `${request.body.orderDate.slice(8)}.${request.body.orderDate.slice(5, 7)}.${request.body.orderDate.slice(0, 4)}`;

    return emailForm;
}

clockserver.listen(8081);
