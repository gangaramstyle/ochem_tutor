(function(window, document, undefined) {

  var ENTER_KEYCODE = 13;
  var SPACE_KEYCODE = 32;
  var UP_KEYCODE = 38;
  var DOWN_KEYCODE = 40;
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
        $("#figures").append("<img id='"+structures[structIndex].name+"' class='thumbnails bordered'/>");
      }
      exportStructTo(structIndex);
    }

    function exportStructTo(structIndex) {

      var mvn = MarvinJSUtil.getEditor("#sketch");
      mvn.then(function (sketcherInstance) {

        sketcherInstance.exportStructure("mrv").then(function(mol) {
          structures[structIndex].mol = mol;
          console.log(mol);
        }, function(error) {
          alert("Mol export failed:"+error);
        });

        sketcherInstance.exportStructure("png", imgSettings).then(function(img) {
          structures[structIndex].img = img;
          $("#"+structures[structIndex].name).attr("src", img);
        }, function(error) {
          alert("Img export failed:"+error);
        });

      });
    }

    function deleteStruct() {
      if ($("#"+currStruct.name).length) {
        var structIndex = getIndex(currStruct.name);
        delete structures[structIndex];
        $("#"+currStruct.name).remove();
        console.log(structures);
      }

    }

    $("#Modal").click(function() {
      createNewStruct(defaultMol);
      $('#marvinjs').modal('show');
    });

    $("#insert").click(function() {
      saveStruct();
      $('#marvinjs').modal('hide');
    })

    $("#figures").on('click', 'img.thumbnails', function() {
      editStruct($(this).attr('id'));
      $('#marvinjs').modal('show');
    });

    $("#delete").click(function () {
      deleteStruct();
      $('#marvinjs').modal('hide');
    });

    $('textarea.content.mention').mentionsInput({
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

    // // Enable /js/lib/jquery.autosize.min.js
    // $('textarea').autosize();

    // var $newQuestion = $('#new-question-form');
    // initializeListeners($newQuestion.find('div.entry[name="question"]'));
    // initializeListeners($newQuestion.find('div.entry[name="answer"]'));


    // function initializeListeners($entry) {
    //   var startCaretPos = -1;
    //   var endCaretPos = -1;
    //   var $content = $entry.find('textarea.content');
    //   // Insert structure-tag related @ listener
    //   $content.keypress(function(event) {
    //     var curCaretPos = $content.caret(); // caret position before character insertion
    //     if (event.keyCode === AT_KEYCODE) {
    //       startCaretPos = curCaretPos + 1;
    //     } else if (event.keyCode === SPACE_KEYCODE) {
    //       startCaretPos = -1;
    //     } else if (startCaretPos >= 0 && startCaretPos < curCaretPos + 1) {
    //       if (event.keyCode === ENTER_KEYCODE) {
    //         var $activeOption = $entry.find('.autocomplete-option.active')
    //         if ($activeOption.length === 1) {
    //           event.preventDefault();
    //           console.log('here');
    //           return;
    //         }
    //       }
    //       var textareaValue = $content.val();
    //       var tagValue = (textareaValue.substr(startCaretPos, curCaretPos - startCaretPos) + String.fromCharCode(event.keyCode));
    //       InstructorModel.loadStructures(tagValue, function(error, structures) {
    //         console.log(structures);
    //         var $panel = $entry.find('.autocomplete-panel');
    //         // insert as a sibling of $content
    //         $panel.html($(templates.renderAutocompletePanel()));
    //         var $options = $('.autocomplete-options');
    //         structures.forEach(function(structure) {
    //           var $option = $(templates.renderAutocompleteOption({structure: structure}));
    //           $options.append($option);
    //         });
    //       });
    //     }
    //   });

    //   // Keyup fires after default action of the key (caret position has been incremented)
    //   $content.keyup(function(event) {
    //     var curCaretPos = $content.caret(); // caret position after caret moves

    //     if (curCaretPos < startCaretPos) {
    //       startCaretPos = -1;
    //       $('.autocomplete-options').remove();
    //     } else {
    //       var textareaValue = $content.val();

    //       // should also break tag on newlines
    //       var spacePos = textareaValue.substr(0, curCaretPos).lastIndexOf(' ') + 1; // if no space exists, spacePos will be 0
    //       var atPos = textareaValue.substr(spacePos, curCaretPos - spacePos).indexOf('@'); // relative to the space
    //       if (atPos >= 0) {
    //         startCaretPos = spacePos + atPos + 1;
    //       } else {
    //         startCaretPos = -1;
    //         $('.autocomplete-options').remove();
    //       }
    //     }
    //   });

    //   $content.keydown(function(event) {
    //     var curCaretPos = $content.caret(); // caret position before caret moves
    //     if (startCaretPos >= 0) {
    //       var $activeOptions = $('.autocomplete-options');
    //       var $activeOption = $('.autocomplete-option.active');
    //       if (event.keyCode === UP_KEYCODE) {
    //         event.preventDefault();
    //         var $prevOption;
    //         if ($activeOption.length) {
    //           $prevOption = $activeOption.prev();
    //         } else {
    //           $prevOption = $activeOptions.children().last();
    //         }
    //         $activeOption.removeClass('active');
    //         if ($prevOption.length) { // there exists a previous sibling
    //           $prevOption.addClass('active');
    //         }
    //       } else if (event.keyCode === DOWN_KEYCODE) {
    //         event.preventDefault();
    //         var $nextOption;
    //         if ($activeOption.length) {
    //           $nextOption = $activeOption.next();
    //         } else {
    //           $nextOption = $activeOptions.children().first();
    //         }

    //         $activeOption.removeClass('active');
    //         if ($nextOption.length) { // there exists a next sibling
    //           $nextOption.addClass('active');
    //         }
    //       }
    //     }
    //   });
    // }

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
