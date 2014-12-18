var utils = require('./lib/utils.js');

module.exports = function(app, express, nconf, sessionStore) {
  // app.configure
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });

  // body parser
  app.use(express.bodyParser());

  // override with X-HTTP-Method-Override header in request
  app.use(express.methodOverride());

  // cookie parser
  app.use(express.cookieParser());

  // by default: session middleware uses the memory store bundled with Connect
  app.use(express.session({
    secret: 'pedometer almonds',
    resave: true,
    saveUninitialized: true
  }));

  app.use(express.static(__dirname + '/public'));

  app.use(app.router);

  // last handler, assume 404 at this point
  app.use(utils.render404);
}
