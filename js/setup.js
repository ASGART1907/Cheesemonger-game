let GAME_WIDTH = null;
let GAME_HEIGHT = null;
let loadingEl = null;

const homeContainer = document.querySelector(".homeContainer");
const startGameBtnEl = document.querySelector(".startGameBtn");
const scoreEl = document.querySelector(".score");
const soundEl = document.querySelector(".soundEl");
const bestScoreEl = document.querySelector(".bestscoreEl");
const homeScoreEl = document.querySelector(".homeScoreEl");
const gameAboutEl = document.querySelector(".gameAbout");

let app = null;
let player = null;
let floor = null;
let game = null;
let gameTiles = null;
let fontFamily = null;
let activeTile = null;
let cheeseCount = 0;
let cheeses = [];
let particles = [];
let glassTiles = [];
let score = 1;
const startGameVelocity = {
    x:0,
    y:0
}

let gameEvents = {
    start:false,
    sound:true,
    isGame:false
}

// window.addEventListener("click",() => {
//     var element = document.documentElement; // This refers to the root element of the document
    
//     if (element.requestFullscreen) {
//         element.requestFullscreen();
//     } else if (element.mozRequestFullScreen) { // Firefox
//         element.mozRequestFullScreen();
//     } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
//         element.webkitRequestFullscreen();
//     } else if (element.msRequestFullscreen) { // IE/Edge
//         element.msRequestFullscreen();
//     }
// })

const tileSize = 80;
let screenMargins = null;

window.addEventListener("load",() => setup());

const setup = () => {

    setLocalStorage();

    const gameContainer = document.querySelector(".gameContainer");

    const gameContainerRect = gameContainer.getBoundingClientRect();

    loadingEl = gameContainer.querySelector(".loadingContainer");

    GAME_WIDTH = gameContainerRect.width - 10;
    GAME_HEIGHT = gameContainerRect.height;

    screenMargins = Math.floor((GAME_WIDTH - (Math.floor(GAME_WIDTH / 80) * tileSize)) / 2)

    app = new PIXI.Application({
        width:GAME_WIDTH,
        height:GAME_HEIGHT,
        useContextAlpha:false,
        backgroundAlpha:0,
        antialias:false
    });

    if (PIXI.utils.isWebGLSupported()) {
        app.renderer = PIXI.autoDetectRenderer({
            width:GAME_WIDTH,
            height:GAME_HEIGHT,
            backgroundAlpha:0,
            antialias: false
        });
      } else {
        app.renderer = new PIXI.CanvasRenderer({
            backgroundAlpha:0,
            width:GAME_WIDTH,
            height:GAME_HEIGHT,
            backgroundAlpha:0,
            antialias: false
        });
      }

      gameContainer.append(app.view);
}

const setLocalStorage = () => {
    if(localStorage.getItem("Game")){
        const game = JSON.parse(localStorage.getItem("Game"));
        bestScoreEl.innerHTML = game.scores.bestScore;
        homeScoreEl.innerHTML = game.scores.score;

        if(game.isFirstStart){

            gameAboutEl.style.display = "flex";

            const newData = {
                scores:{
                    bestScore:0,
                    score:0
                },
                isFirstStart:false
            }

            localStorage.setItem("Game",JSON.stringify(newData));
        }
    }else{
        const game = {
            scores:{
                bestScore:0,
                score:0
            },
            isFirstStart:true
        }

        localStorage.setItem("Game",JSON.stringify(game));
        setLocalStorage();
    }
}