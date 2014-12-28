var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
  concepts: [],
  content: String,
  numAttempts: Number,
  numCorrect: Number,
  structures: [],
});

module.exports = mongoose.model('Question', questionSchema);
