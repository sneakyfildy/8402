/* global angular, Game, Hammer */
define(['field/Gamefield.Brains', 'field/Gamefield.Face'], function(Brains, Face){
    var className = 'Gamefield';
    U.define({
        className: className,
        gfSelector: '#gamefield',
        defaultSize: 4,
        initComponent: function(config){
            this.linkElements();
            this.$gf.hide();
            U.apply(this, config);
            this.createItems();
            this.setListeners();
        },
        createItems: function(){
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
        setListeners: function(){
            var body = $('body').get(0);
            var motionControl = new Hammer(body);
            motionControl.get('swipe').set({
                direction: Hammer.DIRECTION_ALL,
                treshold: 25,
                velocity: 0.1
            });
            motionControl.get('pan').set({
                direction: Hammer.DIRECTION_VERTICAL,
                treshold: 150
            });
            $(document).on('keydown', this.onKeyDown.bind(this));
            motionControl.on('swipeleft swiperight swipeup swipedown', this.onSwipe.bind(this));
        },
        linkElements: function(){
            this.$eventEl = $('<div>');
            this.$gf = this.$gamefield = $(this.gfSelector);
        },
        init: function(){
            this.setSize(this.defaultSize);
        },
        updateFace: function(){
            this.face.update(this.rows, this.cells);
        },
        _add: function (n) {
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

            while(x < this.rows[0].cells.length){
                y = 0;
                this.cells.push({
                    index: x,
                    rows: []
                });
                while(y < this.rows.length){
                    this.cells[x].rows = this.cells[x].rows || [];
                    this.cells[x].rows.push(this.rows[y].cells[x]);
                    y++;
                }
                x++;
            }
            return this;
        },
        addSize: function (n) {
            this._add(n).updateFace();
            this.gameWidth = this.rows[0].cells.length;
            this.gameHeight = this.rows.length;
            this.onFieldSizeChange();
        },
        setSize: function(x, y){
            this.rows = [];
            if (x === y || !U.isDefined(y)) {
                y = x;
                this._add(x);
            } else {
                console.error('Not yet implemented non-square');
            }
            this.gameWidth = x;
            this.gameHeight = y;
            this.updateFace();
            this.onFieldSizeChange();
            return this;
        },
        moveX: function(dir){
            var cell, x, y, height, width, cellsLen, condition, borderLimit, nextCondition, initialCell;
            height = this.gameHeight;
            width = this.gameWidth;
            cellsLen = this.gameWidth;
            var anims, k, nextCell, lastAvailableIndex, isNextFree, isCellMoved, movesCount, lastMovedCell;
            anims = [];
            isCellMoved = false;
            y = 0;

            borderLimit = dir === -1 ? 0 : cellsLen - 1;

            condition = function(xIterator){
                return dir === -1 ? xIterator < cellsLen : xIterator >= 0;
            };
            nextCondition = function(kIterator){
                return dir === -1 ? kIterator >= 0 : kIterator < cellsLen;
            };
            console.clear();
            for (; y < height; y++){
                x = dir === -1 ? 0 : cellsLen - 1;
                inner1: for (; condition(x); x += -1 * dir){
                    cell = this.rows[y].cells[x];
                    if ( !cell.value || x === borderLimit){
                        continue;
                    }
                    initialCell = {
                        x: cell.cell,
                        y: cell.row
                    };
                    lastMovedCell = null;
                    movesCount = 0;
                    for (k = x; nextCondition(k); k += dir){
                        cell = this.rows[y].cells[k];
                        nextCell = this.rows[y].cells[k + dir];
                        if (!nextCell){
                            if (movesCount > 0){
                                console.log('move is over', initialCell, lastMovedCell || cell);
                                anims.push({
                                    from: initialCell,
                                    to: lastMovedCell || cell
                                });
                            }
                            continue;
                        }

                        isNextFree = nextCell && !nextCell.value;
                        if (!isNextFree){
                            if (nextCell.value !== cell.value){
                                lastAvailableIndex = k;
                            }else{
                                this.setCellAsValue(nextCell, nextCell.value + cell.value);
                                this.setCellAsFree(cell);
                                movesCount++;
                                isCellMoved = true;
                                console.log('move NOT FREE', nextCell.cell + ':' + nextCell.row, nextCell.value);
                                lastMovedCell = {
                                    x: nextCell.cell,
                                    y: nextCell.row
                                };
                                if (movesCount > 0){
                                    console.log('move is over', initialCell, lastMovedCell);
                                    anims.push({
                                        from: initialCell,
                                        to: lastMovedCell
                                    });
                                }
                                continue inner1;
                            }
                        }else{
                            this.setCellAsValue(nextCell, nextCell.value + cell.value);
                            this.setCellAsFree(cell);
                            movesCount++;
                            isCellMoved = true;
                            lastMovedCell = {
                                x: nextCell.cell,
                                y: nextCell.row
                            };
                            console.log('move FREE', nextCell.cell + ':' + nextCell.row, nextCell.value);
                        }
                    }
                }
            }
            this.animateMoves(anims, 'x', isCellMoved);
            //this._afterMove(isCellMoved);
        },
        moveY: function(dir){
            var cell, x, y, height, width, cellsLen, condition, borderLimit, nextCondition, initialCell;
            height = this.gameHeight;
            width = this.gameWidth;
            cellsLen = this.gameWidth;
            var anims, k, nextCell, lastAvailableIndex, isNextFree, isCellMoved, movesCount, lastMovedCell;
            anims = [];
            isCellMoved = false;
            x = 0;

            borderLimit = dir === -1 ? 0 : height - 1;

            condition = function(yIterator){
                return dir === -1 ? yIterator < height : yIterator >= 0;
            };
            nextCondition = function(kIterator){
                return dir === -1 ? kIterator >= 0 : kIterator < height;
            };
            console.clear();
            for (; x < width; x++){
                y = dir === -1 ? 0 : height - 1;
                inner1: for (; condition(y); y += -1 * dir){
                    cell = this.rows[y].cells[x];
                    if ( !cell.value || y === borderLimit){
                        continue;
                    }
                    initialCell = {
                        x: cell.cell,
                        y: cell.row
                    };
                    lastMovedCell = null;
                    movesCount = 0;
                    for (k = y; nextCondition(k); k += dir){
                        cell = this.rows[k].cells[x];
                        nextCell = this.rows[k + dir] && this.rows[k + dir].cells[x];
                        if (!nextCell){
                            if (movesCount > 0){
                                console.log('move is over', initialCell, lastMovedCell || cell);
                                anims.push({
                                    from: initialCell,
                                    to: lastMovedCell || cell
                                });
                            }
                            continue;
                        }

                        isNextFree = nextCell && !nextCell.value;
                        if (!isNextFree){
                            if (nextCell.value !== cell.value){
                                lastAvailableIndex = k;
                            }else{
                                this.setCellAsValue(nextCell, nextCell.value + cell.value);
                                this.setCellAsFree(cell);
                                movesCount++;
                                isCellMoved = true;
                                console.log('move NOT FREE', nextCell.cell + ':' + nextCell.row, nextCell.value);
                                lastMovedCell = {
                                    x: nextCell.cell,
                                    y: nextCell.row
                                };
                                if (movesCount > 0){
                                    console.log('move is over', initialCell, lastMovedCell);
                                    anims.push({
                                        from: initialCell,
                                        to: lastMovedCell
                                    });
                                }
                                continue inner1;
                            }
                        }else{
                            this.setCellAsValue(nextCell, nextCell.value + cell.value);
                            this.setCellAsFree(cell);
                            movesCount++;
                            isCellMoved = true;
                            lastMovedCell = {
                                x: nextCell.cell,
                                y: nextCell.row
                            };
                            console.log('move FREE', nextCell.cell + ':' + nextCell.row, nextCell.value);
                        }
                    }
                }
            }
            this.animateMoves(anims, 'y', isCellMoved);
            //this._afterMove(isCellMoved);
        },
        animateMoves: function(anims, direction, isCellMoved){
            anims.forEach(function(anim){
                var $cellFrom, $cellTo, $original, $clone, fromPos, toPos, moveString, moveAmount;
                $cellFrom = $('.c' + anim.from.x + '.r' + anim.from.y);
                $cellTo = $('.c' + anim.to.x + '.r' + anim.to.y);
                console.log($cellFrom, $cellTo);
                fromPos = $cellFrom.position();
                toPos = $cellTo.position();
                $cellFrom.addClass('animating');
                moveString = 'translate' + direction.toUpperCase() + '(%amount%px)';
                moveAmount = direction === 'x' ? (toPos.left - fromPos.left) : (toPos.top - fromPos.top);
                $cellFrom.css({
                    'transform': moveString.replace('%amount%', moveAmount)
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
        _afterMove: function(moveDone){
            $('td')
                .removeClass('animating')
                .css('transform', '');
            if (moveDone){
                this.addGameNumber();
            }
            this.updateFace();
        },
        addGameNumber: function(x, y){
            var itemDef = this.brains.createNumber();
            var itemCell;
            if (!U.areDefined(x, y)){
                itemCell = this.brains.findFreePos(this.rows);
            }else{
                itemCell = this.rows[y].cells[x];
            }
            if (!itemCell){
                console.warn('it\'s over');
                this.setSize(4, 4);
                return;
            }
            this.setCellAsValue(itemCell, itemDef.value);
            this.updateFace();
        },
        setCellAsValue: function(itemCell, value){
            itemCell.value = value;
            itemCell.displayValue = value;
            itemCell.valueCls = 'game-number';
            this.afterCellModification();
        },
        setCellAsFree: function(itemCell){
            itemCell.value = 0;
            itemCell.displayValue = null;
            itemCell.valueCls = 'free';
            this.afterCellModification();
        },
        afterCellModification: function(){
            this.saveState();
        },
        saveState: function(){
            var ls;
            ls = window.localStorage;
            ls.setItem('gamefield', JSON.stringify(this.rows));
        },
        getState: function(){
            var ls, state, parsedState;
            ls = window.localStorage;
            state = ls.getItem('gamefield');
            parsedState = null;
            if (!!state){
                try{
                    parsedState = JSON.parse(state);
                }catch(err){
                    // todo handle
                }
            }
            return parsedState
        },
        applyState: function(state){
            this.rows = state;
            this.updateFace();
        },
        fire: function(eventName){
            this.$eventEl.trigger(eventName);
        },
        on: function(eventName, fn, scope, args){
            var boundFn = scope ? Function.bind.apply(fn, [scope].concat(args)) : fn;
            this.$eventEl.on(eventName, boundFn);
        },
        onAngularReady: function(){
            angular.bootstrap(document, [this.face.moduleName]);
            this.init();
            this.$gf.fadeIn(300);
            this.fire('resize');
            this.fire('fieldready');
        },
        prepareAngular: function(){
            angular.element(document).ready(this.onAngularReady.bind(this));
        },
        onFieldSizeChange: function () {
            this.fire('resize');
        },
        onKeyDown: function(e){
            var stopEvent = false;
            switch (e.which){
                case 37: // left
                    this.moveX(-1);
                    stopEvent = true;
                    return false;
                case 39: // right
                    this.moveX(1);
                    stopEvent = true;
                    return false;
                case 38: // top
                    this.moveY(-1);
                    stopEvent = true;
                    return false;
                case 40: // down
                    this.moveY(1);
                    stopEvent = true;
                    return false;
            }
            if(stopEvent){
                e.stopPropagation();
                e.preventDefault();
            }
        },
        onSwipe: function(ev) {
            ev.preventDefault();
            switch (ev.type){
                case 'swipeleft':
                case 'panleft':
                    this.moveX(-1);
                    return false;
                case 'swiperight':
                case 'panright':
                    this.moveX(1);
                    return false;
                case 'swipeup':
                case 'panup':
                    this.moveY(-1);
                    return false;
                case 'swipedown':
                case 'pandown':
                    this.moveY(1);
                    return false;
            }
            return false;
        }
    });
    return U.ClassManager.get(className).prototype;
});