/*! DO NOT MODIFY THIS FILE, IT IS COMPILED! */
define("field/Gamefield.Brains", [], function() {
    var className = "Gamefield.Brains";
    U.define({
        className: className,
        gameNumberCls: "game-number",
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
    U.define({
        className: "AbstractAngularComponent",
        selectedItemCls: "selected",
        containerPostFix: "-container",
        autoRender: true,
        renderToParent: false,
        renderAppend: false,
        bubbleButtonEvent: true,
        initComponent: function(config) {
            U.apply(this, config);
            if (this.autoRender === true) {
                this.render();
            }
        },
        redoRender: function() {
            this.removeEl();
            return this.forceRender();
        },
        forceRender: function() {
            this.rendered = false;
            this.rendering = false;
            return this.render();
        },
        render: function(opts) {
            opts = opts || {};
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
                        try {
                            renderToEl.innerHTML = renderToEl.innerHTML || "";
                            if (this.renderAppend) {
                                renderToEl.innerHTML += tpl;
                            } else {
                                renderToEl.innerHTML = tpl;
                            }
                        } catch (e) {
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
            return this._finishRender();
        },
        postRender: function() {
            this.$el = this.findEl();
            return this._finishRender();
        },
        _finishRender: function() {
            this.rendering = false;
            this.rendered = true;
            this.onRender && this.onRender();
            this.visible = this.$el.css("visibility") !== "hidden" && this.$el.css("display") !== "none";
            return this;
        },
        processTpl: function(forcedTpl, forcedData) {
            return U.processTpl.apply(this, arguments);
        },
        setVisible: function(state) {
            if (!this.$el || !this.rendered) {
                return false;
            }
            var currentState = this.$el.css("visibility") === "visible" ? true : false;
            if (state !== currentState || this.visible !== currentState) {
                this.$el.css({
                    visibility: state ? "visible" : "hidden"
                });
                this.visible = state;
            }
            return true;
        },
        setDisplayed: function(state, duration) {
            if (!this.$el || !this.rendered) {
                return false;
            }
            this[state ? "show" : "hide"](duration);
            return true;
        },
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
        removeEl: function() {
            if (this.renderToParent) {
                this.$el && this.$el.empty();
                return this;
            }
            this.$el && this.$el.remove();
            delete this.$el;
            return this;
        },
        getTpl: U.emptyFn,
        onRender: function() {
            this.linkElements();
            this.registerButtonHandlers();
            this.setListeners();
        },
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
        registerButtonHandlers: function() {
            this.doRegisterButtonHandlers(this.getButtonHandlersConfig());
        },
        doRegisterButtonHandlers: function(cfg) {
            cfg = cfg || {};
            this.btnHandlers = cfg;
        },
        getBtn: function(action) {
            if (!U.isString(action) || action + "" === "") {
                return U.getEmpty$();
            }
            return this.$el.find(U.dom.getBtnActionSelector(action));
        },
        getButtonHandlersConfig: U.emptyFn,
        linkElements: U.emptyFn,
        onBeforeRender: U.emptyFn,
        onShow: U.emptyFn,
        onHide: U.emptyFn,
        onHaveSizeBeforeShow: U.emptyFn,
        findEl: function($area) {
            var selector = '[data-uid="{0}"]'.format(this.id);
            return $area ? $area.find(selector) : $(selector);
        },
        getContainerUid: function(component) {
            return (component || this).id + this.containerPostFix;
        }
    });
});

define("field/Gamefield.Face", [ "field/face/face.control.main", "abstract/AbstractAngularComponent" ], function(mainFaceControllerFn) {
    var className = "Gamefield.Face";
    U.define({
        className: className,
        "extends": "AbstractAngularComponent",
        moduleName: "GamefieldModule",
        controllerName: "GameFieldController",
        cellCls: "cell",
        cellNgCls: "ng-binding ng-scope",
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
        },
        setCellAsFree: function(itemCell) {
            itemCell.value = 0;
            itemCell.displayValue = null;
            itemCell.valueCls = "free";
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
                this.moveX(-1);
                stopEvent = true;
                return false;

              case 39:
                this.moveX(1);
                stopEvent = true;
                return false;

              case 38:
                this.moveY(-1);
                stopEvent = true;
                return false;

              case 40:
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

define("Game", [ "field/Gamefield" ], function(Gamefield) {
    var $gf;
    $gf = $(Gamefield.gfSelector);
    var Game = this;
    this.gf = this.gamefield = this.field = U.cc({
        className: Gamefield.className,
        game: this
    });
    this.gf.$eventEl.on("fieldready", start.bind(this));
    window.g = window.game = window.Game = this;
    window.gf = this.gf;
    Game.field.prepareAngular();
    function start() {
        window.Game.field.addGameNumber();
    }
});

require([ "Game" ]);

define("o", function() {});