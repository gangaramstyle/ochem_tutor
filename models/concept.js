var mongoose = require('mongoose');

var conceptSchema = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model('Concept', conceptSchema);
