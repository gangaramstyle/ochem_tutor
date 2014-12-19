module.exports = function(app) {
  app.get('/student', function(req, res) {
    res.render('student');
  });
};
