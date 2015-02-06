'use strict';
/*global $ */
angular.module('RedhatAccess.cases').controller('AttachLocalFile', [
    '$scope',
    '$sce',
    'RHAUtils',
    'AlertService',
    'AttachmentsService',
    'CaseService',
    'securityService',
    'translate',
    function ($scope, $sce, RHAUtils,AlertService, AttachmentsService, CaseService, securityService, translate) {
        $scope.AttachmentsService = AttachmentsService;
        $scope.CaseService = CaseService;
        $scope.NO_FILE_CHOSEN = 'No file chosen';
        $scope.fileDescription = '';
        var maxFileSize = 1000000000;

        $scope.parseArtifactHtml = function () {
            var parsedHtml = '';
            if (RHAUtils.isNotEmpty(AttachmentsService.suggestedArtifact.description)) {
                var rawHtml = AttachmentsService.suggestedArtifact.description.toString();
                parsedHtml = $sce.trustAsHtml(rawHtml);
            }
            return parsedHtml;
        };
        $scope.clearSelectedFile = function () {
            $scope.fileName = $scope.NO_FILE_CHOSEN;
            $scope.fileDescription = '';
        };
        $scope.addFile = function () {
            /*jshint camelcase: false */
            AttachmentsService.addNewAttachment({
                file_name: $scope.fileName,
                description: $scope.fileDescription,
                fileObj: $scope.fileObj,
                length: $scope.fileSize,
                created_by: securityService.loginStatus.authedUser.loggedInUser,
                created_date: new Date().getTime()
            });
            $scope.clearSelectedFile();
            $scope.$apply();
        };
        $scope.getFile = function () {
            $('#fileUploader').click();
        };
        $scope.selectFile = function () {
            if($('#fileUploader')[0].files[0].size < maxFileSize){
                $scope.fileObj = $('#fileUploader')[0].files[0];
                $scope.fileSize = $scope.fileObj.size;
                $scope.fileName = $scope.fileObj.name;
                $scope.$apply();
	            $scope.addFile();
            } else {
                AlertService.addDangerMessage($('#fileUploader')[0].files[0].name + translate(' cannot be attached because it is larger the 1 GB. Please FTP large files to dropbox.redhat.com.'));
            }
            $('#fileUploader')[0].value = '';
        };
        $scope.clearSelectedFile();
    }
]);