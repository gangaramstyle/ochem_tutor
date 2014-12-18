var http = require('http'),
    express = require('express'),
    app = express(),
    nconf = require('nconf');

var server = http.createServer(app);

nconf.argv().env().file({ file: 'local.json' });

require('./settings')(app, express, nconf);
require('./routes')(app, nconf);

server.listen(process.env.PORT || nconf.get('port'));
console.log("Listening at 127.0.0.1:" + nconf.get('port'));
