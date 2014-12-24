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
      'width' : 150,
      'height' : 150
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
          $("#figures").append("<img id='image"+structures[structIndex].name+"' class='bordered'/>");
          $("#image"+structures[structIndex].name).attr("src", img);
          console.log("#image"+structures[structIndex].name);
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
      $('#marvinjs').modal('show');
    }
/*
    function editStruct(____) {
      currStruct = structures[];
      importMol(currObject.mol);
      $('#marvinjs').modal('show');
      console.log(currObject);
    } */

    
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
    });

    $("#Insert").click(function() {
      saveStruct();
      $('#marvinjs').modal('hide');

    })



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
