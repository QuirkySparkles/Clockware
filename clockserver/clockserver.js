var express = require("express");
var bodyParser = require("body-parser");
var clockserver = express();
var jsonParser = bodyParser.json();

clockserver.get("/", function(request, response) {
    console.log("I got this!");
    response.send("<h2>Test</h2>");
});

clockserver.post("/", jsonParser, function(request, response) {
    console.log("I got post");
    console.log(request.body);
    response.json(request.body.name);
});

clockserver.listen(8081);