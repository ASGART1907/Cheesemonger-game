const textureLoader = (target) => {
    return PIXI.Assets.load(target.source)
        .then(result => {
            target.texture = result;
            return result; // Return the result so it's not undefined
        })
        .catch(err => {
            console.log(err);
            throw err; // Rethrow the error to be caught later if needed
        });
}

const loadImage = (target) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            target.image = image;
            resolve(image);
        };
        image.onerror = (error) => {
            reject(error);
        };
        image.src = target.source;
    });
}

const loadBaseTexture = (target) => {
    return new Promise((resolve,reject) => {
        const baseTexture = PIXI.BaseTexture.from(target.image);

        baseTexture.on("loaded",() => {
            target.texture = baseTexture;
            resolve(baseTexture);
        })

        baseTexture.on("error",() => {
            reject(baseTexture);
        })
    })
}

const loadSound = (target) => {
    return new Promise((resolve, reject) => {
        new Howl({
            src: [target.source],
            preload: true,
            loop:target.loop ? true : false,
            onload: function() {
                target.sound = this;
                resolve(this); // Resolve the Promise with the loaded sound instance
            },
            onloaderror: function(error) {
                reject(error);
            }
        });
    });
};

const loadAssets = async () => {
    let timer = setInterval(async() => {
        if(app){
         
            clearInterval(timer);
            const promises = [];

            for(const asset in assets){
                const sprites = assets[asset];
                for(const sprite in sprites){
                    const target = sprites[sprite];
                    if(target.source){
                        promises.push(textureLoader(target));
                    }else{
                        for(const result in target){
                            const item = target[result];
                            promises.push(textureLoader(item));
                        }
                    }
                }
            }


            const text = PIXI.Assets.load('./css/Textur.ttf')
            .then((result) => {
                fontFamily = result.family;
                return result;
            })
            .catch(err => console.log(err));

            promises.push(text);

            for(const sound in sounds){
                const audio = sounds[sound];
                promises.push(loadSound(audio));
            }

            for(const icon in assets.domIcons){
                const target = assets.domIcons[icon];
                promises.push(loadImage(target));
            }

            for(const key in atlases){
                const atlas = atlases[key];
                for(const key2 in atlas){
                    const target = atlas[key2].meta;
                    promises.push(loadBaseTexture(target));
                }
            }

            try{
                await Promise.all(promises);
                activeTile = assets.tiles.lava.lavaDark;

                const btns = document.querySelectorAll("button");
                btns.forEach(btn => btn.addEventListener("click",() => {
                    soundPlay(sounds.click.sound);
                }))


                sounds.game.sound.loop = true;
                sounds.game.sound.volume(0.1);
                sounds.game.sound.play();

                loadingEl.style.display = "none";
            }catch(err){
                console.log(err)
            }

        }
    },1000);

}

const collisionRect = (rect1,rect2) => {
    if(rect1.x + rect1.width < rect2.x ||
        rect1.x > rect2.x + rect2.width ||
        rect1.y + rect1.height < rect2.y ||
        rect1.y > rect2.y + rect2.height) return false;
        else return true;
}

const createParticle = ({position,texture,particleCount,speed}) => {

    const particleContainer = new PIXI.ParticleContainer();
    for(let i=0; i<particleCount; i++){
        const sprite = new PIXI.Sprite(texture);
        sprite.velocity = {
            x:(Math.random() - 0.5) * speed,
            y:(Math.random() - 0.5) * speed,
        }
        sprite.scale.set(Math.random() * 1);
        particleContainer.x = position.x;
        particleContainer.y = position.y;
    
        particleContainer.addChild(sprite);
    }
    particles.push(particleContainer);

    app.stage.addChild(particleContainer);
}

const soundPlay = (sound) => {
    if(!gameEvents.sound) return;
    sound.play();
}


soundEl.addEventListener("click",() => {
    gameEvents.sound = !gameEvents.sound;

    const el = soundEl.firstElementChild.firstElementChild;
    if(gameEvents.sound){
        sounds.game.sound.play();
        el.src = assets.domIcons.iconSoundOn.image.src;
    }else{
        sounds.game.sound.pause();
        el.src = assets.domIcons.iconSoundOff.image.src;
    }
})

startGameBtnEl.addEventListener("click",() => {
    if(!gameEvents.isGame){
        gameEvents.isGame = true;
        gsap.to(homeContainer,{
            scale:0.5,
            duration:0.4,
            onComplete:function(){
                homeContainer.style.display = "none";
                game = new Game();
                game.create();
            }
        })
    }
})

gameAboutEl.lastElementChild.lastElementChild.addEventListener("click",() => {
    gameAboutEl.style.display = "none";
})

loadAssets();

document.addEventListener("contextmenu",(e) => {
    e.preventDefault();
})