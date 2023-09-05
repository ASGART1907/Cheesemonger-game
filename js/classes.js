class GlassTile{
    constructor({position}){
        this.position = position;
        this.container = new PIXI.Container();
        this.container.isCollision = false;
        this.container.zIndex = 2;

        this.filter = new PIXI.filters.ColorMatrixFilter();
        this.filter.contrast(1.5);
        this.create();
    }

    create(){
        const gls = [
            "orangeIn",
            "blueOut",
            "greenPanel",
            "lavaDark",
            "yellowPlane",
            
        ];
        for(let i=0; i<4; i++){
            const randomTexture = gls[Math.floor(Math.random() * gls.length)];
            const newTile = assets.tiles.glases[randomTexture].tile;
            const texture = assets.tiles.glases[randomTexture].texture;
            const sprite = new PIXI.Sprite(texture);
            sprite.tile = newTile;
            sprite.x = i * tileSize;
            sprite.filters = [this.filter];
            this.container.addChild(sprite);
        }

        this.container.x = this.position.x + 5;
        this.container.y = this.position.y + 5;
        app.stage.addChild(this.container);
    }

    changeAllTileTexture(texture) {
        const totalAnimationDuration = 2; // Total duration for all tiles to change in seconds
        floor.containers.forEach(container => {
            const children = container.children;
            if(texture === children[0].texture) return;

            setTimeout(() => {
                soundPlay(sounds.tile.sound);
            },500);
    
            children.forEach((child, index) => {
                if (!child.custom) {
                    const singleTileDuration = totalAnimationDuration / children.length;
                    const delay = (children.length - index) * singleTileDuration;
    
                    gsap.to(child, {
                        alpha: child.alpha,
                        duration: singleTileDuration / 2,
                        delay: delay,
                        onComplete: () => {
                            child.texture = texture;
                            gsap.to(child, {
                                alpha: child.alpha,
                                duration: singleTileDuration / 2
                            });
                        }
                    });
                }
            });
        });
    }

    update(){
        this.container.y += startGameVelocity.y;

        const children = this.container.children;
        const plr = player.collisionBox;
        children.forEach((child,index) => {
            const childCollisionBox = child.getBounds();
        
            if(collisionRect(plr,childCollisionBox) && !children.isCollision){
                children.isCollision = true;
                soundPlay(sounds.glass.sound);
                createParticle({
                    position:{
                        x:childCollisionBox.x + childCollisionBox.width / 4,
                        y:childCollisionBox.y + childCollisionBox.height / 2
                    },
                    texture:child.texture,
                    particleCount:30,
                    speed:15
                });

                children[index].destroy();
                this.changeAllTileTexture(eval(child.tile));
                this.filter.blackAndWhite();
                children.forEach(sprite => {
                    sprite.filters = [this.filter];
                })

                cheeseCount = 0;
                scoreEl.innerHTML = cheeseCount;
            }
        })

    };
}

class Floor{
    constructor(tileCountX,tileCountY,enemies,scoreText){
        this.tileSize = 80;
        this.containers = [];
        this.tileCountX = tileCountX;
        this.tileCountY = tileCountY;
        this.velocity = startGameVelocity;
        this.enemies = enemies;
        this.scoreText = scoreText;

		this.sections = [
			"greenSection",
			"pinkSection",
			"blueSection",
			"redSection",
		];

        this.filter = new PIXI.filters.ColorMatrixFilter();
        this.filter.blackAndWhite();

        for(let i = 1; i>-1; i--){
            this.create(i);
        }
    };

    create(index){
        const container = new PIXI.Container();

        let texture = activeTile.texture;

		const sectionCount = this.sections[Math.floor(Math.random() * this.sections.length)];
		const randomSection = assets.sections[sectionCount];
        const sectionSprite = new PIXI.Sprite(randomSection.texture);

        sectionSprite.custom = true;
        sectionSprite.select = false;

        let x,y;
        for(y = 0; y<this.tileCountY; y++){
            for(x = 0; x<this.tileCountX; x++){
                const sprite = new PIXI.Sprite(texture);

                const randomAlphaTile = Math.floor(Math.random() * this.tileCountX);

                if(x === randomAlphaTile){
                    sprite.alpha = 0.3;
                }
                sprite.position.y = y * this.tileSize;
                sprite.position.x = x * this.tileSize;
                container.addChild(sprite);
            }
        }

        const scale = container.width / sectionSprite.width;

        sectionSprite.scale.set(scale);
        sectionSprite.anchor.set(0);

        container.x = (GAME_WIDTH * 0.5) - (container.width / 2);
        const containerY = -(container.height - GAME_HEIGHT * 0.4);
        container.y = index === 0 ? containerY : -(2 * containerY);

        sectionSprite.y = container.height;
        container.addChild(sectionSprite);

        if(index === 0){
            this.scoreText.y = (container.y + container.height) - (sectionSprite.height / 2) - this.scoreText.height / 2;
        }

        app.stage.addChild(container);

        // let visibleTiles = 0;
        // container.children.forEach((tile,index) => {
        //     if(tile.alpha === 1){
        //         visibleTiles++;
        //         if(visibleTiles === 10){
        //         const enemyPosition = {
        //             x:100,
        //             y:container.y + (tileSize + 10) + tile.y
        //         };


        //         }
        //     }else{
        //         visibleTiles = 0;
        //     }
        // })

        this.containers.push(container);
        app.stage.addChild(this.scoreText);

        this.createCheese({position:{
            x:screenMargins,
            y:container.y < 0 ? container.y : -(tileSize + container.y + sectionSprite.height / 2)
        },tileCountX:this.tileCountX,tileCountY:this.tileCountY,index});
    }

    createEnemy({position}){
        const atlas = Math.random() < 0.5 ? atlases.snake.blueSnake : atlases.snake.greenSnake;

        const enemy = new Enemy({
            atlas,
            position
        });

        this.enemies.push(enemy);
    }

    createGlassTile(position){
        glassTiles.push(
         new GlassTile({
            position
            })
        );
    }

    createCheese({position,tileCountX,tileCountY,index}){
        new Cheese({
            position,
            tileCountX,
            tileCountY,
            index
        });
    }

    settingNewCheesePosition({containerY}){
        const previousValues = new Set();
        cheeses.forEach(cheese => {
            if(cheese.y > GAME_HEIGHT){
                const newPositionY = Math.floor(Math.random() * (this.tileCountY / 2));
                
                let containerXaxios = null;

                do{
                    containerXaxios = Math.floor(Math.random() * (this.tileCountX));
                }while(previousValues.has(containerXaxios));

                previousValues.add(containerXaxios);

                cheese.y = (containerY + (newPositionY * tileSize) + 10);
                cheese.x = (screenMargins + (containerXaxios * tileSize) + 10);

                cheese.children.forEach(item => {
                    if(item.alpha < 1){
                        item.alpha = 1;
                    }
                })
            }
        });
    }

    update(){
        cheeses.forEach(cheese => {
            cheese.y += startGameVelocity.y;

            cheese.children.forEach(item => {
                const itemCollisionBox = item.getBounds();

                if(collisionRect(player.collisionBox,itemCollisionBox)){
                    if(item.alpha === 1){
                        item.alpha = 0;
                        soundPlay(sounds.food.sound);
                        cheeseCount++;
                        scoreEl.innerHTML = cheeseCount;

                        createParticle({
                            position:{
                                x:itemCollisionBox.x + itemCollisionBox.width / 4,
                                y:itemCollisionBox.y + itemCollisionBox.height / 4
                            },
                            texture:assets.particles.yellowFlarePolygon.texture,
                            particleCount:30,
                            speed:2
                        });
                    };
                }
            })
        });

        this.scoreText.y += this.velocity.y;

        this.containers.forEach(container => {
            container.y += this.velocity.y;

            container.children.forEach(child => {
                if(child.alpha !== 1 && player.activeAnimate !== "jump"){
                    const childCollisionBox = child.getBounds();
                    if(collisionRect(player.collisionBox,childCollisionBox)){
                        game.gameOver();
                    }
                }
            })

            if(container.y > GAME_HEIGHT){
                const orderContainer = this.containers.find(c => c !== container);


                container.y = orderContainer.y - container.height;

                if(cheeseCount >= 10){
                    const position = {
                        x:(screenMargins / 2) + Math.floor(Math.random() * this.tileCountX / 2) * tileSize,
                        y:(container.y)//+ Math.floor(Math.random() * (this.tileCountY - 1)) * tileSize
                    }
    
                    this.createGlassTile(position);
                }
                
                this.settingNewCheesePosition({containerY:container.y});
               

                const children = container.children;
                let visibleTileCount = 0;
                children.forEach((child,index) => {
                    if(child.alpha !== 1) child.alpha = 1;

					if(child.custom){
						const sectionCount = this.sections[Math.floor(Math.random() * this.sections.length)];
						const randomSection = assets.sections[sectionCount];

						const newTexture = PIXI.Texture.from(randomSection.source);
						child.texture = newTexture;
                        child.filters = null;
                        child.select = false;
					}

                    const randomAlphTile = Math.floor(Math.random() * children.length);
                    const alphaTile = children[randomAlphTile];
                    if(alphaTile.alpha === 1 && !alphaTile.custom) alphaTile.alpha = 0.3;

                    if(index === children.length - 1){
                        children.forEach(item => {
                            if(item.alpha == 1){
                                visibleTileCount++;
                                if(visibleTileCount == 10){

                                    const enemyPosition = {
                                        x:0,
                                        y:container.y + (item.y - item.height) + 8
                                    };
                
                                    this.createEnemy({position:enemyPosition});
                                }
                            }else{
                                visibleTileCount = 0;
                            }
                        });
                    }
                })

            }else if(container.y + container.height > GAME_HEIGHT){
                if(this.scoreText.y > GAME_HEIGHT){
                    const orderContainer = this.containers.find(c => c !== container);
                    const orderSection = orderContainer.children.find(s => s.custom);
                    const newScorePosY = (orderContainer.y + orderContainer.height) - (orderSection.height / 2) - this.scoreText.height / 2;
                    this.scoreText.y = newScorePosY;
                    this.scoreText.change = false;
                    this.scoreText.style.fill = "#ffc93c";
                    this.scoreText.style.stroke = "black";
                }

            }else if(container.y + container.height > 0 && container.y + container.height < GAME_HEIGHT){
                const section = container.children.find(c => c.custom);

                if(!this.scoreText.change){
                    score++;
                    this.scoreText.text = "Part  " + score;
                    this.scoreText.x = GAME_WIDTH * 0.5 - this.scoreText.width * 0.5;
                    this.scoreText.change = true;
                }

                if(!section.select){
                    if(collisionRect(player.collisionBox,section.getBounds())){
                        if(player.activeAnimate !== "jump"){
                            section.filters = [this.filter];
                            this.scoreText.style.fill = "darkkhaki";
                            this.scoreText.style.stroke = "white";
                            soundPlay(sounds.level.sound);
                            section.select = true;
                        }
                    }
                }
            }
        })

    }
}

class PlayerSpriteSheet{
    constructor(atlas,position){
		this.position = position;
        this.animations = [];

        this.currentAnimationIndex = 0; // Index of the "run" animation

        this.atlases = atlas;
        this.animate = null;
	}
    create(){
        for(const atlas in this.atlases){
            const target = this.atlases[atlas];

            this.spritesheet = new PIXI.Spritesheet(
                target.meta.texture,
                target
            );

            this.spritesheet.parse();

            const animate = new PIXI.AnimatedSprite(this.spritesheet.animations[target.animName]);
            animate.animationSpeed = target.speed;
            animate.zIndex = 4;

            this.animations.push(animate);
        }

        this.animate = this.animations[this.currentAnimationIndex];
        this.animate.position.set(this.position.x - 2,this.position.y - this.animate.height / 6);

        this.animate.play();

        app.stage.addChild(this.animations[this.currentAnimationIndex]);

    }
}

class Player extends PlayerSpriteSheet{
    constructor({position,atlas}){
		super(atlas,position);
        this.graphics = new PIXI.Graphics();
        app.stage.addChild(this.graphics);

        this.activeAnimate = "run";

        this.create();

        this.position = position;
        this.size = tileSize;
        this.width = 30;
        this.height = 30;

        this.currentAnimationIndex = 0;
        
        this.filter = new PIXI.ColorMatrixFilter();
        this.filter.brightness(1.5);

        this.collisionBox = {
            x:(this.position.x + this.width / 2) + 10,
            y:(this.position.y + this.height / 2) + 10,
            width:this.width,
            height:this.height
        }

        document.addEventListener("keydown",({ key }) => {
            if(gameEvents.start){
                switch(key){
                    case "a":
                        if(this.position.x <= screenMargins) return;
                        this.position.x -= tileSize;
                        if(this.activeAnimate == "jump"){
                            this.animate.position.x = this.position.x - 11;
                        }
                        else this.animate.position.x = this.position.x - 2.5;
                        this.collisionBox.x = (this.position.x + this.width / 2) + 8;
    
                        break;
    
                    case "d":
                        if(this.position.x + this.size >= GAME_WIDTH - this.size) return;
                        this.position.x += tileSize;
                        if(this.activeAnimate == "jump"){
                            this.animate.position.x = this.position.x - 11;
                        }
                        else this.animate.position.x = this.position.x - 2.5;
                        this.collisionBox.x = (this.position.x + this.width / 2) + 8;
    
                    break;

                    case "A":
                        if(this.position.x <= screenMargins) return;
                        this.position.x -= tileSize;
                        if(this.activeAnimate == "jump"){
                            this.animate.position.x = this.position.x - 11;
                        }
                        else this.animate.position.x = this.position.x - 2.5;
                        this.collisionBox.x = (this.position.x + this.width / 2) + 8;
    
                        break;
    
                        case "D":
                            if(this.position.x + this.size >= GAME_WIDTH - this.size) return;
                            this.position.x += tileSize;
                            if(this.activeAnimate == "jump"){
                                this.animate.position.x = this.position.x - 11;
                            }
                            else this.animate.position.x = this.position.x - 2.5;
                            this.collisionBox.x = (this.position.x + this.width / 2) + 8;
        
                        break;
    
                    case " ":
                        if(startGameVelocity.y == 2){
                            soundPlay(sounds.jump.sound);
                            this.changeAnimate(2);
                            this.animate.currentFrame = 0;
                            startGameVelocity.y += 1;
                        }
                    break;
    
                    default: return;
                }    
            }
        })
    }

    changeAnimate(animationIndex) {
        if(animationIndex === 0) this.activeAnimate = "idle";
        else if(animationIndex === 1) this.activeAnimate = "run";
        else this.activeAnimate = "jump";
        // Stop the current animation
        this.animations[this.currentAnimationIndex].stop();
        // Remove the current animation from the stage
        app.stage.removeChild(this.animations[this.currentAnimationIndex]);

        // Update the current animation index
        this.currentAnimationIndex = animationIndex;

        // Play the new animation and add it to the stage
        this.animate = this.animations[this.currentAnimationIndex];
        this.animate.play();

        this.animate.position.set(this.position.x - 11,this.position.y - this.animate.height / 6);
        this.collisionBox.x = (this.position.x + this.width / 2) + 8;


        app.stage.addChild(this.animate);

    }

    gameOver(){
        this.changeAnimate(3);
        soundPlay(sounds.mouse.sound);
    }

    update(){
        if(this.activeAnimate === "jump"){
            const animate = this.animations[this.currentAnimationIndex];
            if(animate.currentFrame === animate.textures.length - 1){
                this.changeAnimate(1);
                this.activeAnimate = "run";
                animate.currentFrame = 0;
                this.animate.position.x = this.position.x - 2.5;
                startGameVelocity.y = 2;
            }
        }
    }
}

class Cheese{
    constructor({position,tileCountX,tileCountY,index}){
        this.tileCountX = tileCountX;
        this.tileCountY = tileCountY;
        this.position = position;
        this.filter = new PIXI.filters.ColorMatrixFilter();
        this.filter.brightness(1.5);
        this.index = index;

        this.create();
    }
    create(){
        const cheeseContainerCount = (Math.floor(Math.random() * (this.tileCountX / 2)) + 1);
        const previousValues = new Set();

        let x,y;
        for(x = 0; x<cheeseContainerCount; x++){
            const container = new PIXI.Container();

            let containerXaxios = null;

            do{
                containerXaxios = (Math.floor(Math.random() * (this.tileCountX / 2)) + 1);
            }while(previousValues.has(containerXaxios));

            previousValues.add(containerXaxios);

            for(y = 0; y<10; y++){
                const texture = y % 2 === 0 ? assets.cheeses.cheese1.texture : assets.cheeses.cheese2.texture;
                const sprite = new PIXI.Sprite(texture);
                sprite.y = y * tileSize;
                sprite.filters = [this.filter];
                container.addChild(sprite);
            }

            const randomYaxios= (Math.floor(Math.random() * (this.tileCountY / 2)) * tileSize);
            container.x = (this.position.x + containerXaxios * tileSize) + 10;
            container.y = this.index === 0 ? (this.position.y + randomYaxios) + 10 : (this.position.y + randomYaxios) - 10;
            container.zIndex = 10;

            app.stage.addChild(container);
            cheeses.push(container);
        }
    }
}

class EnemySpriteSheet{
    constructor(atlas,position){
		this.position = position;

        this.currentAnimationIndex = 0; // Index of the "run" animation

        this.atlases = atlas;
        this.animate = null;
	}
    create(){
        const spritesheet = new PIXI.Spritesheet(
            this.atlases.meta.texture,
            this.atlases
        );

        spritesheet.parse();

        this.animate = new PIXI.AnimatedSprite(spritesheet.animations.creep);
        this.animate.animationSpeed = 0.07;
        this.animate.position.set(this.position.x,this.position.y);

        this.animate.zIndex = 3;

        this.animate.play();

        app.stage.addChild(this.animate);
    }
}

class Enemy extends EnemySpriteSheet{
    constructor({atlas,position}){
        super(atlas,position);
        this.position = position;
        this.isSound = false;
        this.velocity = {
            x:(Math.random() * 2) + 1,
            y:startGameVelocity.y
        };

        this.xAxios = Math.random() > 0.5 ? "left" : "right";

        this.create();
        
        this.animateHeight = this.animate.height;


        this.collisionBoxWidth = this.animate.width - 80;
        this.collisionBoxHeight = 30;
        this.collisionBox = {
                x:this.position.x - this.collisionBoxWidth,
                y:this.position.y + this.collisionBoxHeight,
            width:this.collisionBoxWidth,
            height:this.collisionBoxHeight
        }
 
        if(this.xAxios == "left"){
            this.position.x = 0;
            this.animate.scale.set(-1);

            this.collisionBox.x = this.position.x; 
        }
        else if(this.xAxios == "right"){
            this.position.x = GAME_WIDTH;
            this.velocity.x = -this.velocity.x;
            this.collisionBox.x = this.position.x; 
        }

    }

    update(){
        if(this.xAxios === "left"){
            this.collisionBox.x = this.position.x - this.collisionBoxWidth;
            this.collisionBox.y = this.position.y + 25;
            this.animate.position.set(this.position.x,this.position.y + this.animateHeight);
        
        }else{
            this.collisionBox.x = this.position.x;
            this.collisionBox.y = this.position.y + this.collisionBoxHeight;
            this.animate.position.set(this.position.x,this.position.y);
        }
        
        this.position.y += startGameVelocity.y;

        if(this.position.y > 0 && this.position.y < GAME_HEIGHT){
            if(!this.isSound){
                this.isSound = true;
                soundPlay(sounds.snake.sound);
            }
            this.position.x += this.velocity.x;
        }
    }
}

class Game{
    constructor(){
        this.enemies = [];
        this.tileCountX = Math.floor(GAME_WIDTH / tileSize);
        this.tileCountY = 2 * Math.floor((2 * GAME_HEIGHT) / tileSize);

        const filter = PIXI.filters;

        setTimeout(() => {
            if(gameEvents.start) return;
            sounds.game.sound.volume(0.3);
            gameEvents.start = true;
            startGameVelocity.y = 2;
            player.changeAnimate(1);
            player.animate.position.set(player.position.x - 2,player.position.y - player.animate.height / 6);

            this.animate();
        },2000);
            
        this.scoreText = null;
    }

    gameOver(){
        gameEvents.start = false;

        player.gameOver();

        startGameBtnEl.innerHTML = "RESTART";
        setTimeout(() => {
            sounds.game.sound.volume(0.1);
            homeContainer.style.display = "flex";

            gsap.to(homeContainer,{
                scale:1,
                duration:1,
                ease:"elastic"
            })

        this.init();
        },1000);

        const localGameData = JSON.parse(localStorage.getItem("Game"));
        if(score !== localGameData.scores.score){
            const newGameData = {
                scores:{
                    bestScore:score > localGameData.scores.bestScore ? score : localGameData.scores.bestScore,
                    score:score,
                }
            }

            homeScoreEl.innerHTML = score;
            bestScoreEl.innerHTML = newGameData.scores.bestScore

            localStorage.setItem("Game",JSON.stringify(newGameData));
        }
        
    }

    init(){
        this.enemies.forEach((enemy,index) => {
            app.stage.removeChild(enemy.animate);
        })

        floor.containers.forEach(item => {
            item.destroy();
        });

        cheeses.forEach(cheese => {
            cheese.destroy();
        })

        glassTiles.forEach(glass => {
            glass.container.destroy();
        })

        particles.forEach(particle => {
            // particle.destroy();
            app.stage.removeChild(particle);
        });

        player.animations = [];
        app.stage.removeChild(player.animate);

        app.stage.removeChild(this.scoreText);

        this.enemies = [];
        player = null;
        floor = null;
        cheeses = [];
        glassTiles = [];
        game = null;
        particles = [];
        cheeseCount = 0;
        score = 1;
        scoreEl.innerHTML = cheeseCount;

        gameEvents = {
            start:false,
            sound:true,
            isGame:false
        }
    }

    create(){

        let textStyle = new PIXI.TextStyle({
            fontFamily,
            fontSize: "8rem",
            fontWeight:"lighter",
            padding:15,
            fill: '#ffc93c', // Text color
            stroke:"black",
            align: 'center', // Text alignment
            strokeThickness:3
          });

        this.scoreText = new PIXI.Text('PART  ' + score, textStyle);
        this.scoreText.change = true;

        this.scoreText.x = GAME_WIDTH * 0.5 - this.scoreText.width * 0.5;
        this.scoreText.y = 100;

        floor = new Floor(this.tileCountX,this.tileCountY,this.enemies,this.scoreText);

		const atlas = atlases.mouse;

        const x = (screenMargins + (Math.floor(this.tileCountX / 2)) * tileSize);
        const y = GAME_HEIGHT / 2;
        player = new Player({position:{x,y},atlas});
    }

    animate(){
        if(gameEvents.start) requestAnimationFrame(this.animate.bind(this));
        floor.update();
        player.update();

       if(this.enemies){
        this.enemies.forEach((enemy,index) => {
            enemy.update();

            if(collisionRect(player.collisionBox,enemy.collisionBox) && player.activeAnimate !== "jump"){
                this.gameOver();
            }
            if(enemy.position.y > GAME_HEIGHT){
                app.stage.removeChild(enemy.animate);
                this.enemies.splice(index,1);
            }
        })
       }

        if (particles) {
            particles.forEach((particle,index) => {

                if(particle.alpha > 0){
                    particle.alpha -= 0.04;
                    if(particle.alpha < 0.2){
                        particles[index].destroy();
                        particles.splice(index,1);
                    }
                }

                particle.children.forEach((item) => {
                    const velocity = item.velocity;
                    item.x += velocity.x;
                    item.y += velocity.y;
                });
            });
        }
        
        glassTiles.forEach((item,index) => {
            if(item.container.y > GAME_HEIGHT){
                glassTiles[index].container.destroy();
                glassTiles.splice(index,1);
            }else{
                item.update()
            }
        });
    }
}
