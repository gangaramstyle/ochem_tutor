var http = require('http');
var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/chemyst-db');

var server = http.createServer(app);

require('./settings')(app, express);
require('./routes/index.js')(app);
require('./routes/instructor.js')(app);
require('./routes/student.js')(app);

server.listen(process.env.PORT || 8888);
console.log("Listening at 127.0.0.1:" + 8888);
