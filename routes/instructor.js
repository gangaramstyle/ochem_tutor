module.exports = function(app) {
  app.get('/instructor', function(req, res) {
    res.render('instructor');
  });
};
