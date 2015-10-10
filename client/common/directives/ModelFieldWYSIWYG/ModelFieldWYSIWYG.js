angular.module('dashboard.directives.ModelFieldWYSIWYG', [
  'dashboard.Dashboard.Model.Edit.SaveDialog',
  "dashboard.Config",
  "ui.bootstrap",
  "dashboard.services.GeneralModel",
  "ui.select"
])

.directive('modelFieldWysiwygView', function($compile) {
  return {
    restrict: 'E',
    template: '<b>{{ options.model }}</b>: {{ data[options.key] }}',
    scope: {
      options: '=options',
      data: '=ngModel',
      required: 'ngRequired',
      disabled: 'disabled'
    },
    link: function(scope, element, attrs) {
    }
  };
})

.directive('modelFieldWysiwygEdit', function($compile, $cookies, $timeout, $modal, Config, FileUploadService) {
  function getTemplate() {
    var template = '\
      <div class="wysiwyg-toolbar" data-role="editor-toolbar" data-target=".wysiwyg-editor" ng-hide="disabled">\
        <!--\
        <div class="btn-group">\
          <a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="Font Size"><i class="fa fa-text-height"></i>&nbsp;<b class="caret"></b></a>\
          <ul class="dropdown-menu">\
            <li><a data-edit="fontSize 7">24 pt</a></li>\
            <li><a data-edit="fontSize 6">18 pt</a></li>\
            <li><a data-edit="fontSize 5">16 pt</a></li>\
            <li><a data-edit="fontSize 4">14 pt</a></li>\
            <li><a data-edit="fontSize 3">12 pt</a></li>\
            <li><a data-edit="fontSize 2">10 pt</a></li>\
            <li><a data-edit="fontSize 1">7 pt</a></li>\
          </ul>\
        </div>\
        <div class="btn-group">\
          <a class="btn btn-default dropdown-toggle color-picker" data-toggle="dropdown" title="Font Color"><i class="color-sample"></i>&nbsp;<b class="caret"></b></a>\
          <div class="dropdown-menu input-append">\
            <input type="color" class="font-color-picker" value="#000" />\
          </div>\
        </div>\
        -->\
        <div class="btn-group">\
          <a class="btn btn-default" data-edit="bold" title="Bold" ng-disabled="isEditingCode"><i class="fa fa-bold"></i></a>\
          <a class="btn btn-default" data-edit="italic" title="Italic" ng-disabled="isEditingCode"><i class="fa fa-italic"></i></a>\
          <a class="btn btn-default" data-edit="underline" title="Underline" ng-disabled="isEditingCode"><i class="fa fa-underline"></i></a>\
        </div>\
        <div class="btn-group">\
          <a class="btn btn-default" data-edit="insertunorderedlist" title="Bullet list" ng-disabled="isEditingCode"><i class="fa fa-list-ul"></i></a>\
          <a class="btn btn-default" data-edit="insertorderedlist" title="Number list" ng-disabled="isEditingCode"><i class="fa fa-list-ol"></i></a>\
          <a class="btn btn-default" data-edit="outdent" title="Reduce indent" ng-disabled="isEditingCode"><i class="fa fa-dedent"></i></a>\
          <a class="btn btn-default" data-edit="indent" title="Indent" ng-disabled="isEditingCode"><i class="fa fa-indent"></i></a>\
        </div>\
        <div class="btn-group">\
          <a class="btn btn-default" data-edit="justifyleft" title="Align Left" ng-disabled="isEditingCode"><i class="fa fa-align-left"></i></a>\
          <a class="btn btn-default" data-edit="justifycenter" title="Center" ng-disabled="isEditingCode"><i class="fa fa-align-center"></i></a>\
          <a class="btn btn-default" data-edit="justifyright" title="Align Right" ng-disabled="isEditingCode"><i class="fa fa-align-right"></i></a>\
          <a class="btn btn-default" data-edit="justifyfull" title="Justify" ng-disabled="isEditingCode"><i class="fa fa-align-justify"></i></a>\
        </div>\
        <div class="btn-group">\
          <span class="dropdown">\
          <a class="btn btn-default" data-original-title="Hyperlink" ng-click="toggleDropdown($event)" ng-disabled="isEditingCode"><i class="fa fa-link"></i></a>\
          <div class="menu">\
            <input class="form-control" placeholder="URL" type="text" data-edit="createLink">\
            <button class="btn btn-default add-button" type="button">Add</button>\
          </div></span>\
        </div>\
        <div class="btn-group picture-button">\
          <a class="btn btn-default picture-tool" title="Insert picture (or just drag & drop)" ng-disabled="!options.allowImageUpload || isEditingCode"><i class="fa fa-picture-o"></i></a>\
          <input type="file" class="wysiwyg-picture-input" data-role="magic-overlay" data-target=".wysiwyg-toolbar .picture-tool" ng-file-select="onFileSelect($files)" />\
        </div>\
        <div class="btn-group">\
          <a class="btn btn-default" data-edit="undo" title="Undo" ng-disabled="isEditingCode"><i class="fa fa-undo"></i></a>\
          <a class="btn btn-default" data-edit="redo" title="Redo" ng-disabled="isEditingCode"><i class="fa fa-repeat"></i></a>\
        </div>\
        <div class="btn-group">\
          <a class="btn btn-default" title="Edit HTML" ng-click="toggleCodeEdit()"><i class="fa fa-code"></i></a>\
        </div>\
      </div>\
      <div class="wysiwyg-editor" ng-hide="isEditingCode"></div>\
      <div class="code-editor" ng-show="isEditingCode"></div>\
    ';
    return template;
  }
  return {
    restrict: 'E',
    require: "ngModel",
    scope: {
      key: '=key',
      property: '=property',
      options: '=options',
      data: '=ngModel',
      modelData: '=modelData',
      disabled: '=disabled'
    },
    link: function(scope, element, attrs, ngModel) {
      scope.toggleDropdown = function(event) {
        var $element = $(event.currentTarget).parent().find('.menu');
        if ($element.hasClass('open')) {
          $element.removeClass('open');
        } else {
          $element.addClass('open');
        }
      };

      scope.isEditingCode = false;

      scope.onFileSelect = function($files) {
        if (!scope.options.allowImageUpload || $files.length == 0) return;
        scope.status = "Uploading Image";
        scope.progress = 0.0;
        var modalInstance = $modal.open({
          templateUrl: 'app/dashboard/model/edit/ModelEditSaveDialog.html',
          controller: 'ModelEditSaveDialogCtrl',
          scope: scope
        });
        FileUploadService.uploadFile($files[0], scope.options.imagePath)
          .then(function(result) {
            scope.status = "Upload Complete";
            document.execCommand('insertimage', 0, result.fileUrl);
            modalInstance.close();
          }, function(error) {
            console.error(error);
            scope.status = "There was an error uploading the image. Please contact an Administrator.";
          }, function(progress) {
            scope.progress = progress;
          });
      };

      scope.toggleCodeEdit = function() {
        scope.isEditingCode = !scope.isEditingCode;
        if (scope.isEditingCode) {
          var htmlCode = $wysiwyg[0].innerHTML;
          htmlCode = html_beautify(htmlCode, {indent_size: 2});
          ngModel.$setViewValue(htmlCode);
          codeEditor.setValue(htmlCode);
        } else {
          ngModel.$setViewValue(codeEditor.getValue());
          $wysiwyg.html(ngModel.$viewValue);
        }
      };

      element.html(getTemplate()).show();
      $compile(element.contents())(scope);

      var $wysiwyg = $(element).find('.wysiwyg-editor');
      if (!scope.disabled) $wysiwyg.wysiwyg({hotKeys: {}, dragAndDropImages: false});

      var codeEditor = ace.edit(element.find('.code-editor')[0]);
      codeEditor.getSession().setMode("ace/mode/html");

      $(element).find('.wysiwyg-toolbar [data-role=magic-overlay]').each(function () {
        var overlay = $(this), target = $(overlay.data('target'));
        overlay.css({opacity: 0, position: 'absolute', width: "40px", height: "34px", top: "0", left: "0" });
      });

      ngModel.$render = function() {
        $wysiwyg.html(ngModel.$viewValue || "");
      };

      $wysiwyg.bind("blur keyup change", function() {
        scope.$apply(function() {
          ngModel.$setViewValue($wysiwyg.html());
        });
      });

      codeEditor.on("blur", function() {
        ngModel.$setViewValue(codeEditor.getValue());
        $wysiwyg.html(ngModel.$viewValue);

      });
    }
  };
})

;
