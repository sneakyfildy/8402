/*! DO NOT MODIFY THIS FILE, IT IS COMPILED! */
define("field/Gamefield.Brains", [], function() {
    var className = "Gamefield.Brains";
    U.define({
        className: className,
        gameNumberCls: "game-number",
        // TODO send from outside
        createNumber: function() {
            var item = {};
            var values = [ 2, 2, 2, 2, 2, 2, 2, 2, 4 ];
            item.value = values[this.getRandom(0, values.length - 1)];
            return item;
        },
        $findFreePos: function($gameField, cellCls) {
            var me = this;
            var $all = $gameField.find(U.c2s(cellCls));
            var $free = $all.filter(function() {
                var $cell = $(this);
                return !$cell.find(U.c2s(me.gameNumberCls)).get(0);
            });
            var index = this.getRandom(0, $free.length - 1);
            return $free.eq(index);
        },
        findFreePos: function(rows) {
            var free = [];
            var row, cell;
            for (var y = 0, rowsLen = rows.length; y < rowsLen; y++) {
                row = rows[y];
                for (var x = 0, cellsLen = row.cells.length; x < cellsLen; x++) {
                    cell = row.cells[x];
                    if (!cell.value) {
                        free.push(cell);
                    }
                }
            }
            if (free.length < 0) {
                return false;
            }
            var index = this.getRandom(0, free.length - 1);
            return free[index];
        },
        getRandom: function(min, max) {
            var rand = min + Math.random() * (max + 1 - min);
            return rand ^ 0;
        }
    });
    return U.ClassManager.get(className).prototype;
});

define("field/face/face.control.main", [], function() {
    function mainFaceController($scope) {
        $scope.$on("someEvent", function(event, data) {
            console.log(data);
        });
        window.gfScope = $scope;
    }
    return mainFaceController;
});

define("abstract/AbstractAngularComponent", [], function() {
    "use strict";
    /**
	 * @class AbstractComponent
	 * @abstract
	 * Basic abstract component. Every other application components must be extended
	 * from this abstract one
	 */
    U.define({
        /**
		 * @property {String}
		 * @readonly
		 */
        className: "AbstractAngularComponent",
        /**
		 * @cfg {String}
		 * CSS class to be added to 'selected' item(s)
		 */
        selectedItemCls: "selected",
        /**
		 * Postfix of component's container element
		 */
        containerPostFix: "-container",
        /**
		 * @cfg {String}
		 * Defines if component will immidiately try to render itself after
		 * initialization
		 */
        autoRender: true,
        /**
		 * Important stuff, if set to true, this.$el will be the element WHERE this component's element is rendering into
		 * so, if true, then this.$el equals renderTo, if false - this.$el will point on what was rendered
		 * @config {Boolean}
		 */
        renderToParent: false,
        /**
		 * Set config to true, to overwrite on render
		 * @config {Boolean}
		 */
        renderAppend: false,
        bubbleButtonEvent: true,
        initComponent: function(config) {
            U.apply(this, config);
            if (this.autoRender === true) {
                this.render();
            }
        },
        /**
		 * Render component again, removing its $el.
		 * @chainable
		 * @returns {AbstractComponent}
		 */
        redoRender: function() {
            this.removeEl();
            return this.forceRender();
        },
        /**
		 * Forced rendering, does not remove $el, use with caution.
		 */
        forceRender: function() {
            this.rendered = false;
            this.rendering = false;
            return this.render();
        },
        /**
		 * Renders component's element to its selector.
		 * Launches onRender call when(if) finished.
		 * @chainable
		 * @returns {AbstractComponent}
		 */
        render: function(opts) {
            opts = opts || {};
            //var start = new Date().getTime();
            var $renderToEl, renderToEl, tpl, temp, renderType;
            renderType = opts.forcedRenderType || this.renderType || "append";
            if (this.rendered || this.rendering) {
                return false;
            }
            if (this.onBeforeRender() === false) {
                return this;
            }
            this.rendering = true;
            this.renderToSelector = U.isDefined(this.renderToId) ? "#" + this.renderToId : this.renderToSelector;
            $renderToEl = $(this.renderToSelector || this.renderToElement);
            if (renderType === "innerHTML") {
                renderToEl = $renderToEl.get(0);
                if (renderToEl) {
                    tpl = this.processTpl();
                    if (renderToEl.tagName.toLowerCase() === "tbody") {
                        // http://www.ericvasilik.com/2006/07/code-karma.html
                        //$renderToEl.get(0).replaceChild();
                        try {
                            renderToEl.innerHTML = renderToEl.innerHTML || "";
                            if (this.renderAppend) {
                                renderToEl.innerHTML += tpl;
                            } else {
                                renderToEl.innerHTML = tpl;
                            }
                        } catch (e) {
                            // IE goes here
                            /* istanbul ignore next */
                            $renderToEl[this.renderAppend ? "append" : "html"](tpl);
                        }
                    } else {
                        renderToEl.innerHTML = renderToEl.innerHTML || "";
                        if (this.renderAppend) {
                            renderToEl.innerHTML += tpl;
                        } else {
                            renderToEl.innerHTML = tpl;
                        }
                    }
                }
                this.$el = this.renderToParent ? $renderToEl : $renderToEl.children().first();
            } else {
                this.$el = $(this.processTpl());
                if ($renderToEl[renderType] && U.isFunction($renderToEl[renderType])) {
                    $renderToEl[renderType](this.$el);
                } else {
                    throw "Unknown render type";
                }
                this.$el = this.renderToParent ? $renderToEl : this.$el;
            }
            //this.className === 'Grid.Body' && console.log('render time (ms):', (new Date().getTime() - start));
            return this._finishRender();
        },
        /**
		 * postRender should do the same as original regular render method. The difference is
		 * that postRender is called on components, which already have their markup inside DOM.
		 * E.g. if somehow their markup was rendered without call to regular 'render'.
		 * It occurs in using panels with 'inline' rendering of their items - when panel renders
		 * with items' markup inside.
		 * <b>Assignment of a data-uid IS REQUIRED!!!</b>
		 * @chainable
		 * @returns {AbstractComponent}
		 */
        postRender: function() {
            this.$el = this.findEl();
            return this._finishRender();
        },
        /**
		 *
		 * @private
		 */
        _finishRender: function() {
            this.rendering = false;
            this.rendered = true;
            this.onRender && this.onRender();
            this.visible = this.$el.css("visibility") !== "hidden" && this.$el.css("display") !== "none";
            // inspect if it is iron
            return this;
        },
        /**
		 * Basic template processing. Runs through component's data objects and replaces
		 * matched templete elements.
		 * To declare element in template use [%elementName%]
		 * @param {String} forcedTpl Send sting to receive it processed
		 * @returns {String} processed template string
		 */
        processTpl: function(forcedTpl, forcedData) {
            return U.processTpl.apply(this, arguments);
        },
        /**
		 * Sets the visibility of its $el
		 * @param {boolean} state required visibility state
		 * @returns {boolean} operation success
		 */
        setVisible: function(state) {
            if (!this.$el || !this.rendered) {
                return false;
            }
            var currentState = this.$el.css("visibility") === "visible" ? true : false;
            // set visibility only if states are different to decrease reflows or component status
            // is incorrect
            if (state !== currentState || this.visible !== currentState) {
                this.$el.css({
                    visibility: state ? "visible" : "hidden"
                });
                this.visible = state;
            }
            return true;
        },
        /**
		 * Sets the display state of its $el
		 * @param {Boolean} state required display state
		 * @param {Number} duration ms
		 * @returns {boolean} operation success
		 */
        setDisplayed: function(state, duration) {
            if (!this.$el || !this.rendered) {
                return false;
            }
            this[state ? "show" : "hide"](duration);
            return true;
        },
        /**
		 * Hides component's element with jQuery method 'hide'
		 * @param {Number} duration ms
		 */
        hide: function(duration) {
            duration = duration || 0;
            if (duration === 0) {
                this.$el.hide();
            } else {
                this.$el.fadeOut(duration);
            }
            this.visible = false;
            this.onHide();
        },
        /**
		 * Shows component's element with jQuery method 'show'
		 * @param {Number} duration ms
		 */
        show: function(duration) {
            this.onBeforeShow();
            duration = duration || 0;
            if (duration === 0) {
                this.$el.show();
            } else {
                this.$el.fadeIn(duration);
            }
            this.visible = true;
            this.onShow();
        },
        onBeforeShow: U.emptyFn,
        /**
		 * Removes component's element with jQuery method 'remove'
		 * @returns {undefined}
		 */
        removeEl: function() {
            if (this.renderToParent) {
                // as we may have this.$el being equal to renderTo, then we cannot remove
                // it, because component may want to render again into that renderTo
                this.$el && this.$el.empty();
                return this;
            }
            this.$el && this.$el.remove();
            delete this.$el;
            return this;
        },
        /**
		 * Abstract getTpl function. Generates component's tpl. Is used by
		 * reneder method if return anything. If not, tpl property is used.
		 * @method getTpl
		 */
        getTpl: U.emptyFn,
        /**
		 * @event
		 * Triggered after rendering is finished, invokes elements linking,
		 * registering buttons handlers and event listeners setting.
		 */
        onRender: function() {
            this.linkElements();
            this.registerButtonHandlers();
            this.setListeners();
        },
        /**
		 * Generic action button listener
		 * Reads data-action; Adds 'BtnHandler' string;
		 * This will be the name of invoked component's method;
		 * @param {Event} e
		 * @return {Mixed|Boolean} result of handler call, false if no such handler
		 * (handler also may return false.
		 */
        onActionBtn: function(e) {
            var $btn, action, registeredMethod, notRegisteredMethod;
            $btn = $(e.currentTarget);
            action = $btn.attr("data-action");
            registeredMethod = this.btnHandlers[action];
            notRegisteredMethod = this[action + "BtnHandler"];
            if (!action || !$.isFunction(registeredMethod) && !$.isFunction(notRegisteredMethod)) {
                return !!this.bubbleButtonEvent;
            }
            if ($.isFunction(registeredMethod)) {
                return registeredMethod.call(this, e);
            } else {
                window.__DEBUG__ === true && console.log("Unregistered button handler, please rewrite, its use is deprecated.", "Handler: " + action + "BtnHandler", ",action: " + action);
                return notRegisteredMethod.call(this, e);
            }
        },
        update: U.emptyFn,
        setListeners: function() {
            this.$el.on("click", U.dom.getBtnActionSelector(""), this.onActionBtn.bind(this));
        },
        /**
		 * This method creates links between 'data-action' attribute values on button
		 * elements and related handlers.
		 * Developer should extend {@link AbstractComponent#getButtonHandlersConfig} method
		 * and make it return an object with such structure:
		 * {
		 *		dataActionValue: this.dataActionValueBtnHandler
		 * }
		 *
		 * dataActionValue shuould be equal to <i>&lt;div data-type="btn" data-action=<b>"dataActionValue"</b>&gt;Button&lt;/div&gt;</i>
		 * 'data-action' attribute.
		 * Example:
		 *
		 *		@example
		 *		getButtonHandlersConfig: function(){
		 *			var cfg = {
		 *				sortColumn: this.sortColumnBtnHandler,
		 *				loadOthers: this.doLoadOthers
		 *			};
		 *			return cfg;
		 *		}
		 *
		 * {@link Grid#getButtonHandlersConfig}
		 *
		 * <b>PLEASE NOTE:</b>
		 * This makes possible to attach custom named methods as button handlers, in other
		 * words it is possible to use this.applySort handler on button with data-action="helloWorld"
		 * to do so just add "helloWorld: this.applySort" into "getButtonHandlersConfig" method
		 *
		 * <b>PLEASE NOTE (very important):</b>
		 * To keep backwards compatibility ability to run not registered handlers is left.
		 * This means that if you do not have link <b>'dataAction': this.handlerName</b>, but have
		 * <b>this.dataActionBtnHandler</b>, then <b>this.dataActionBtnHandler</b> will run.
		 * If application is in debug mode (defined by SHOW_PSERVICE_VERSION on startup), then
		 * console will log such run.
		 *
		 */
        registerButtonHandlers: function() {
            this.doRegisterButtonHandlers(this.getButtonHandlersConfig());
        },
        doRegisterButtonHandlers: function(cfg) {
            cfg = cfg || {};
            this.btnHandlers = cfg;
        },
        /**
		 * Performs lookup through component child elements to find a data-type=btn
		 * element with required data-action attribute
		 * @param {String} action
		 * @returns {jQuery}
		 */
        getBtn: function(action) {
            if (!U.isString(action) || action + "" === "") {
                return U.getEmpty$();
            }
            return this.$el.find(U.dom.getBtnActionSelector(action));
        },
        /**
		 * Buttons -> handlers configuration object
		 * Please read the doc {@link AbstractComponent#registerButtonHandlers}
		 * @method
		 */
        getButtonHandlersConfig: U.emptyFn,
        /**
		 * Links elements to this class's attributes
		 * @param {Function} $super Parent method
		 * @method
		 */
        linkElements: U.emptyFn,
        /**
		 * @event
		 * Triggered before rendering process is started.
		 * @returns {Boolean} return false to stop rendering.
		 */
        onBeforeRender: U.emptyFn,
        /**
		 * @event
		 */
        onShow: U.emptyFn,
        /**
		 * @event
		 */
        onHide: U.emptyFn,
        /**
		 * @event
		 * Triggers from inside show method, when element gains display: block;
		 */
        onHaveSizeBeforeShow: U.emptyFn,
        /**
		 * Looks for component's element inside DOM.
		 * <b>Assignment of a data-uid IS REQUIRED!!!</b>
		 * @param {jQuery} [$area] select area may be given
		 * @returns {*|jQuery}
		 */
        findEl: function($area) {
            var selector = '[data-uid="{0}"]'.format(this.id);
            return $area ? $area.find(selector) : $(selector);
        },
        /**
		 * Generates value for 'data-uid' attr of components's container
		 * @param {uComponent} [itemComponent] may be given, otherwise 'this' will be used
		 * @returns {string}
		 */
        getContainerUid: function(component) {
            return (component || this).id + this.containerPostFix;
        }
    });
});

// tutorial1.js
var CommentBox = React.createClass({
    displayName: "CommentBox",
    render: function render() {
        return React.createElement("div", {
            className: "commentBox"
        }, "Hello, world! I am a CommentBox.");
    }
});

ReactDOM.render(React.createElement(CommentBox, null), document.getElementById("content"));

define("field/view/GamefieldView", function() {});

/* global angular */
define("field/Gamefield.Face", [ "field/face/face.control.main", "abstract/AbstractAngularComponent", "field/view/GamefieldView" ], function(mainFaceControllerFn, AbstractAngularComponent, GamefieldView) {
    var className = "Gamefield.Face";
    U.define({
        className: className,
        "extends": "AbstractAngularComponent",
        moduleName: "GamefieldModule",
        controllerName: "GameFieldController",
        /**
         * CSS class for cell
         * @property {String}
         */
        cellCls: "cell",
        /**
         * Angular's classes which we want to keep on cells alongside our custom ones
         * @property {String}
         */
        cellNgCls: "ng-binding ng-scope",
        /**
         * @property
         * @private
         */
        __fieldResizeTimeout: "",
        getTpl: function() {
            return "<table><tbody>" + '<tr ng-repeat="row in rows">' + '<td ng-repeat="cell in row.cells" class="c{{cell.index}} r{{row.index}} [% cellNgCls %] [% cellCls %] value{{cell.displayValue}}">' + '<div class="outer-content-simple">' + '<div class="coords">' + "{{cell.cell}}:{{cell.row}}" + "</div>" + '<div class="inner {{cell.valueCls}}">' + '{{cell.displayValue || "&nbsp;"}}' + "</div>" + "</div>" + "</td>" + "</tr>" + "</tbody></table>";
        },
        initComponent: function($super, config) {
            $super.call(this, config);
            this.module = angular.module(this.moduleName, []);
            this.module.controller(this.controllerName, [ "$scope", mainFaceControllerFn ]);
        },
        update: function(rows, cells) {
            var scope = this.getScope();
            scope.rows = rows ? rows : scope.rows;
            scope.cells = cells ? cells : scope.cells;
            scope.$apply();
        },
        getScope: function() {
            var scope;
            try {
                scope = $(this.main.gfSelector).scope();
            } catch (err) {
                scope = window.gfScope;
            }
            return scope;
        },
        onRender: function($super) {
            $super.call(this);
            this.resize();
        },
        setListeners: function($super) {
            $super.call(this);
            this.main.on("resize", this.scheduleResizeField.bind(this, 1));
            !this.__resizeListenerSet && $(window).on("resize", this.scheduleResizeField.bind(this));
            this.__resizeListenerSet = true;
        },
        linkElements: function($super) {
            $super.call(this);
            this.$gf = $(this.renderToSelector);
        },
        /**
         *
         * @param {Number|String} [x] 1 is default
         * @param {Number|String} [y] 1 is default
         * @returns {jQuery|Boolean} false if not found
         */
        $getCell: function(x, y) {
            var $cell = $("td" + U.c2s(this.cellCls) + U.c2s(this.cellNgCls) + ".c{0}.r{1}".format(x || 0, y || 0));
            return $cell.get(0) ? $cell : false;
        },
        scheduleResizeField: function(a, b, c) {
            if (this.__fieldResizeTimeout) {
                clearTimeout(this.__fieldResizeTimeout);
            }
            this.__fieldResizeTimeout = setTimeout(this.resize.bind(this), 100);
        },
        resize: function() {
            var w, h, used;
            clearTimeout(this.__fieldResizeTimeout);
            w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            if (h >= w) {
                used = parseInt(w * 1, 10);
            } else {
                used = parseInt(h * .7, 10);
            }
            this.$gf.width(used);
            this.$gf.height(used);
            this.updateFontSize();
        },
        updateFontSize: function() {
            var tdHeight = this.$el.find("td").first().outerHeight();
            this.$el.css({
                fontSize: parseInt(tdHeight / 2.5, 10)
            });
        }
    });
    return U.ClassManager.get(className).prototype;
});

/* global angular, Game, Hammer */
define("field/Gamefield", [ "field/Gamefield.Brains", "field/Gamefield.Face" ], function(Brains, Face) {
    var className = "Gamefield";
    U.define({
        className: className,
        gfSelector: "#gamefield",
        defaultSize: 4,
        initComponent: function(config) {
            this.linkElements();
            this.$gf.hide();
            U.apply(this, config);
            this.createItems();
            this.setListeners();
        },
        createItems: function() {
            this.brains = U.cc({
                className: Brains.className,
                main: this
            });
            this.face = U.cc({
                className: Face.className,
                renderToSelector: this.gfSelector,
                main: this
            });
        },
        setListeners: function() {
            var body = $("body").get(0);
            var motionControl = new Hammer(body);
            motionControl.get("swipe").set({
                direction: Hammer.DIRECTION_ALL,
                treshold: 25,
                velocity: .1
            });
            motionControl.get("pan").set({
                direction: Hammer.DIRECTION_VERTICAL,
                treshold: 150
            });
            $(document).on("keydown", this.onKeyDown.bind(this));
            motionControl.on("swipeleft swiperight swipeup swipedown", this.onSwipe.bind(this));
        },
        linkElements: function() {
            this.$eventEl = $("<div>");
            this.$gf = this.$gamefield = $(this.gfSelector);
        },
        init: function() {
            this.setSize(this.defaultSize);
        },
        updateFace: function() {
            this.face.update(this.rows, this.cells);
        },
        _add: function(n) {
            n = n - 1;
            if (n < 0) {
                return this;
            }
            this.rows = this.rows || [];
            this.cells = this.cells || [];
            var row, x, y, prevX, prevY;
            prevY = this.rows.length;
            prevX = this.rows[0] && this.rows[0].cells && this.rows[0].cells.length || 0;
            y = 0;
            var cell;
            while (y <= prevY + n) {
                x = 0;
                if (y < prevY && this.rows[y]) {
                    row = this.rows[y];
                } else {
                    row = {
                        index: y,
                        cells: []
                    };
                }
                while (x <= prevX + n) {
                    if (!row.cells[x]) {
                        cell = {
                            index: x,
                            row: y,
                            cell: x,
                            value: 0
                        };
                        row.cells.push(cell);
                    }
                    x++;
                }
                if (!this.rows[y]) {
                    this.rows.push(row);
                }
                y++;
            }
            x = 0;
            while (x < this.rows[0].cells.length) {
                y = 0;
                this.cells.push({
                    index: x,
                    rows: []
                });
                while (y < this.rows.length) {
                    this.cells[x].rows = this.cells[x].rows || [];
                    this.cells[x].rows.push(this.rows[y].cells[x]);
                    y++;
                }
                x++;
            }
            return this;
        },
        addSize: function(n) {
            this._add(n).updateFace();
            this.gameWidth = this.rows[0].cells.length;
            this.gameHeight = this.rows.length;
            this.onFieldSizeChange();
        },
        setSize: function(x, y) {
            this.rows = [];
            if (x === y || !U.isDefined(y)) {
                y = x;
                this._add(x);
            } else {
                console.error("Not yet implemented non-square");
            }
            this.gameWidth = x;
            this.gameHeight = y;
            this.updateFace();
            this.onFieldSizeChange();
            return this;
        },
        moveX: function(dir) {
            var cell, x, y, height, width, cellsLen, condition, borderLimit, nextCondition, initialCell;
            height = this.gameHeight;
            width = this.gameWidth;
            cellsLen = this.gameWidth;
            var anims, k, nextCell, lastAvailableIndex, isNextFree, isCellMoved, movesCount, lastMovedCell;
            anims = [];
            isCellMoved = false;
            y = 0;
            borderLimit = dir === -1 ? 0 : cellsLen - 1;
            condition = function(xIterator) {
                return dir === -1 ? xIterator < cellsLen : xIterator >= 0;
            };
            nextCondition = function(kIterator) {
                return dir === -1 ? kIterator >= 0 : kIterator < cellsLen;
            };
            console.clear();
            for (;y < height; y++) {
                x = dir === -1 ? 0 : cellsLen - 1;
                inner1: for (;condition(x); x += -1 * dir) {
                    cell = this.rows[y].cells[x];
                    if (!cell.value || x === borderLimit) {
                        continue;
                    }
                    initialCell = {
                        x: cell.cell,
                        y: cell.row
                    };
                    lastMovedCell = null;
                    movesCount = 0;
                    for (k = x; nextCondition(k); k += dir) {
                        cell = this.rows[y].cells[k];
                        nextCell = this.rows[y].cells[k + dir];
                        if (!nextCell) {
                            if (movesCount > 0) {
                                console.log("move is over", initialCell, lastMovedCell || cell);
                                anims.push({
                                    from: initialCell,
                                    to: lastMovedCell || cell
                                });
                            }
                            continue;
                        }
                        isNextFree = nextCell && !nextCell.value;
                        if (!isNextFree) {
                            if (nextCell.value !== cell.value) {
                                lastAvailableIndex = k;
                            } else {
                                this.setCellAsValue(nextCell, nextCell.value + cell.value);
                                this.setCellAsFree(cell);
                                movesCount++;
                                isCellMoved = true;
                                console.log("move NOT FREE", nextCell.cell + ":" + nextCell.row, nextCell.value);
                                lastMovedCell = {
                                    x: nextCell.cell,
                                    y: nextCell.row
                                };
                                if (movesCount > 0) {
                                    console.log("move is over", initialCell, lastMovedCell);
                                    anims.push({
                                        from: initialCell,
                                        to: lastMovedCell
                                    });
                                }
                                continue inner1;
                            }
                        } else {
                            this.setCellAsValue(nextCell, nextCell.value + cell.value);
                            this.setCellAsFree(cell);
                            movesCount++;
                            isCellMoved = true;
                            lastMovedCell = {
                                x: nextCell.cell,
                                y: nextCell.row
                            };
                            console.log("move FREE", nextCell.cell + ":" + nextCell.row, nextCell.value);
                        }
                    }
                }
            }
            this.animateMoves(anims, "x", isCellMoved);
        },
        moveY: function(dir) {
            var cell, x, y, height, width, cellsLen, condition, borderLimit, nextCondition, initialCell;
            height = this.gameHeight;
            width = this.gameWidth;
            cellsLen = this.gameWidth;
            var anims, k, nextCell, lastAvailableIndex, isNextFree, isCellMoved, movesCount, lastMovedCell;
            anims = [];
            isCellMoved = false;
            x = 0;
            borderLimit = dir === -1 ? 0 : height - 1;
            condition = function(yIterator) {
                return dir === -1 ? yIterator < height : yIterator >= 0;
            };
            nextCondition = function(kIterator) {
                return dir === -1 ? kIterator >= 0 : kIterator < height;
            };
            console.clear();
            for (;x < width; x++) {
                y = dir === -1 ? 0 : height - 1;
                inner1: for (;condition(y); y += -1 * dir) {
                    cell = this.rows[y].cells[x];
                    if (!cell.value || y === borderLimit) {
                        continue;
                    }
                    initialCell = {
                        x: cell.cell,
                        y: cell.row
                    };
                    lastMovedCell = null;
                    movesCount = 0;
                    for (k = y; nextCondition(k); k += dir) {
                        cell = this.rows[k].cells[x];
                        nextCell = this.rows[k + dir] && this.rows[k + dir].cells[x];
                        if (!nextCell) {
                            if (movesCount > 0) {
                                console.log("move is over", initialCell, lastMovedCell || cell);
                                anims.push({
                                    from: initialCell,
                                    to: lastMovedCell || cell
                                });
                            }
                            continue;
                        }
                        isNextFree = nextCell && !nextCell.value;
                        if (!isNextFree) {
                            if (nextCell.value !== cell.value) {
                                lastAvailableIndex = k;
                            } else {
                                this.setCellAsValue(nextCell, nextCell.value + cell.value);
                                this.setCellAsFree(cell);
                                movesCount++;
                                isCellMoved = true;
                                console.log("move NOT FREE", nextCell.cell + ":" + nextCell.row, nextCell.value);
                                lastMovedCell = {
                                    x: nextCell.cell,
                                    y: nextCell.row
                                };
                                if (movesCount > 0) {
                                    console.log("move is over", initialCell, lastMovedCell);
                                    anims.push({
                                        from: initialCell,
                                        to: lastMovedCell
                                    });
                                }
                                continue inner1;
                            }
                        } else {
                            this.setCellAsValue(nextCell, nextCell.value + cell.value);
                            this.setCellAsFree(cell);
                            movesCount++;
                            isCellMoved = true;
                            lastMovedCell = {
                                x: nextCell.cell,
                                y: nextCell.row
                            };
                            console.log("move FREE", nextCell.cell + ":" + nextCell.row, nextCell.value);
                        }
                    }
                }
            }
            this.animateMoves(anims, "y", isCellMoved);
        },
        animateMoves: function(anims, direction, isCellMoved) {
            anims.forEach(function(anim) {
                var $cellFrom, $cellTo, $original, $clone, fromPos, toPos, moveString, moveAmount;
                $cellFrom = $(".c" + anim.from.x + ".r" + anim.from.y);
                $cellTo = $(".c" + anim.to.x + ".r" + anim.to.y);
                console.log($cellFrom, $cellTo);
                fromPos = $cellFrom.position();
                toPos = $cellTo.position();
                $cellFrom.addClass("animating");
                moveString = "translate" + direction.toUpperCase() + "(%amount%px)";
                moveAmount = direction === "x" ? toPos.left - fromPos.left : toPos.top - fromPos.top;
                $cellFrom.css({
                    transform: moveString.replace("%amount%", moveAmount)
                });
            });
            setTimeout(this._afterMove.bind(this, isCellMoved), 50);
        },
        /**
         * Finishing operations after game move
         * @param {Boolean} moveDone True if move was really done (game elements have moved)
         * @private
         * @chainable
         * @returns {Gamefield}
         */
        _afterMove: function(moveDone) {
            $("td").removeClass("animating").css("transform", "");
            if (moveDone) {
                this.addGameNumber();
            }
            this.updateFace();
        },
        addGameNumber: function(x, y) {
            var itemDef = this.brains.createNumber();
            var itemCell;
            if (!U.areDefined(x, y)) {
                itemCell = this.brains.findFreePos(this.rows);
            } else {
                itemCell = this.rows[y].cells[x];
            }
            if (!itemCell) {
                console.warn("it's over");
                this.setSize(4, 4);
                return;
            }
            this.setCellAsValue(itemCell, itemDef.value);
            this.updateFace();
        },
        setCellAsValue: function(itemCell, value) {
            itemCell.value = value;
            itemCell.displayValue = value;
            itemCell.valueCls = "game-number";
            this.afterCellModification();
        },
        setCellAsFree: function(itemCell) {
            itemCell.value = 0;
            itemCell.displayValue = null;
            itemCell.valueCls = "free";
            this.afterCellModification();
        },
        afterCellModification: function() {
            this.saveState();
        },
        saveState: function() {
            var ls;
            ls = window.localStorage;
            ls.setItem("gamefield", JSON.stringify(this.rows));
        },
        getState: function() {
            var ls, state, parsedState;
            ls = window.localStorage;
            state = ls.getItem("gamefield");
            parsedState = null;
            if (!!state) {
                try {
                    parsedState = JSON.parse(state);
                } catch (err) {}
            }
            return parsedState;
        },
        applyState: function(state) {
            this.rows = state;
            this.updateFace();
        },
        fire: function(eventName) {
            this.$eventEl.trigger(eventName);
        },
        on: function(eventName, fn, scope, args) {
            var boundFn = scope ? Function.bind.apply(fn, [ scope ].concat(args)) : fn;
            this.$eventEl.on(eventName, boundFn);
        },
        onAngularReady: function() {
            angular.bootstrap(document, [ this.face.moduleName ]);
            this.init();
            this.$gf.fadeIn(300);
            this.fire("resize");
            this.fire("fieldready");
        },
        prepareAngular: function() {
            angular.element(document).ready(this.onAngularReady.bind(this));
        },
        onFieldSizeChange: function() {
            this.fire("resize");
        },
        onKeyDown: function(e) {
            var stopEvent = false;
            switch (e.which) {
              case 37:
                // left
                this.moveX(-1);
                stopEvent = true;
                return false;

              case 39:
                // right
                this.moveX(1);
                stopEvent = true;
                return false;

              case 38:
                // top
                this.moveY(-1);
                stopEvent = true;
                return false;

              case 40:
                // down
                this.moveY(1);
                stopEvent = true;
                return false;
            }
            if (stopEvent) {
                e.stopPropagation();
                e.preventDefault();
            }
        },
        onSwipe: function(ev) {
            ev.preventDefault();
            switch (ev.type) {
              case "swipeleft":
              case "panleft":
                this.moveX(-1);
                return false;

              case "swiperight":
              case "panright":
                this.moveX(1);
                return false;

              case "swipeup":
              case "panup":
                this.moveY(-1);
                return false;

              case "swipedown":
              case "pandown":
                this.moveY(1);
                return false;
            }
            return false;
        }
    });
    return U.ClassManager.get(className).prototype;
});

/* global angular */
define("Game", [ "field/Gamefield" ], function(Gamefield) {
    var GameConstructor = function() {
        var $gf;
        $gf = $(Gamefield.gfSelector);
        this.gf = this.gamefield = this.field = U.cc({
            className: Gamefield.className,
            game: this
        });
        this.gf.$eventEl.on("fieldready", start.bind(this));
        window.g = window.game = window.Game = this;
        window.gf = this.gf;
        function start() {
            Game.tryRestore(Game.field.addGameNumber.bind(Game.field));
        }
    };
    GameConstructor.prototype.tryRestore = function(fallback) {
        var savedState;
        savedState = this.gf.getState();
        if (savedState !== null) {
            this.gf.applyState(savedState);
        } else {
            fallback();
        }
    };
    var Game = new GameConstructor();
    Game.field.prepareAngular();
});

require([ "Game" ]);

define("o", function() {});