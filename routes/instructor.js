var Question = require('../models/question');
var Concept = require('../models/concept');
var Structure = require('../models/structure');

module.exports = function(app) {
  app.get('/instructor', function(req, res) {
    res.render('instructor', {
      username: req.session.username
    });
  });

  app.post('/instructor/new-question', function(req, res) {
    if (!req.body.content) { // || !req.body.concepts || !req.body.structures
      res.send(422, 'Must provide title, content and concept names.');
      return;
    }

    var question = new Question({
      concepts: req.body.concepts,
      content: req.body.content,
      numAttempts: 0,
      numCorrect: 0,
      structures: req.body.structures
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
    var query = req.query.query;
    if (query === undefined) {
      res.send(422, 'Must provide query.');
      return;
    }
    Concept.find(function(error, concepts) {
      if (error) {
        throw error;
      } else {
        res.json(200, concepts.filter(function(concept) {
          return concept.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
        }));
      }
    });
  });

  app.post('/instructor/new-concept', function(req, res) {
    if (!req.body.name) {
      res.send(422, 'Must provide name of concept.');
      return;
    }

    var concept = new Concept({
      name: req.body.name
    });

    concept.save(function(error, concept) {
      if (error) {
        throw error;
      } else {
        res.json(200, concept);
      }
    });
  });

  app.get('/instructor/structures', function(req, res) {
    var query = req.query.query;
    if (query === undefined) {
      res.send(422, 'Must provide query.');
      return;
    }
    Structure.find(function(error, structures) {
      if (error) {
        throw error;
      } else {
        res.json(200, structures.filter(function(structure) {
          return structure.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
        }));
      }
    });
  });

  app.get('/instructor/structure', function(req, res) {
    var id = req.query.id;
    if (id === undefined) {
      res.send(422, 'Must provide id.');
      return;
    }
    Structure.findById(id, function(error, structure) {
      if (error) {
        throw error;
      } else {
        res.json(200, structure);
      }
    });
  });

  app.post('/instructor/update-structure', function(req, res) {
    if (!('id' in req.body) || !('isGlobal' in req.body) || !('name' in req.body) || !('structure' in req.body) || !('image' in req.body)) {
      res.send(422, 'Must provide image, name, scope, structure of structure.');
      return;
    }
    Structure.findById(req.body.id, function(error, structure) {
      if (error) {
        throw error;
      }
      structure.image = req.body.image;
      structure.isGlobal = req.body.isGlobal;
      structure.name = req.body.name;
      structure.structure = req.body.structure;
      structure.save(function(error) {
        if (error) {
          throw error;
        } else {
          res.json(200, structure);
        }
      });
    });
  });

  app.post('/instructor/new-structure', function(req, res) {
    if (req.body.isGlobal === undefined || req.body.name === undefined || req.body.structure === undefined || req.body.image === undefined) {
      res.send(422, 'Must provide image, name, scope, structure of structure.');
      return;
    }
    var structure = new Structure({
      image: req.body.image,
      isGlobal: req.body.isGlobal,
      name: req.body.name,
      structure: req.body.structure
    });
    structure.save(function(error, structure) {
      if (error) {
        throw error;
      } else {
        res.json(200, structure);
      }
    });
  });

  app.post('/instructor/remove-structure', function(req, res) {
    var id = req.body.id;
    if (!id) {
      res.send(422, 'Must provide an id.');
      return;
    }

    Structure.findByIdAndRemove(id, function(error, structure) {
      if (error) {
        throw error;
      } else {
        res.send(200);
      }
    });
  });
};
