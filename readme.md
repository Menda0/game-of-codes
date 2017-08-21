## Run

open index.html

## Developing you AI

Create a ai.js in ai folders

Extend Player Class like this.

```javascript
function WalkingDeadPlayer(name){
	Player.call(this,name)
}
```

To add logic create an update function

Now you can iterate from your units and call them for action this

```javascript
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
```

Dont forget to add you AI to game in main.js like this.

```javascript
var walking_dead_player1 = new WalkingDeadPlayer("The walking dead");
world.addPlayer(walking_dead_player1);
```