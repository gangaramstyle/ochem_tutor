var mongoose = require('mongoose');

var structureSchema = new mongoose.Schema({
  tag: String
});

module.exports = mongoose.model('Structure', structureSchema);
