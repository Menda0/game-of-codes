
function randomIntBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function UnitSquad(world,player) {

	this.world = world
	this.player = player
	this.units = []
	this.targetX = null
	this.targetY = null
	this.objective = null
	this.currentCastle = null

	this.removeDeadUnits = function () {
        var units_dead = []

		for(var j in this.units){

			var unit = this.units[j]

			if(unit.isDead()){
				units_dead.push(j);
			}
		}

		for(var j in this.units){
			var index = units_dead[j]
			this.units.splice(index,1);
		}
    }

	this.checkCastleToAttack = function () {
        if(!this.currentCastle || this.currentCastle.player != this.player){
            for(var i in this.world.castles){
                var castle = this.world.castles[i]

                if(castle.player != this.player){
                    this.currentCastle = castle
                    break;
                }
            }
        }
    }

    this.checkCastleToDefend = function () {

		var castles = [];

        if(!this.currentCastle || this.currentCastle.player != this.player){
            for(var i in this.world.castles){
                var castle = this.world.castles[i]

                if(castle.player == this.player){
                    castles.push(castle);
                }
            }

            var index = randomIntBetween(0,castles.length)

			this.currentCastle = castles[index]
        }
    }

    this.attack = function () {
        this.checkCastleToAttack()

        for(var i in this.units){

            var unit = this.units[i]
            if(this.currentCastle) {
                if (this.units.length >= this.player.squad_size) {

                    var x = this.currentCastle.x - i * randomIntBetween(-25, 25)
                    var y = this.currentCastle.y - i * randomIntBetween(-25, 25)

                    unit.goTo(x, y);
                }
            }
            unit.attackFirstAvailableTarget()

        }
    }

    this.defence = function () {
        this.checkCastleToDefend()

        for(var i in this.units){

            var unit = this.units[i]
            if(this.currentCastle){
                if(this.units.length >= this.player.squad_size){
                    var x = this.currentCastle.x-i*randomIntBetween(-40,40)
                    var y = this.currentCastle.y-i*randomIntBetween(-40,40)

                    unit.goTo(x,y);
                }
            }

            unit.attackFirstAvailableTarget()

        }
    }

	this.update = function () {

        //this.removeDeadUnits()

		if(this.objective == "attack"){

            this.attack()

		}else{
			this.defence()
		}

    }

}


function Squads(name){
	Player.call(this,name)

	this.squads = []
	this.squad_size = 5

	this.addUnitsToSquads = function () {

		for(var i in this.units){
			var unit = this.units[i]

			if(!unit.hasSquad){
				for(var j in this.squads){
					var squad = this.squads[j]

					if(squad.units.length < this.squad_size){
                        unit.hasSquad = true
						squad.units.push(unit)
						break
					}
				}
			}
		}

    }

    this.createSquads = function () {
        var nsquads = this.units.length/this.squad_size

        if(this.squads.length <= nsquads){
            for(var i=this.squads.length;i<nsquads;i++){
                var squad = new UnitSquad(this.world,this);

                squad.objective = "attack"
                if(i%2 == 0){
                    squad.objective = "attack"

                }else{
                    squad.objective = "defend"
                }

                this.squads.push(squad)
            }
        }
    }

	this.update = function(){

        this.createSquads();

        this.addUnitsToSquads();

        for(var i in this.squads){

            var squad = this.squads[i]

			squad.update();
		}
	}

}

var squad = new Squads("Squad Madness");