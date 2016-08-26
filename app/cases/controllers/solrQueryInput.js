'use strict';

export default class SolrQueryInputController {
    constructor($scope, SOLRGrammarService, RHAUtils, CASE_EVENTS, strataService, CaseService, ProductsService, securityService,
                AccountBookmarkService, AccountService, $stateParams, $state) {
        'ngInject';

        $scope.parseSuccessful = false;
        $scope.inputQuery = $stateParams.query || "";
        $scope.showingCompletionList = true;
        $scope.CASE_EVENTS = CASE_EVENTS;
        $scope.RHAUtils = RHAUtils;
        $scope.severitiesLoading = true;
        $scope.statusLoading = true;
        $scope.groupsLoading = true;
        $scope.productsLoading = true;
        $scope.accountsLoading = true;
        $scope.ABS = AccountBookmarkService;
        $scope.autocompleteSegments = {};

        var init = function () {
            var promises = [];
            var onSeveritiesLoaded = function () {
                SOLRGrammarService.setSeverities(CaseService.severities);
                $scope.severitiesLoading = false;
            };

            var onStatusesLoaded = function () {
                SOLRGrammarService.setStatuses(CaseService.statuses);
                $scope.statusLoading = false;
            };

            var onGroupsLoaded = function () {
                SOLRGrammarService.setGroups(CaseService.groups);
                $scope.groupsLoading = false;
            };

            var onProductsLoaded = function () {
                SOLRGrammarService.setProducts(ProductsService.products);
                $scope.productsLoading = false;
            };

            var onBookmarkedAccountsLoaded = function () {
                SOLRGrammarService.setBookmarkedAccounts(AccountBookmarkService.bookmarkedAccounts);
                $scope.accountsLoading = false;
            };

            var onUserAccountLoaded = function () {
                var account = AccountService.accounts[securityService.loginStatus.authedUser.account_number];
                SOLRGrammarService.setUserAccount(account);
            };

            if (RHAUtils.isEmpty(CaseService.severities)) {
                var promise = strataService.values.cases.severity().then(function (severities) {
                    CaseService.setSeverities(severities);
                    onSeveritiesLoaded();
                });
                promises.push(promise);
            } else {
                onSeveritiesLoaded();
            }

            if (RHAUtils.isEmpty(CaseService.statuses)) {
                var promise = strataService.values.cases.status().then(function (statuses) {
                    CaseService.statuses = statuses;
                    onStatusesLoaded();
                });
                promises.push(promise);
            } else {
                onStatusesLoaded();
            }

            if (AccountBookmarkService.loading) {
                var promise = new Promise(function (resolve, reject) {
                    $scope.$watch('ABS.loading', function () {
                        if (!AccountBookmarkService.loading) onBookmarkedAccountsLoaded();
                        resolve();
                    });
                });
                promises.push(promise);

            } else {
                onBookmarkedAccountsLoaded();
            }

            var groupPromise = CaseService.populateGroups().then(onGroupsLoaded);
            var productPromise = ProductsService.getProducts(true).then(onProductsLoaded);

            promises.push(groupPromise);
            promises.push(productPromise);

            if (RHAUtils.isNotEmpty(securityService.loginStatus.authedUser.account_number)) {
                if (RHAUtils.isEmpty(AccountService.accounts[securityService.loginStatus.authedUser.account_number])) {
                    var promise = AccountService.loadAccount(securityService.loginStatus.authedUser.account_number).then(onUserAccountLoaded);
                    promises.push(promise);
                } else {
                    onUserAccountLoaded();
                }
            }

            Promise.all(promises).then(function () {
                $scope.setupAutocompletion();
                $scope.$broadcast(CASE_EVENTS.focusSearchInput);

                // Check whether there is some query from state, if it's valid submit it
                if(RHAUtils.isNotEmpty($scope.inputQuery)) {
                    if($scope.verifyQuery($scope.inputQuery)) { // re-verify, since all the objects ^ are now loaded and grammar is updated
                        $scope.submit();
                    }
                }
            });
        };

        $scope.setupAutocompletion = () => {
            if(RHAUtils.isNotEmpty(SOLRGrammarService.accounts)) {
                SOLRGrammarService.accounts.forEach(account => {
                    // Autocompletion which is not directly in the grammar, to make it non-user-specific
                   $scope.autocompleteSegments[account.number] = `${account.number} (${account.name})`;
                });
            }
        };

        $scope.changeSolrQuery = function (query) {
            $scope.solrQuery = query;
        };

        $scope.verifyQuery = (query) => {
            try {
                SOLRGrammarService.parse(query);
                return true;
            } catch (e) {
                return false;
            }
        };

        $scope.$watch("inputQuery", function (query) {
            try {
                var solrquery = SOLRGrammarService.parse(query);
                $scope.changeSolrQuery(solrquery);
                $scope.parseSuccessful = true;
                $state.go('advancedSearch', {query: query}, {location: 'replace', notify: false, reload: false});

                // trigger further autocompletion by adding a whitespace
                try {
                    SOLRGrammarService.parse(query + " ");
                } catch (e) {
                    $scope.error = e;
                    $scope.autocomplete(e.expected);
                }
            } catch (e) {
                $scope.changeSolrQuery(null);
                $scope.parseSuccessful = false;
                $scope.error = e;
                $scope.autocomplete(e.expected, query.substring(e.location.start.offset, query.length));
            }
        });

        $scope.autocomplete = function (expecteds, phrase) {
            var autocomplete = [];
            var info = "";
            var andIsPresent = false;
            var orIsPresent = false;

            if (expecteds != null) {
                var ignored = [")", "(", "-", ":", '"', ' ', '[', ']'];
                angular.forEach(expecteds, function (expected) {
                    if (expected.type === "literal" && ignored.indexOf(expected.value) === -1) {
                        var contentMatch = expected.value.match(/^"(.+)"$/);
                        var content = expected.value;
                        if (contentMatch != null && contentMatch.length >= 2) {
                            content = contentMatch[1];
                        }
                        autocomplete.push({display: $scope.autocompleteSegments[content] || content, value: expected.value});
                        info = "Choose one of the displayed options.";
                    } else if (expected.value === '"') {
                        info = "Values containing whitespaces have to be wrapped in double quotes.";
                    }

                    if (expected.value === " and ") {
                        andIsPresent = true
                    } else if (expected.value === " or ") {
                        orIsPresent = true;
                    }
                });

                if (andIsPresent && orIsPresent) {
                    info = "Enter <b>and</b> or <b>or</b> to continue with the query.";
                } else if (andIsPresent) {
                    info = "Enter <b>and</b> to continue with the query.";
                } else if (orIsPresent) {
                    info = "Enter <b>or</b> to continue with the query.";
                }
            }

            $scope.autocompleteList = autocomplete.sort(function (a, b) {
                if (a.display < b.display) return -1;
                if (a.display > b.display) return 1;
                return 0;
            });

            if (phrase !== undefined && RHAUtils.isNotEmpty(phrase.trim())) {
                $scope.autocompleteList = $scope.autocompleteList.filter(function (item) {
                    return item.display.toLowerCase().indexOf(phrase.trim().toLowerCase()) >= 0;
                })
            }
            $scope.info = info;
        };

        var selectNextItem = function (next) {
            var nextDiff = next || 1;
            var selectedId = $scope.selectedItem;

            //select next item
            var nextId;
            if (selectedId !== null) {
                nextId = (selectedId + nextDiff + $scope.autocompleteList.length) % $scope.autocompleteList.length;
            } else {
                nextId = nextDiff === 1 ? 0 : $scope.autocompleteList.length - 1;
            }

            $scope.selectItem(nextId);

        };

        $scope.keyPress = function (e) {
            // on any key press we should ensure the autocompletion is visible
            $scope.showingCompletionList = true;
            if (e.which === 38) { // key UP
                e.preventDefault();
                e.stopPropagation();
                selectNextItem(-1);
                return false;
            } else if (e.which === 40) { // key DOWN
                e.preventDefault();
                e.stopPropagation();
                selectNextItem();
                return false;
            } else if (e.which === 13) { //key ENTER
                e.preventDefault();
                e.stopPropagation();
                if (e.ctrlKey) {
                    $scope.submit();
                } else {
                    if (RHAUtils.isNotEmpty($scope.selectedItem)) {
                        $scope.clickedItem($scope.selectedItem);
                    }
                }
                return false;
            }
        };

        // autocomplete
        $scope.selectedItem = null;

        $scope.clickedItem = function (id) {
            var item = $scope.autocompleteList[id];
            if (RHAUtils.isNotEmpty(item)) {
                $scope.inputQuery = $scope.inputQuery.substring(0, $scope.error.location.start.offset) + item.value;
                //put focus back to the input
                $scope.$broadcast(CASE_EVENTS.focusSearchInput);
            }

        };

        $scope.selectItem = function (id) {
            $scope.selectedItem = id;
        };

        $scope.showCompletionList = function () {
            $scope.showingCompletionList = true;
        };

        $scope.$on(CASE_EVENTS.advancedSearchSubmitted, function () {
            $scope.showingCompletionList = false;
        });

        init();
    }
}
