(function(window, document, undefined) {
  var InstructorModel = {};

  var INSTRUCTOR_URL = '/instructor';
  var STATUS_OK = 200;

  /**
   * Posts new question.
   *
   * Calls: callback(error, results)
   *  question -- an associative array of question properties
   *  error -- the error that occurred or NULL if no error occurred
   */
  InstructorModel.newQuestion = function(question, callback) {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function() {
      if (request.status === STATUS_OK) {
        callback(null, JSON.parse(request.responseText));
      } else {
        callback(request.responseText);
      }
    });

    request.open('POST', INSTRUCTOR_URL + '/new-question', true);
    request.setRequestHeader('Content-type', 'application/json');
    request.send(JSON.stringify(question));
  };

  /**
   * Loads question list.
   *
   * Calls: callback(error, results)
   *  error -- the error that occurred or NULL if no error occurred
   */
  InstructorModel.loadQuestionList = function(callback) {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function() {
      if (request.status === STATUS_OK) {
        callback(null, JSON.parse(request.responseText));
      } else {
        callback(request.responseText);
      }
    });

    request.open('GET', INSTRUCTOR_URL + '/questions', true);
    request.send();
  };

  /**
   * Loads analytics.
   *
   * Calls: callback(error, results)
   *  error -- the error that occurred or NULL if no error occurred
   */
  InstructorModel.loadAnalytics = function(callback) {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function() {
      if (request.status === STATUS_OK) {
        callback(null, JSON.parse(request.responseText));
      } else {
        callback(request.responseText);
      }
    });

    request.open('GET', INSTRUCTOR_URL + '/analytics', true);
    request.send();
  };

  /**
   * Loads concepts containing query as a substring.
   *
   * Calls: callback(error, results)
   *  error -- the error that occurred or NULL if no error occurred
   */
  InstructorModel.loadConcepts = function(query, callback) {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function() {
      if (request.status === STATUS_OK) {
        callback(null, JSON.parse(request.responseText));
      } else {
        callback(request.responseText);
      }
    });

    request.open('GET', INSTRUCTOR_URL + '/concepts?query=' + query, true);
    request.send();
  };

  /**
   * Posts new concept.
   *
   * Calls: callback(error, results)
   *  concept -- {tag: 'Ketone'}
   *  error -- the error that occurred or NULL if no error occurred
   */
  InstructorModel.newConcept = function(concept, callback) {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function() {
      if (request.status === STATUS_OK) {
        callback(null, JSON.parse(request.responseText));
      } else {
        callback(request.responseText);
      }
    });

    request.open('POST', INSTRUCTOR_URL + '/new-concept', true);
    request.setRequestHeader('Content-type', 'application/json');
    request.send(JSON.stringify(concept));
  };

  window.InstructorModel = InstructorModel;
})(this, this.document);
