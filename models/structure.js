var mongoose = require('mongoose');

var structureSchema = new mongoose.Schema({
  image: String,
  isGlobal: Boolean,
  name: String,
  structure: String
});

module.exports = mongoose.model('Structure', structureSchema);
