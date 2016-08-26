'use strict';

export default class AdvancedSearchController {
    constructor($scope, AdvancedCaseSearchService, RHAUtils, securityService, CaseService, CASE_EVENTS, $state) {
        'ngInject';

        $scope.solrQuery = null;
        $scope.queryParsed = false;
        $scope.AdvancedCaseSearchService = AdvancedCaseSearchService;
        $scope.RHAUtils = RHAUtils;
        $scope.securityService = securityService;
        $scope.CaseService = CaseService;

        $scope.doSearch = function () {
            if ($scope.solrQuery !== null) {
                $scope.$broadcast(CASE_EVENTS.advancedSearchSubmitted);
                AdvancedCaseSearchService.performSearch($scope.solrQuery, CaseService.filterSelect);
            }
        };

        $scope.bottomScrolled = function () {
            if (AdvancedCaseSearchService.query != null && !AdvancedCaseSearchService.searching) {
                AdvancedCaseSearchService.performSearch(AdvancedCaseSearchService.query, CaseService.filterSelect);
            }
        };

        $scope.$watch('CaseService.filterSelect', function (filter) {
            if(filter) {
                // Update filter in the URL
                $state.go('advancedSearch', {sortBy: `${filter.sortField}_${filter.sortOrder}`}, {
                    location: 'replace',
                    notify: false,
                    reload: false
                });
                if (AdvancedCaseSearchService.resolveOrder(filter) !== AdvancedCaseSearchService.order) {
                    // not to fire the search on controller init, only fire when filter has actually changed
                    AdvancedCaseSearchService.performSearch(AdvancedCaseSearchService.query, filter);
                }
            }
        });
    }
}
