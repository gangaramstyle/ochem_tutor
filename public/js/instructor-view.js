(function(window, document, undefined) {

  // Retrieve and compile the Handlebars template for rendering posts
  var $newQuestion = $('#new-question-template');
  var $questionsList = $('#questions-list-template')
  var $analytics = $('#analytics-template');
  var $figureTile = $('#figure-tile-template');
  var templates = {
    renderNewQuestion: Handlebars.compile($newQuestion.html()),
    renderQuestionsList: Handlebars.compile($questionsList.html()),
    renderAnalytics: Handlebars.compile($analytics.html()),
    renderFigureTile: Handlebars.compile($figureTile.html())
  };

  var InstructorView = {};

  InstructorView.render = function($body) {
    var $dashboard = $body.find('#dashboard');
    var $sidebar = $body.find('.sidebar');

    InstructorView.renderSidebar($body, $sidebar);

    var $active = $sidebar.find('.active');
    if ($active.hasClass('new-question')) {
      InstructorView.renderNewQuestion($dashboard);
    } else if ($active.hasClass('question-list')) {
      InstructorView.renderQuestionsList($dashboard);
    } else if ($active.hasClass('analytics')) {
      InstructorView.renderAnalytics($dashboard);
    }
  }

  InstructorView.renderNewQuestion = function($dashboard) {
    $dashboard.html($(templates.renderNewQuestion()));

    $('textarea.content.mention').mentionsInput({
      // plusCallback will be invoked when user clicks "Create new [x]" ...
      // if not specified then autocomplete list will not contain this option
      plusCallback: function() {
        InstructorView.renderStructureModal($('#marvin'), null, function() {
          /* Insert reference into question */
        });
      },
      onDataRequest: function(mode, query, callback) {
        InstructorModel.loadStructures(query, function(error, structures) {
          structures.forEach(function(structure) {
            structure.id = structure._id;
            structure.type = 'structure';
          });
          callback.call(this, structures);
        });
      }
    });

    $('textarea.concept-tags.mention').mentionsInput({
      onDataRequest: function(mode, query, callback) {
        InstructorModel.loadConcepts(query, function(error, concepts) {
          concepts.forEach(function(concept) {
            concept.id = concept._id;
            concept.type = 'concept';
          });
          callback.call(this, concepts);
        });
      }
    });

    $newQuestion.submit(function(event) {
      event.preventDefault();
      var content = $newQuestion.find('.content').val();
      InstructorModel.newQuestion({
        content: content
      }, function(error, question) {
        if (error) {
          $('.error').text('Failed to create new question.');
        } else {
          $newQuestion.find('.title, .content').val('');
          // $newQuestion.find('.content').val('');
          $('.success').text('Created new question.');
        }
      });
    });

    $("#Modal").click(function() {
      InstructorView.renderStructureModal($('#marvin'), null);
    });
  }

  InstructorView.renderQuestionsList = function($dashboard) {
    InstructorModel.loadQuestionList(function(error, questions) {
      $dashboard.html($(templates.renderQuestionsList({
        questions: questions
      })));
    });
  }

  InstructorView.renderAnalytics = function($dashboard) {
    InstructorModel.loadAnalytics(function(error, analytics) {
      $dashboard.html($(templates.renderAnalytics(analytics)));
    });
  }

  InstructorView.renderSidebar = function($body, $sidebar) {
    $sidebar.unbind('click');
    $sidebar.click(function(event) {
      var $inactiveTarget = $(event.target).closest('.inactive');
      if ($inactiveTarget.size() > 0) {
        var $activeTarget = $inactiveTarget.siblings('.active')
        $inactiveTarget.toggleClass('active inactive');
        $activeTarget.toggleClass('active inactive');
        InstructorView.render($body);
      }
    });
  }

  InstructorView.renderStructureModal = function($marvin, id, callback) {
    var marvinEditor = MarvinJSUtil.getEditor('#sketch');
    StructureUtils.importStructure(id, marvinEditor);
    var $insert = $marvin.find('#insert');
    var $remove = $marvin.find("#remove");
    $insert.unbind('click');
    $remove.unbind('click');
    $insert.click(function(event) {
      if (id) {
        StructureUtils.updateStructure(id, false, 'default-name', marvinEditor, templates);
      } else {
        StructureUtils.newStructure(false, 'default-name', marvinEditor, templates);
      }
      $marvin.modal('hide');
    })
    $remove.click(function(event) {
      StructureUtils.removeStructure(id);
      $marvin.modal('hide');
    });
    $marvin.modal('show');
  }

  InstructorView.render($(document.body)); // render the Instructor View

  window.InstructorView = InstructorView;

})(this, this.document);
