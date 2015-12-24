define([], function(){
    var className = 'Gamefield.Brains';
    U.define({
        className: className,
        gameNumberCls: 'game-number', // TODO send from outside
        createNumber: function(){
            var item = {};
            var values = [2,2,2,2,2,2,2,2,4];
            item.value = values[this.getRandom(0,values.length - 1)];
            return item;
        },
        $findFreePos: function($gameField, cellCls){
            var me = this;
            var $all = $gameField.find(U.c2s(cellCls));
            var $free = $all.filter(function(){
               var $cell = $(this);
               return !$cell.find(U.c2s(me.gameNumberCls)).get(0);
            });
            var index = this.getRandom(0, $free.length - 1);

            return $free.eq(index);
        },
        findFreePos: function(rows){
            var free = [];
            var row, cell;
            for (var y = 0, rowsLen = rows.length; y < rowsLen; y++){
                row = rows[y];
                for (var x = 0, cellsLen = row.cells.length; x < cellsLen; x++){
                    cell = row.cells[x];
                    if ( !cell.value ){
                        free.push(cell);
                    }
                }
            }
            if (free.length < 0){
                return false; // game over?
            }
            var index = this.getRandom(0, free.length - 1);

            return free[index];
        },
        getRandom: function(min, max){
            var rand = min + Math.random() * (max + 1 - min);
            return rand^0;
        }
    });

    return U.ClassManager.get(className).prototype;
});