module.exports = function(app, nconf) {
  app.get('/', function(req, res) {
    res.render('index');
  });
};
