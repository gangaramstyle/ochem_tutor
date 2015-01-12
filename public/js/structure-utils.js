(function(window, document, undefined) {
  var StructureUtils = {};

  var defaultSettings = {
    image: {
      width: 100,
      height: 100
    },
    structure: '<cml><MDocument></MDocument></cml>',
  }

  StructureUtils.importStructure = function(id, marvinEditor) {
    if (!id) {
      marvinEditor.then(function(sketcherInstance) {
        sketcherInstance.importStructure("cml", defaultSettings.structure);
      });
      return;
    }
    InstructorModel.loadStructure(id, function(error, structure) {
      if (error) {
        throw error;
      } else {
        marvinEditor.then(function(sketcherInstance) {
          sketcherInstance.importStructure("cml", structure.structure);
        });
      }
    });
  }

  StructureUtils.exportStructure = function(marvinEditor, callback) {
    marvinEditor.then(function(sketcherInstance) {
      sketcherInstance.exportStructure('mrv').then(function(structure) {
        sketcherInstance.exportStructure('png', defaultSettings.image).then(function(image) {
          callback(structure, image);
        })
      });
    });
  }

  // specify id as null for new structure
  StructureUtils.newStructure = function(isGlobal, name, marvinEditor, templates) {
    // TODO: client-side validation
    // TODO: save .png to MongoDB
    StructureUtils.exportStructure(marvinEditor, function(structure, image) {
      console.log(image);
      InstructorModel.newStructure({
        isGlobal: isGlobal,
        name: name,
        image: image,
        structure: structure,
      }, function(error, structure) {
        if (error) {
          throw error;
        } else {
          /* render figure tile */
          var $tile = $(templates.renderFigureTile({src: image, dataId: structure._id})).appendTo($("#figure-tiles"));
          $tile.click(function() {
            InstructorView.renderStructureModal($('#marvin'), structure._id);
          });
        }
      });
    });
  }

  StructureUtils.updateStructure = function(id, isGlobal, name, marvinEditor, templates) {
    StructureUtils.exportStructure(marvinEditor, function(structure, image) {
      InstructorModel.updateStructure({
        id: id,
        isGlobal: isGlobal,
        name: name,
        image: image,
        structure: structure,
      }, function(error, structure) {
        if (error) {
          throw error;
        } else {
          /* re-render figure tile */
          var $oldTile = $("#figure-tiles").find('[data-id="' + structure._id + '"]');
          var $newTile = $(templates.renderFigureTile({src: image, dataId: structure._id}))
          $oldTile.replaceWith($newTile);
          $newTile.click(function() {
            InstructorView.renderStructureModal($('#marvin'), structure._id);
          });
        }
      });
    });
  }

  StructureUtils.removeStructure = function(id) {
    InstructorModel.removeStructure(id, function(error, structure) {
      if (error) {
        throw error;
      } else {
        /* remove figure tile */
        var $tile = ($("#figure-tiles")).find('[data-id="' + structure._id + '"]');
        $tile.remove();
      }
    });
  }

  window.StructureUtils = StructureUtils;

})(this, this.document);
