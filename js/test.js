const app = new PIXI.Application({
    width:300,
    height:300
});

document.body.append(app.view);
let source = null;

PIXI.Assets.load(assets.tiles.lavaDark.source)
  .then(result => {
    assets.tiles.lavaDark.texture = result;
    console.log(assets.tiles.lavaDark.texture);
  })
  .catch(err => console.log(err));
