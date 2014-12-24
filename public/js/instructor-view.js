(function(window, document, undefined) {

  // Retrieve and compile the Handlebars template for rendering posts
  var $newQuestion = $('#new-question-template');
  var $questionsList = $('#questions-list-template')
  var $analytics = $('#analytics-template');
  var templates = {
    renderNewQuestion: Handlebars.compile($newQuestion.html()),
    renderQuestionsList: Handlebars.compile($questionsList.html()),
    renderAnalytics: Handlebars.compile($analytics.html())
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



    // Insert concept-tag related listener

    var $newQuestion = $('form.new-question');
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
