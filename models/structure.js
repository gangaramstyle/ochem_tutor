var mongoose = require('mongoose');

var structureSchema = new mongoose.Schema({
  iSGlobal: Boolean,
  name: String,
  image: Buffer,
  structure: String
});

module.exports = mongoose.model('Structure', structureSchema);
