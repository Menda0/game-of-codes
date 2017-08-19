
function randomIntBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function RushCastle(name){
	Player.call(this,name)

	this.update = function(){
		for(var i in this.units){

			var unit = this.units[i];
			unit.goToNearestCastle();
			unit.attackFirstAvailableTarget();
		}
	}

}

var rush_castle1 = new RushCastle("Rush the Castle");
var rush_castle2 = new RushCastle("Castle Invaider");