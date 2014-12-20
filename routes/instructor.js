var Question = require('../models/question');
var Concept = require('../models/concept')

module.exports = function(app) {
  app.get('/instructor', function(req, res) {
    res.render('instructor', {
      username: req.session.username
    });
  });

  app.post('/instructor/new-question', function(req, res) {
    if (!req.body.content) { // || !req.body.conceptTags
      res.send(422, 'Must provide title, content and concept tags.');
      return;
    }

    var question = new Question({
      content: req.body.content,
      concepts: req.body.concepts,
      numCorrect: 0,
      numResponses: 0
    });

    question.save(function(error, question) {
      if (error) {
        throw error;
      } else {
        res.json(200, question);
      }
    });
  });

  app.get('/instructor/questions', function(req, res) {
    Question.find(function(error, questions) {
      if (error) {
        throw error;
      } else {
        res.json(200, questions);
      }
    });
  });

  app.get('/instructor/analytics', function(req, res) {
    res.json(200, {});
  })

  app.get('/instructor/concepts', function(req, res) {
    if (!req.query.query) {
      res.send(422, 'Must provide query.');
      return;
    }
    Concept.find(function(error, concepts) {
      if (error) {
        throw error;
      } else {
        res.json(200, concepts.filter(function(concept) {
          return concept.tag.toLowerCase().indexOf(req.query.query.toLowerCase()) > -1;
        }));
      }
    });
  });

  app.post('/instructor/new-concept', function(req, res) {
    if (!req.body.tag) {
      res.send(422, 'Must provide tag.');
      return;
    }

    var concept = new Concept({
      tag: req.body.tag
    });

    concept.save(function(error, concept) {
      if (error) {
        throw error;
      } else {
        res.json(200, concept);
      }
    });
  });

};
