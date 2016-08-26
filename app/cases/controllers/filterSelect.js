'use strict';

import find from "lodash/find"

export default class FilterSelect {
    constructor($scope, securityService, CaseService, STATUS, ConstantsService, $state, $stateParams) {
        'ngInject';

        $scope.securityService = securityService;
        $scope.CaseService = CaseService;
        $scope.ConstantsService = ConstantsService;
        $scope.STATUS = STATUS;
        $scope.init = function () {
            const sortByRegex = /^(.+)_([^_]+)$/;
            if($state.current.name === 'advancedSearch' && sortByRegex.test($stateParams.sortBy)) {
                // Apply the filter from URL if there is any
                const [_, field, order] = $stateParams.sortBy.match(sortByRegex);
                const filterItem = find(ConstantsService.sortByParams, {sortField: field, sortOrder: order}, ConstantsService.sortByParams[0]);
                CaseService.filterSelect = filterItem;

            } else {
                CaseService.filterSelect = ConstantsService.sortByParams[0];
                if (CaseService.localStorageCache) {
                    if (CaseService.localStorageCache.get('filterSelect' + securityService.loginStatus.authedUser.sso_username)) {
                        var filterSelectCache = CaseService.localStorageCache.get('filterSelect' + securityService.loginStatus.authedUser.sso_username);
                        CaseService.setFilterSelectModel(filterSelectCache.sortField, filterSelectCache.sortOrder);
                    }
                }
            }


        };
    }
}
