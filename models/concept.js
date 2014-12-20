var mongoose = require('mongoose');

var conceptSchema = new mongoose.Schema({
  tag: String
});

module.exports = mongoose.model('Concept', conceptSchema);
