'use strict';

export default ($stateProvider, $provide) => {
    $stateProvider.state('edit', {
        url: '/case/{id:[0-9]{1,8}}?commentId',
        controller: 'Edit',
        reloadOnSearch: false,
        template: require('./views/edit.jade')
    });
    $stateProvider.state('new', {
        url: '/case/new?abtest&product&version',
        controller: 'New',
        reloadOnSearch: true,
        template: require('./views/new.jade')
    });
    $stateProvider.state('list', {
        url: '/case/list',
        controller: 'List',
        template: require('./views/list.jade')
    });
    $stateProvider.state('group', {
        url: '/case/group',
        controller: 'ManageGroups',
        template: require('./views/manageGroups.jade')
    });
    $stateProvider.state('defaultGroup', {
        url: '/case/group/default',
        controller: 'DefaultGroup',
        template: require('./views/defaultGroup.jade')
    });
    $stateProvider.state('editGroup', {
        url: '/case/group/{groupNumber}',
        controller: 'EditGroup',
        template: require('./views/editGroup.jade')
    });
    $stateProvider.state('advancedSearch', {
        url: '/case/search?query&sortBy',
        controller: 'AdvancedSearchController',
        template: require('./views/advancedSearch.jade')
    });
    $stateProvider.state('accountBookmark', {
        url: '/account/bookmark',
        controller: 'AccountBookmarkHome',
        template: require('./views/accountBookmarkHome.jade')
    });
    $stateProvider.state('404', {
        url: '/404',
        // TODO -- This was referencing cases/views/404.html which didn't exist.
        template: require('redhat_access_pcm_ascension_common/app/common/views/404.jade')
    });
    $stateProvider.state('403', {
        url: '/403',
        // TODO -- This was referencing cases/views/403.html which didn't exist.
        template: require('redhat_access_pcm_ascension_common/app/common/views/403.jade')
    });

    if (window.location.host !== 'access.redhat.com') {
        // TODO -- QA this needs to be tested and verified or we may need to move the $delegate to the parent func to
        // be injected
        $provide.decorator("$exceptionHandler", function ($delegate) {
            'ngInject';

            return function (exception, cause) {
                $delegate(exception, cause);
                if (window.errors == null) window.errors = [];
                window.errors.push(exception);
            };
        });
    }
}
