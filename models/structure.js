var mongoose = require('mongoose');

var structureSchema = new mongoose.Schema({
  tag: String,
  structure: String
});

module.exports = mongoose.model('Structure', structureSchema);
