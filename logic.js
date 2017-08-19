console.log("helloworld");

function randomIntBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function Rect(x1,y1,x2,y2){
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;



	this.getCenter = function(){

		var point = {
			"x": this.x1 + (this.x1+this.x2)/2,
			"y": this.y1 + (this.y1+this.y2)/2
		}

		return point;
	}
}

function World(width,height){

	this.N_UNITS_GENERATED = 3;

	this.castles = [];
	this.players = [];

	this.width = width;
	this.height = height;
	this.drawer;

	this.bases = null;

	this.init = function(nCastles){

		this.initCastles(nCastles);
	}

	this.update = function(){
		this.updateUnits();
		this.updatePlayers();

	}

	this.updatePlayers = function(){
		for(var i in this.players){
			var player = this.players[i];

			player.update();
		}
	}

	this.updateUnits = function(){

		for(var i in this.players){
			var player = this.players[i];

			var units_dead = []

			for(var j in player.units){

				var unit = player.units[j];

				
				if(unit.isDead()){
					units_dead.push(j);
				}else{
					unit.update();
				}
			}

			for(var j in units_dead){
				var index = units_dead[j]
				var unit = player.units[index]
				player.units.splice(index,1);
				player.units_dead.push(unit)
			}
		}
	}

	this.generateUnits = function(){

		for(var i in this.castles){
			var castle = this.castles[i];
			var player_castle = castle.player;
			var displacement = 35;

			if(player_castle){
				for(var i=0;i<this.N_UNITS_GENERATED;i++){

					var displacementX = castle.x + randomIntBetween(-displacement,displacement);

					var displacementY = castle.y + randomIntBetween(-displacement,displacement);

					var unit = new Unit(displacementX,displacementY,player_castle);
					player_castle.units.push(unit);

				}
			}
		}

	}

	this.addPlayer = function(player){
		this.players.push(player)
		player.world = this;
		player.index = this.players.length-1;
	}

	this.initCastles = function(nCastles){

		var columns = nCastles;
    	var rows = nCastles;

    	var tileWidth  = this.width / columns;
    	var tileHeight = this.height / rows;

    	for(var i=0;i<rows;i++){
    		for(var j=0;j<columns;j++){

    			var x = i * tileWidth + tileWidth/2;
    			var y = j * tileHeight + tileHeight/2;

    			this.addCastle(i,x,y);
    		}
    	}

    	var castles_to_choose = this.castles.slice();
    	for(var i=0;i<this.players.length;i++){

    		var random = Math.max(0,Math.floor(Math.random() * castles_to_choose.length) - 1) ;

    		var castle = castles_to_choose[random];

    		castle.player = this.players[i];
			this.players[i].castles.push(castle);

			castles_to_choose.splice(random,1); 		
    	}

	}

	this.addCastle = function(index,x,y){

		this.castles.push(new Castle(index,x,y));

	}

}

function Castle(index,x,y,player){

	this.MAX_LIFE = 2000;

	this.index = index;
	this.x = x;
	this.y = y;
	this.player = player;

	this.life = this.MAX_LIFE

}



function Player(name){
	this.name = name;
	this.world;

	this.castles = [];
	this.units = [];
	this.units_dead = [];

}

function Unit(x,y,player){
	this.MAX_LIFE = 100;
	this.DAMAGE = 5;
	this.ATACK_RADIUS = 20;

	this.x = x;
	this.y = y;
	this.velocity = 5;
	this.player = player;

	this.targetX = null;
	this.targetY = null;

	this.attacked = false;

	this.life = this.MAX_LIFE;

	this.isDead = function(){
		return this.life <= 0;
	}

	this.inRadius = function(x,y){
		return Math.sqrt((this.x-x)*(this.x-x) + (this.y-y)*(this.y-y)) <= this.ATACK_RADIUS
	}

	this.playSwordSound = function () {
        var flag = randomIntBetween(0,5)
		if(flag == 0) {
            var random = randomIntBetween(0, 4)
            this.player.world.drawer.cc.audioEngine.playEffect("assets/sounds/swords/" + random + ".wav", false)
        }


    }

    this.playVictorySound = function(){
        this.player.world.drawer.cc.audioEngine.setEffectsVolume(1)
        this.player.world.drawer.cc.audioEngine.playEffect("assets/sounds/victory/victory.wav",false)
        this.player.world.drawer.cc.audioEngine.setEffectsVolume(0.2)
	}


	this.attackFirstAvailableCastle = function(){
		if(!this.attacked){
			var allPlayers = this.player.world.players;
			var allCastles = this.player.world.castles;

			for(var i in allCastles){
				var castle = allCastles[i];

				if(castle.player == this.player){
					continue;
				}else{
					if(this.inRadius(castle.x,castle.y)){
						castle.life -= this.DAMAGE;

                        this.playSwordSound()
						this.attacked = true;
						if(castle.life <= 0){
                            this.playVictorySound()
                            castle.player = this.player;
							castle.life = castle.MAX_LIFE;
						}
						return
					}
				}
			}
		}
	}

	this.attackFirstAvailableTarget = function(){
		if(!this.attacked){
			var allPlayers = this.player.world.players;
			var allCastles = this.player.world.castles;

			for(var i in allCastles){
				var castle = allCastles[i];

				if(castle.player == this.player){
					continue;
				}else{
					if(this.inRadius(castle.x,castle.y)){
						castle.life -= this.DAMAGE;

                        this.playSwordSound()

						this.attacked = true;
						if(castle.life <= 0){
                            this.playVictorySound();
							castle.player = this.player;
							castle.life = castle.MAX_LIFE;
						}
						return
					}
				}
			}

			for(var i in allPlayers){
				var player = allPlayers[i];

				if(player == this.player){
					continue;
				}else{
					for(var j in player.units){
						var unit = player.units[j]

						if(this.inRadius(unit.x,unit.y)){
							unit.life -= this.DAMAGE;

                            this.playSwordSound()

							this.attacked = true;
							return
						}
					}

				}
			}
		}
	}

	this.reachTarget = function(){

		if(this.targetX && this.targetY){
			return this.targetY == Math.round(this.y) && this.targetX == Math.round(this.x);
		}else{
			return true;
		}
		
	}

	this.goTo = function(x,y){
		this.targetY = y;
		this.targetX = x;
	}

	this.goToNearestCastle = function(){
		var castles = this.player.world.castles;

		for(var i in castles){
			var castle = castles[i];

			if(castle.player == this.player){
				continue;
			}else{
				this.goTo(castle.x,castle.y);
			}
		}
	}

	this.moveToPosition = function(){
		if(this.targetX != null && this.targetY != null){
			var dx = this.targetX - this.x;
			var dy = this.targetY - this.y;
			var angle = Math.atan2(dy, dx)

			var xVelocity = this.velocity * Math.cos(angle);
			var yVelocity = this.velocity * Math.sin(angle);

			if(Math.abs(this.x-this.targetX) < this.velocity){
				this.x = this.targetX;
			}else{
				this.x +=xVelocity;
			}

			if(Math.abs(this.y-this.targetY) < this.velocity){
				this.y = this.targetY;
			}else{
				this.y +=yVelocity;
			}

		}
	}

	this.update = function(){
		this.moveToPosition();
		this.attacked = false;
	}
}

function WorldDrawer(cocos,cc,world){


	this.world = world;
	this.world.drawer = this;
	this.cocos = cocos;
	this.cc = cc;


	this.updateDraw = function(delta){

		this.updateDrawUnits();
		this.updateDrawFlags();
	}

	this.updateDrawUnits = function(){

		for(var j in this.world.players){

			var player = this.world.players[j];

			for(var i in player.units){
				var current_unit = player.units[i];

				if(current_unit.sprites){
					this.updateDrawUnit(current_unit);
				}else{
					this.drawUnit(current_unit);
				}
			}

			for(var i in player.units_dead){

				var current_unit = player.units_dead[i];

				this.drawDeath(current_unit);
			}

			player.units_dead = [];
		}
		
	}

	this.draw = function(){
		this.drawTerrain();
		this.drawCastles();
		this.drawPlayer();
	}

	this.updateDrawUnit = function(unit){
		if(unit.sprites){
			for(var i in unit.sprites){

				var current_sprite = unit.sprites[i];
				current_sprite.setPosition(unit.x,unit.y);

			}
		}
	}

	this.drawDeath = function(unit){
		var random = randomIntBetween(0,1)

		this.cc.audioEngine.playEffect("assets/sounds/dead/"+random+".wav",false)

		var unit_scale = 1;

		if(unit != null && unit.sprites){
			for(var i in unit.sprites){
				var sprite = unit.sprites[i];
				this.cocos.removeChild(sprite)
			}

			var random = randomIntBetween(0,5)

			var sprite_death = this.cc.Sprite.create("assets/dead/"+random+".png");

			sprite_death.setPosition(unit.x,unit.y);
			sprite_death.setScale(unit_scale);
			this.cocos.addChild(sprite_death, 2);
		}
		
		
	}

	this.drawUnit = function(unit){

		var unit_scale = 1;
		var unit_x = unit.x;
		var unit_y = unit.y;

		var available_bodies =[
			this.cc.rect(17,0,16, 16),
			this.cc.rect(17,17,16, 16),
			this.cc.rect(17,34,16, 16)
		];

		var available_chest_orange =[
			this.cc.rect(103,0,16, 16),
			this.cc.rect(120,0,16, 16),
			this.cc.rect(137,0,16, 16),
			this.cc.rect(154,0,16, 16),
		];

		var available_chest_blue =[
			this.cc.rect(171,0,16, 16),
			this.cc.rect(188,0,16, 16),
			this.cc.rect(205,0,16, 16),
			this.cc.rect(222,0,16, 16),
		];

		var available_chest_green =[
			this.cc.rect(103,85,16, 16),
			this.cc.rect(120,85,16, 16),
			this.cc.rect(137,85,16, 16),
			this.cc.rect(154,85,16, 16),
		];

		var available_chest_black =[
			this.cc.rect(239,85,16, 16),
			this.cc.rect(256,85,16, 16),
			this.cc.rect(273,85,16, 16),
			this.cc.rect(290,85,16, 16),
		];

		var available_hair =[];
		for(var i=0;i<9;i++){
			var rect = this.cc.rect(324+i*16+i,0,16, 16);
			available_hair.push(rect)
		}

		var available_weapons =[];
		for(var i=0;i<10;i++){
			var rect = this.cc.rect(749,i*16+i,16, 16);
			available_weapons.push(rect)
		}

		var available_shields =[];
		for(var i=0;i<9;i++){
			var rect = this.cc.rect(562,i*16+i,16, 16);
			available_shields.push(rect)
		}

		var sprites = [];



		var body_index = Math.floor(Math.random() * available_bodies.length) 

		var sprite_body = this.cc.Sprite.create("assets/units/unit.png",available_bodies[body_index]);
		sprites.push(sprite_body);
		sprite_body.setPosition(unit_x,unit_y);
		sprite_body.setScale(unit_scale);
		this.cocos.addChild(sprite_body, 2);

		if(unit.player.index == 0){
			var chest_available = available_chest_black;
		}else if(unit.player.index == 1){
			var chest_available = available_chest_green;
		}else if(unit.player.index == 2){
			var chest_available = available_chest_blue;
		}else{
			var chest_available = available_chest_orange;
		}	

		var chest_index = Math.floor(Math.random() * chest_available.length) 

		var sprite_chest = this.cc.Sprite.create("assets/units/unit.png",chest_available[chest_index]);
		sprites.push(sprite_chest);
		sprite_chest.setPosition(unit_x,unit_y);
		sprite_chest.setScale(unit_scale);
		this.cocos.addChild(sprite_chest, 2);


		var sprite_pants = this.cc.Sprite.create("assets/units/unit.png",this.cc.rect(52,0,16, 16));
		sprites.push(sprite_pants);
		sprite_pants.setPosition(unit_x,unit_y);
		sprite_pants.setScale(unit_scale);
		this.cocos.addChild(sprite_pants, 2);

		var hair_index = Math.floor(Math.random() * available_hair.length) 

		var sprite_hair = this.cc.Sprite.create("assets/units/unit.png",available_hair[hair_index]);
		sprites.push(sprite_hair);
		sprite_hair.setPosition(unit_x,unit_y);
		sprite_hair.setScale(unit_scale);
		this.cocos.addChild(sprite_hair, 2);

		var weapons_index = Math.floor(Math.random() * available_shields.length) 

		var sprite_weapon = this.cc.Sprite.create("assets/units/unit.png",available_shields[weapons_index]);
		sprites.push(sprite_weapon);
		sprite_weapon.setPosition(unit_x,unit_y);
		sprite_weapon.setScale(unit_scale);
		this.cocos.addChild(sprite_weapon, 2);

		var shields_index = Math.floor(Math.random() * available_weapons.length) 

		var sprite_shield = this.cc.Sprite.create("assets/units/unit.png",available_weapons[shields_index]);
		sprites.push(sprite_shield);
		sprite_shield.setPosition(unit_x,unit_y);
		sprite_shield.setScale(unit_scale);
		this.cocos.addChild(sprite_shield, 2);


		unit.sprites = sprites;

	}

	this.drawPlayer = function(){

		var point1 = {
			"x":50,
			"y":600
		}

		var point2 = {
			"x":50,
			"y":30
		}

		var point3 = {
			"x":950,
			"y":30
		}

		var point4 = {
			"x":950,
			"y":600
		}

		var points = [point1,point2,point3,point4];

		for(var i in this.world.players){

			var player = this.world.players[i];

			var displacement = 330;
			var x_of_flag = i*displacement + 50;

			var point = points[i];

			var label = this.cc.LabelTTF.create(player.name,"Monaco", 20, this.cc.size(0, 0), 0);
			label.setPosition(point.x+130,point.y);
			this.cocos.addChild(label, 2);

			var sprite_flag = this.cc.Sprite.create("assets/flags/"+player.index+".png"); 
			
			var scale_flag = 0.4;
			sprite_flag.setPosition(point.x,point.y);
			sprite_flag.setScale(scale_flag);
			this.cocos.addChild(sprite_flag, 3);

			var sprite_circle = this.cc.Sprite.create("assets/ui/circle.png"); 
			var scale_circle = 1.3
			
			sprite_circle.setPosition(point.x,point.y);
			sprite_circle.setScale(scale_circle);
			this.cocos.addChild(sprite_circle, 2);

		}

	}

	this.updateDrawFlags = function(){
		var castles = this.world.castles;

		for(var i=0;i<castles.length;i++){

			if(this.sprites_flags && this.sprites_flags[i]){
				this.cocos.removeChild(this.sprites_flags[i]);
			}
			
			var castle = castles[i];

			if(castle.player){
				var sprite_flag = this.cc.Sprite.create("assets/flags/"+castle.player.index+".png"); 
			}else{
				var sprite_flag = this.cc.Sprite.create("assets/flags/none.png"); 
			}

			this.sprites_flags[i] = sprite_flag

			var scale_flag = 0.4;
			sprite_flag.setPosition(castle.x-35,castle.y-35);
			sprite_flag.setScale(scale_flag);
			this.cocos.addChild(sprite_flag, 3);
		}
	}

	this.drawCastles = function(){

		var castles = this.world.castles;

		this.sprites_flags = new Array(4);

		for(var i=0;i<castles.length;i++){

			var castle = castles[i];

			var scale = 0.7;

			var random = Math.floor(Math.random() * 3) ;  

			var size = this.cc.director.getWinSize();
			sprite_castle = this.cc.Sprite.create("assets/castles/"+random+".png");

			sprite_castle.setPosition(castle.x,castle.y);
			sprite_castle.setScale(scale);
			this.cocos.addChild(sprite_castle, 1);

			if(castle.player){
				var sprite_flag = this.cc.Sprite.create("assets/flags/"+castle.player.index+".png"); 
			}else{
				var sprite_flag = this.cc.Sprite.create("assets/flags/none.png"); 
			}

			this.sprites_flags[i] = sprite_flag

			var scale_flag = 0.4;
			sprite_flag.setPosition(castle.x-35,castle.y-35);
			sprite_flag.setScale(scale_flag);
            sprite_flag.setOpacity(0)
			this.cocos.addChild(sprite_flag, 3);

            var actionMove = this.cc.FadeIn.create(1, 1);
            sprite_flag.runAction(actionMove);

			var sprite_circle = this.cc.Sprite.create("assets/ui/circle.png"); 
			var scale_circle = 1.3
			
			sprite_circle.setPosition(castle.x-35,castle.y-35);
			sprite_circle.setScale(scale_circle);
            sprite_circle.setOpacity(0)
			this.cocos.addChild(sprite_circle, 2);

            var actionMove = this.cc.FadeIn.create(1, 1);
            sprite_circle.runAction(actionMove);
		}

	}

	this.drawTerrain = function(){

        this.cc.audioEngine.playMusic("assets/sounds/theme/theme.mp3",true)

		var tileSizeX = 120;
		var tileSizeY = 140
		var width = this.world.width;
		var height = this.world.height;
		var scale = 0.5;
		var tileSizeXScale = tileSizeX*scale;
		var tileSizeYScale = tileSizeY*scale;

		for(var i=0;i<=(width/tileSizeXScale);i++){
			for(var j=0;j<=(height/tileSizeYScale);j++){

				var random = Math.floor(Math.random() * 26) ;  

				var size = this.cc.director.getWinSize();
				var sprite = this.cc.Sprite.create("assets/ground/"+random+".png");

				if(j%2 == 0){
					var x = i*tileSizeXScale;
				}else{
					var x = i*tileSizeXScale-(tileSizeXScale/2);
				}
				
				var y = j*tileSizeYScale;

				sprite.setPosition(x,y);
				sprite.setScale(scale);
				this.cocos.addChild(sprite, 0);
			}	
		}

        var sprite_logo = this.cc.Sprite.create("assets/logo/logo.png");
        sprite_logo.setPosition(600,800);
        sprite_logo.setScale(0.4);
        this.cocos.addChild(sprite_logo, 1);

        var actionMove = this.cc.MoveTo.create(2, cc.p(600,500));
        sprite_logo.runAction(actionMove);

    }

}