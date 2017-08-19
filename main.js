

var world = new World(1200,600);
var worldDrawer = null;
window.onload = function(){

	cc.game.onStart = function(){
	//load resources
		cc.LoaderScene.preload(["assets/loading/loading.jpg"], function () {

			var MyScene = cc.Scene.extend({
				onEnter:function () {
					this._super();

                    cc.audioEngine.setEffectsVolume(0.2)

					//var player1 = new Player("Lanister Team");
					//var player2 = new Player("King of the North");
					//var player3 = new Player("Losers of terrain");
					//var player4 = new Player("Cersei sucks");

					world.addPlayer(walking_dead_player1);
					world.addPlayer(squad);
					world.addPlayer(walking_dead_player2);
					world.addPlayer(rush_castle2);
					//world.addPlayer(player3);
					//world.addPlayer(player4);

					world.init(2);

					worldDrawer = new WorldDrawer(this,cc,world);
					worldDrawer.draw(this,cc);

					world.generateUnits();
					world.generateUnits();
					world.generateUnits();

					var generateUnits = function(delta){
						world.generateUnits();
					}

					this.schedule(generateUnits, 3);


					this.scheduleUpdate()
					
				},
				update:function(){
					world.update();
					worldDrawer.updateDraw();
				}
			});
			cc.director.runScene(new MyScene());
		}, this);
	};
	cc.game.run("gameCanvas");
};
