(function(window, document, undefined) {

  var SPACE_KEYCODE = 32;
  var AT_KEYCODE = 64;

  // Retrieve and compile the Handlebars template for rendering posts
  var $newQuestion = $('#new-question-template');
  var $questionsList = $('#questions-list-template')
  var $analytics = $('#analytics-template');
  var $autocompletePanel = $('#autocomplete-panel-template')
  var $autocompleteOption = $('#autocomplete-option-template');
  var templates = {
    renderNewQuestion: Handlebars.compile($newQuestion.html()),
    renderQuestionsList: Handlebars.compile($questionsList.html()),
    renderAnalytics: Handlebars.compile($analytics.html()),
    renderAutocompletePanel: Handlebars.compile($autocompletePanel.html()),
    renderAutocompleteOption: Handlebars.compile($autocompleteOption.html())
  };

  var InstructorView = {};

  InstructorView.render = function() {
    var $dashboard = $('#dashboard');
    var $active = $('.active');
    if ($active.hasClass('new-question')) {
      InstructorView.renderNewQuestion($dashboard);
    } else if ($active.hasClass('question-list')) {
      InstructorView.renderQuestionsList($dashboard);
    } else if ($active.hasClass('analytics')) {
      InstructorView.renderAnalytics($dashboard);
    }
    var $sidebar = $('.sidebar');
    InstructorView.renderSidebar($sidebar);
  }

  InstructorView.renderNewQuestion = function($dashboard) {
    $dashboard.html($(templates.renderNewQuestion()));

    var molID = 0;
    var structures = [];
    var defaultMol = "<cml><MDocument></MDocument></cml>";
    var defaultImg = "";
    var currStruct = null;

    var imgSettings = {
      'width' : 100,
      'height' : 100
    };

    function importMol(mol) {
      var mvn = MarvinJSUtil.getEditor("#sketch");
      mvn.then(function (sketcherInstance) {
        sketcherInstance.importStructure("cml", mol).catch(function(error) {
          alert(error);
        });
      });
    }


    function exportStructTo(structIndex) {
      var mvn = MarvinJSUtil.getEditor("#sketch");
      mvn.then(function (sketcherInstance) {

        sketcherInstance.exportStructure("mrv").then(function(mol) {
          structures[structIndex].mol = mol;
        }, function(error) {
          alert("Mol export failed:"+error);
        });

        sketcherInstance.exportStructure("png", imgSettings).then(function(img) {
          structures[structIndex].img = img;
          $("#figures").append("<img id='"+structures[structIndex].name+"' class='thumbnails bordered'/>");
          $("#"+structures[structIndex].name).attr("src", img);
        }, function(error) {
          alert("Img export failed:"+error);
        });

      });
    }


    function getIndex(name) {
      for (var struct in structures) {
        if (structures[struct].name == name) {
          return struct;
        }
      } return -1;
    }

    function getNewName() {
      return "" + molID++;
    }


    function createNewStruct(mol) {
      currStruct = {name: getNewName(), img: null, mol: mol}
      importMol(currStruct.mol);
    }

    function editStruct(structName) {
      var structIndex = getIndex(structName);
      currStruct = structures[structIndex];
      importMol(currStruct.mol);
    }


    function saveStruct() {
      var structIndex = getIndex(currStruct.name);
      if (structIndex == -1) {
        structures.push(currStruct);
        structIndex = getIndex(currStruct.name);
        //--create img tag
      }
      exportStructTo(structIndex);
    }


    $("#Modal").click(function() {
      createNewStruct(defaultMol);
      $('#marvinjs').modal('show');
    });

    $("#Insert").click(function() {
      saveStruct();
      $('#marvinjs').modal('hide');
    })

    $("#figures").on('click', 'img.thumbnails', function() {
      editStruct($(this).attr('id'));
      $('#marvinjs').modal('show');
    });





    var $newQuestion = $('form.new-question');
    initializeListeners($newQuestion.find('textarea.content[name="question"]'));
    initializeListeners($newQuestion.find('textarea.content[name="answer"]'));


    function initializeListeners($content) {
      var startCaretPos = -1;
      var endCaretPos = -1;

      // Insert structure-tag related @ listener
      $content.keypress(function(event) {
        var curCaretPos = $content.caret(); // caret position before character insertion
        if (event.keyCode === AT_KEYCODE) {
          startCaretPos = curCaretPos + 1;
        } else if (event.keyCode === SPACE_KEYCODE) {
          startCaretPos = -1;
        } else if (startCaretPos >= 0 && startCaretPos < curCaretPos + 1) {
          var textareaValue = $content.val();
          var tagValue = (textareaValue.substr(startCaretPos, curCaretPos - startCaretPos) + String.fromCharCode(event.keyCode));
          InstructorModel.loadStructures(tagValue, function(error, structures) {
            var $panel = $('.autocomplete-panel');
            // insert as a sibling of $content
            $panel.html($(templates.renderAutocompletePanel()));
            var $options = $('.autocomplete-options');
            structures.forEach(function(structure) {
              var $option = $(templates.renderAutocompleteOption({structure: structure}));
              $options.append($option);
              console.log($options.html());
              // $option.prependTo($options);
            });
          });
        }
      });

      // Keyup fires after default action of the key (caret position has been incremented)
      $content.keyup(function(event) {
        var curCaretPos = $content.caret();

        if (curCaretPos < startCaretPos) {
          startCaretPos = -1;
        } else {
          var textareaValue = $content.val();
          var spacePos = textareaValue.substr(0, curCaretPos).lastIndexOf(' ') + 1; // if no space exists, spacePos will be 0
          var atPos = textareaValue.substr(spacePos, curCaretPos - spacePos).indexOf('@'); // relative to the space
          if (atPos >= 0) {
            startCaretPos = spacePos + atPos + 1;
          }
        }
      });
    }

    // Insert concept-tag related listener


    $newQuestion.submit(function(event) {
      event.preventDefault();
      var title = $newQuestion.find('.title').val();
      var content = $newQuestion.find('.content').val();
      InstructorModel.newQuestion({
        title: title,
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

  InstructorView.renderSidebar = function($sidebar) {
    $sidebar.unbind('click');
    $sidebar.click(function(event) {
      var $inactiveTarget = $(event.target).closest('.inactive');
      if ($inactiveTarget.size() > 0) {
        var $activeTarget = $inactiveTarget.siblings('.active')
        $inactiveTarget.toggleClass('active inactive');
        $activeTarget.toggleClass('active inactive');
        InstructorView.render();
      }
    });
  }

  InstructorView.render(); // render the Instructor View

  window.InstructorView = InstructorView;

})(this, this.document);
