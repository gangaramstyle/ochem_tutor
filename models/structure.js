var mongoose = require('mongoose');

var structureSchema = new mongoose.Schema({
  name: String,
  structure: String
});

module.exports = mongoose.model('Structure', structureSchema);
