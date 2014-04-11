//var testURL = 'http://localhost:8080/LogCollector/';
// angular module
angular.module('RedhatAccess.logViewer',
	[ 'angularTreeview', 'ui.bootstrap', 'RedhatAccess.search'])

.config(function($urlRouterProvider) {
}).config([ '$stateProvider', function($stateProvider) {
	$stateProvider.state('logviewer', {
		url : "/logviewer",
		templateUrl : 'log_viewer/views/log_viewer.html'
	})
} ]).constant('config', {
    hideMachinesDropdown: false
  })

.factory('files', function() {
	var fileList = '';
	var selectedFile = '';
	var selectedHost = '';
	var file = '';
	return {
		getFileList : function() {
			return fileList;
		},

		setFileList : function(fileList) {
			this.fileList = fileList;
		},
		getSelectedFile : function() {
			return selectedFile;
		},

		setSelectedFile : function(selectedFile) {
			this.selectedFile = selectedFile;
		},
		getFile : function() {
			return file;
		},

		setFile : function(file) {
			this.file = file;
		}
	};
})

.service('accordian', function() {
	var groups = new Array();
	return {
		getGroups : function() {
			return groups;
		},
		addGroup : function(group) {
			groups.push(group);
		},
		clearGroups : function() {
			groups = '';
		}
	};
})
.controller('fileController', function($scope, files) {
	$scope.roleList = '';
	$scope.updateSelected = function() {
		if ($scope.mytree.currentNode != null
			&& $scope.mytree.currentNode.fullPath != null) {
			files.setSelectedFile($scope.mytree.currentNode.fullPath);
		}
	};
	$scope.$watch(function() {
		return files.fileList;
	}, function() {
		$scope.roleList = files.fileList;
	});
})
.controller('DropdownCtrl', function($scope, $http, $location, files, config) {
	$scope.machinesDropdownText = "Please Select the Machine";
	$scope.items = [];
	$scope.hideDropdown = config.hideMachinesDropdown;
	var sessionId = $location.search().sessionId;

	$scope.init = function() {
		$http({
			method : 'GET',
			url : 'machines?sessionId=' + encodeURIComponent(sessionId)
		}).success(function(data, status, headers, config) {
			$scope.items = data;
		}).error(function(data, status, headers, config) {
			var i = 0;
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	};
	$scope.machineSelected = function() {
		var sessionId = $location.search().sessionId;
		var userId = $location.search().userId;
		files.selectedHost = this.choice;
		$scope.machinesDropdownText = this.choice;
		$http(
		{
			method : 'GET',
			url : 'logs?machine=' + files.selectedHost
			+ '&sessionId=' + encodeURIComponent(sessionId)
			+ '&userId=' + encodeURIComponent(userId)
		}).success(function(data, status, headers, config) {
			var tree = new Array();
			parseList(tree, data);
			files.setFileList(tree);
		}).error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	};
	if($scope.hideDropdown){
		$scope.machineSelected();
	}
})
.controller('selectFileButton', function($scope, $http, $location,
	files) {
	$scope.fileSelected = function() {
		var sessionId = $location.search().sessionId;
		var userId = $location.search().userId;
		$scope.$parent.sidePaneToggle = !$scope.$parent.sidePaneToggle;
		$http(
		{
			method : 'GET',
			url : 'logs?sessionId='
			+ encodeURIComponent(sessionId) + '&userId='
			+ encodeURIComponent(userId) + '&path='
			+ files.selectedFile + '&machine='
			+ files.selectedHost
		}).success(function(data, status, headers, config) {
			files.file = data;
		}).error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	};
})
.controller('TabsDemoCtrl', [
	'$scope',
	'$http',
	'$location',
	'files',
	'accordian',
	'SearchResultsService',
	function($scope, $http, $location, files, accordian, SearchResultsService) {
		$scope.tabs = [ {
			shortTitle : "Short Sample Log File",
			longTitle : "Long Log File",
			content : "Sample Log Text"
		} ];

		$scope.$watch(function() {
			return files.file;
		}, function() {
			if (files.file != null && files.selectedFile != null) {
				file = new Object();
				file.longTitle = files.selectedHost + " : "
				+ files.selectedFile;
				var splitFileName = files.selectedFile.split("/");
				var fileName = splitFileName[splitFileName.length - 1];
				file.shortTitle = files.selectedHost + ":" + fileName;
				file.content = files.file;
				files.file = null;
				$scope.tabs.push(file);
			}
		});
		$scope.removeTab = function(index) {
			$scope.tabs.splice(index, 1);
		};

			$scope.checked = false; // This will be
			// binded using the
			// ps-open attribute

			$scope.diagnoseText = function() {
				if (!$scope.$parent.solutionsToggle) {
					$scope.$parent.solutionsToggle = !$scope.$parent.solutionsToggle;
				}
				var text = strata.utils.getSelectedText();
				if (text != "") {
					$scope.checked = !$scope.checked;
					SearchResultsService.diagnose(text, 5);
				}
			};

			$scope.refreshTab = function(index){
				var sessionId = $location.search().sessionId;
				var userId = $location.search().userId;
				// $scope.tabs[index].content = '';
				//TODO reuse this code from above
				$http(
				{
					method : 'GET',
					url : 'logs?sessionId='
					+ encodeURIComponent(sessionId) + '&userId='
					+ encodeURIComponent(userId) + 'path='
					+ files.selectedFile + '&machine='
					+ files.selectedHost
				}).success(function(data, status, headers, config) {
					$scope.tabs[index].content = data;
				}).error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
			}
		}])

.controller('AccordionDemoCtrl', function($scope, accordian) {
	$scope.oneAtATime = true;
	$scope.groups = accordian.getGroups();
})

.directive('fillDown', function($window, $timeout) {
	return {
		restrict: 'EA',
		link: function postLink(scope, element, attrs) {
			scope.onResizeFunction = function() {
				var distanceToTop = element[0].getBoundingClientRect().top;
				var height = $window.innerHeight - distanceToTop - 21;
				if(element[0].id == 'fileList'){
					height -= 34;
				}
				return scope.windowHeight = height;
			};
      // This might be overkill?? 
      scope.onResizeFunction();
      angular.element($window).bind('resize', function() {
      	scope.onResizeFunction();
      	scope.$apply();
      });
      angular.element($window).bind('click', function() {
      	scope.onResizeFunction();
      	scope.$apply();
      });
      $timeout(scope.onResizeFunction, 0);
      $(window).load(function(){
      	scope.onResizeFunction();
      	scope.$apply();
      });
  }
};
});

function parseList(tree, data) {
	var files = data.split("\n");
	for ( var i in files) {
		var file = files[i];
		var splitPath = file.split("/");
		returnNode(splitPath, tree, file);
	}
}

function returnNode(splitPath, tree, fullFilePath) {
	if (splitPath[0] != null) {
		if (splitPath[0] != "") {
			var node = splitPath[0];
			var match = false;
			var index = 0;
			for ( var i in tree) {
				if (tree[i].roleName == node) {
					match = true;
					index = i;
					break;
				}
			}
			if (!match) {
				var object = new Object();
				object.roleName = node;
				object.roleId = node;
				if (splitPath.length == 1) {
					object.fullPath = fullFilePath;
				}
				object.children = new Array();
				tree.push(object);
				index = tree.length - 1;
			}

			splitPath.shift();
			returnNode(splitPath, tree[index].children, fullFilePath);
		} else {
			splitPath.shift();
			returnNode(splitPath, tree, fullFilePath);
		}
	}
}