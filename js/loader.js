
(function(){
    var __jPluginsOrder = [];
    var __libsOrder = ['angular-route'];
    var deps = ['U', 'angular-route'].concat(__jPluginsOrder).concat(__libsOrder);
    var appFileName = [window.Config.debug ? '8402.r.full' : '8402.r.min'];

    require.config({
        baseUrl: 'js/src',
        //urlArgs: 'version=' + Config.ver,
        paths: {
            jquery: '../vendor/jquery/jquery1.11.1.min',
            'jquery_mobile': '../vendor/jquery/jm',
            //'hammer': '../vendor/hammer',
            'angular': '../vendor/angular/angular.min',
            'angular-route': '../vendor/angular/angular-route.min',
            //-
            'U': '../vendor/u/u-core',
            '8402.r.full':  '../8402.r.full',
            '8402.r.min':  '../8402.r.min'
        },
        shim: {
//            'hammer':{
//                deps: [],
//                exports: 'Hammer'
//            },
            'angular-route': {
                deps: ['angular']
            },
            'U': {
                deps: ['jquery']
            },
            '8402.r.full': {
                deps: deps
            },
            '8402.r.min': {
                deps: deps
            }
        },
        // the main dependency
        deps: appFileName
    });
})();