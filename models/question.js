var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
  content: String,
  concepts: [],
  numCorrect: Number,
  numResponses: Number
});

module.exports = mongoose.model('Question', questionSchema);
