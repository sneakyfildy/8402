/* global angular */

define(['field/Gamefield'], function (Gamefield) {
    var GameConstructor = function(){
        var $gf;
        $gf = $(Gamefield.gfSelector);
        
        this.gf = this.gamefield = this.field = U.cc({
            className: Gamefield.className,
            game: this
        });
        
        this.gf.$eventEl.on('fieldready', start.bind(this));
        window.g = window.game = window.Game = this;
        window.gf = this.gf;
        
        function start(){
            Game.tryRestore(Game.field.addGameNumber.bind(Game.field));
            //g.field.addGameNumber(0,0);
            //g.field.addGameNumber(1,0);
            //g.field.addGameNumber(2,0);
            //g.field.addGameNumber(3,0);
        }
    }
    
    GameConstructor.prototype.tryRestore = function(fallback){
        var savedState;
        savedState = this.gf.getState();
        if (savedState !== null){
            this.gf.applyState(savedState);
        }else{
            fallback();
        }
    }
    
    var Game = new GameConstructor();
    Game.field.prepareAngular();
});