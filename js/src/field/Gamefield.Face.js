/* global angular */

define([
    'field/face/face.control.main',
    'abstract/AbstractAngularComponent',
    'field/view/GamefieldView'
], function (
        mainFaceControllerFn,
        AbstractAngularComponent,
        GamefieldView
    ) {
    var className = 'Gamefield.Face';
    U.define({
        className: className,
        extends: 'AbstractAngularComponent',
        moduleName: 'GamefieldModule',
        controllerName: 'GameFieldController',

        /**
         * CSS class for cell
         * @property {String}
         */
        cellCls: 'cell',
        /**
         * Angular's classes which we want to keep on cells alongside our custom ones
         * @property {String}
         */
        cellNgCls: 'ng-binding ng-scope',
        /**
         * @property
         * @private
         */
        __fieldResizeTimeout: '',
        getTpl: function(){
            return '<table><tbody>'+
            '<tr ng-repeat="row in rows">'+
              '<td ng-repeat="cell in row.cells" class="c{{cell.index}} r{{row.index}} [% cellNgCls %] [% cellCls %] value{{cell.displayValue}}">'+
                '<div class="outer-content-simple">'+
                    '<div class="coords">'+
                        '{{cell.cell}}:{{cell.row}}'+
                    '</div>'+
                    '<div class="inner {{cell.valueCls}}">'+
                        '{{cell.displayValue || "&nbsp;"}}'+
                    '</div>'+
                '</div>'+
              '</td>'+
            '</tr>'+
         '</tbody></table>';
        },
        initComponent: function($super, config){
            $super.call(this, config);
            this.module = angular.module(this.moduleName, []);
            this.module.controller(this.controllerName, ['$scope', mainFaceControllerFn]);
        },
        update: function(rows, cells){
            var scope = this.getScope();
            scope.rows = rows ? rows : scope.rows;
            scope.cells = cells ? cells : scope.cells;
            scope.$apply();
        },
        getScope: function(){
            var scope;
            try{
                scope = $(this.main.gfSelector).scope();
            }catch(err){
                scope = window.gfScope;
            }
            return scope;
        },
        onRender: function($super){
            $super.call(this);
            this.resize();
        },
        setListeners: function($super){
            $super.call(this);
            this.main.on('resize', this.scheduleResizeField.bind(this, 1));
            !this.__resizeListenerSet && $(window).on('resize', this.scheduleResizeField.bind(this));
            this.__resizeListenerSet = true;
        },
        linkElements: function($super){
            $super.call(this);
            this.$gf = $(this.renderToSelector);
        },
        /**
         *
         * @param {Number|String} [x] 1 is default
         * @param {Number|String} [y] 1 is default
         * @returns {jQuery|Boolean} false if not found
         */
        $getCell: function(x, y){
            var $cell = $('td' +
                U.c2s(this.cellCls) +
                U.c2s(this.cellNgCls) +
                '.c{0}.r{1}'.format(x || 0, y || 0)
            );
            return $cell.get(0) ? $cell : false;
        },
		scheduleResizeField: function(a,b,c){
			if ( this.__fieldResizeTimeout ){
				clearTimeout( this.__fieldResizeTimeout );
			}
			this.__fieldResizeTimeout = setTimeout(this.resize.bind(this), 100);
		},
		resize: function(){
            var w, h, used;
			clearTimeout( this.__fieldResizeTimeout );
			w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
			h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            if (h >= w){
                used = parseInt( w * 1, 10 );
            }else{
                used = parseInt( h * 0.7, 10 );
            }

            this.$gf.width(used);
            this.$gf.height(used);
            this.updateFontSize();
		},
        updateFontSize: function(){
            var tdHeight = this.$el.find('td').first().outerHeight();
            this.$el.css({
                'fontSize': parseInt(tdHeight / 2.5, 10)
            });
        }
    });

    return U.ClassManager.get(className).prototype;
});