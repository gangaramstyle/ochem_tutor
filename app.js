var http = require('http');
var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/chemyst-db');

var server = http.createServer(app);

require('./settings')(app, express);
require('./routes')(app);
require('./routes/student')(app);
require('./routes/instrutor')(app);

server.listen(process.env.PORT || 3155);
console.log("Listening at 127.0.0.1:" + 3155);
