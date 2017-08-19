
function randomIntBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function WalkingDeadPlayer(name){
	Player.call(this,name)

	this.update = function(){
		for(var i in this.units){

			var unit = this.units[i];
			unit.attackFirstAvailableTarget();

			if(unit.reachTarget()){

				var x = randomIntBetween(20,1100);
				var y = randomIntBetween(20,600);

				unit.goTo(x,y);
			}

		}
	}

}

var walking_dead_player1 = new WalkingDeadPlayer("The walking dead");
var walking_dead_player2 = new WalkingDeadPlayer("World war z");