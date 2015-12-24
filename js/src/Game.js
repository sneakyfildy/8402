/* global angular */

define(['field/Gamefield'], function (Gamefield) {
    var $gf;
    $gf = $(Gamefield.gfSelector);
    var Game = this;
    this.gf = this.gamefield = this.field = U.cc({
        className: Gamefield.className,
        game: this
    });
    this.gf.$eventEl.on('fieldready', start.bind(this));
    window.g = window.game = window.Game = this;
    window.gf = this.gf;

    Game.field.prepareAngular();

    function start(){
        window.Game.field.addGameNumber();
        //g.field.addGameNumber(0,0);
        //g.field.addGameNumber(1,0);
        //g.field.addGameNumber(2,0);
        //g.field.addGameNumber(3,0);
    }
});