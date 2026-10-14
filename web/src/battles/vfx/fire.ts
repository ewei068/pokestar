import { tileEffectRecipes } from './recipes';
import { fireRecipes } from './recipes/fire';
import { sharedRecipes } from './recipes/shared';
import { vfxArtwork } from './recipes/artwork';
import type { VfxTile as Tile } from './renderTypes';
type FireTextures = { body: HTMLImageElement; flame: HTMLImageElement; embers: HTMLImageElement[] };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const fade = (value: number) => Math.sin(Math.PI * clamp(value));
const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const columnBase = sharedRecipes.fireColumn.baseY;
const drawFlame = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  x: number, y: number, width: number, height: number, angle: number, alpha: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = clamp(alpha);
  ctx.drawImage(image, -width / 2, -height * .83, width, height);
  ctx.restore();
};

const drawGlow = (ctx: CanvasRenderingContext2D, tile: Tile, time: number, strength: number) => {
  const peak = fade(time);
  if (!peak) return;
  const radius = tile.radius * (0.45 + peak * .6);
  const gradient = ctx.createRadialGradient(tile.x, tile.y, 0, tile.x, tile.y, radius);
  gradient.addColorStop(0, `rgba(255, 243, 142, ${peak * strength})`);
  gradient.addColorStop(.5, `rgba(255, 119, 24, ${peak * strength * .37})`);
  gradient.addColorStop(1, "rgba(255, 80, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(tile.x - radius, tile.y - radius, radius * 2, radius * 2);
};

const drawMainEmber = (ctx: CanvasRenderingContext2D, textures: FireTextures,
  tile: Tile, localMs: number, duration: number) => {
  const recipe = fireRecipes.columnBody;
  {
    const age=clamp(localMs/duration), size=tile.radius*recipe.bodySize;
    ctx.save();ctx.globalAlpha=Math.min(1,age*recipe.fadeInSpeed)*Math.min(1,(1-age)*recipe.fadeOutSpeed)*recipe.opacity;
    ctx.imageSmoothingEnabled=false;
    const image=textures.body;
    ctx.beginPath();ctx.rect(tile.x-size,tile.y-size,size*2,size+tile.radius*columnBase);ctx.clip();
    // Independently deform narrow bands near the tongues; the opaque body anchors the column.
    for(let band=0;band<recipe.bandCount;band++) {
      const sourceY=band*image.naturalHeight/recipe.bandCount;
      const sway=Math.sin(localMs*recipe.swaySpeed+band*recipe.swayPhase)*tile.radius*recipe.swayStrength*(1-band/recipe.bandCount);
      const stretch=1+Math.sin(localMs*recipe.stretchSpeed+band*recipe.stretchPhase)*recipe.stretchStrength;
      ctx.drawImage(image,0,sourceY,image.naturalWidth,image.naturalHeight/recipe.bandCount,
        tile.x-size/2+sway,tile.y-size*.49+band*size/recipe.bandCount*stretch,size,size/recipe.bandCount*stretch+1);
    }
    ctx.restore();
  }

};

const drawForegroundEmbers = (ctx: CanvasRenderingContext2D, textures: FireTextures,
  tile: Tile, ms: number) => {
  const recipe = fireRecipes.foregroundEmbers;
  for (let index = 0; index < recipe.count; index++) {
    const key = tile.seed + index * 107;
    const birth = recipe.startMs + index * recipe.staggerMs + random(key + 3) * recipe.birthJitterMs;
    const life = recipe.lifetimeMs + random(key + 7) * recipe.lifetimeJitterMs;
    const age = (ms - birth) / life;
    if (age < 0 || age > 1) continue;
    const x = tile.x + (random(key + 11) - .5) * tile.radius * recipe.spread +
      (random(key + 13) - .5) * tile.radius * recipe.drift * age;
    const y = tile.y + tile.radius * columnBase - age * tile.radius *
      (recipe.rise + random(key + 17) * recipe.riseJitter);
    const size = tile.radius * (recipe.size + random(key + 19) * recipe.sizeJitter) * (1 - age * .24);
    const sprite = textures.embers[Math.floor(random(key + 23) * textures.embers.length)];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-.35 + (random(key + 29) - .5) * .85);
    ctx.globalAlpha = Math.min(1, age * 8) * Math.pow(1 - age, .64);
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    ctx.fillStyle = "#fff4b1";
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1, size * .09), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

const drawTile = (ctx: CanvasRenderingContext2D, textures: FireTextures,
  tile: Tile, ms: number) => {
  const recipe = tileEffectRecipes["fire-special"];
  const seed = tile.seed;
  const image = textures.flame;
  const offset = random(seed + 3) * recipe.birthJitterMs;
  const localMs = ms - offset;
  if (localMs < 0) return;
  const time = clamp(localMs / (recipe.tileDurationMs - offset));
  {
    drawGlow(ctx, { ...tile, y: tile.y + tile.radius * columnBase }, time, recipe.glowStrength);
    const count = recipe.flameCount + Math.floor(random(seed + 11) * recipe.flameCountJitter);
    for (let index = 0; index < count; index++) {
      const birth = index * recipe.flameStaggerMs + random(seed + index * 97 + 13) * recipe.flameBirthJitterMs;
      const age = (localMs - birth) / recipe.flameLifetimeMs;
      if (age < 0 || age > 1) continue;
      const sway = Math.sin(age * 6 + index * 1.8 + random(seed + 17) * 3) * tile.radius * .12;
      const size = tile.radius * (recipe.flameSize + random(seed + index * 9) * recipe.flameSizeJitter);
      drawFlame(ctx, image, tile.x + sway + (random(seed + index * 3) - .5) * tile.radius * recipe.flameSpread,
        tile.y + tile.radius * columnBase - age * tile.radius * recipe.flameRise,
        size * .62, size, sway / tile.radius * .7, fade(age) * recipe.flameOpacity);
    }
    drawMainEmber(ctx, textures, tile, localMs, recipe.tileDurationMs - offset);
    drawForegroundEmbers(ctx, textures, tile, localMs);
  }
};
export const createFireTileRenderer = () => {
  const imageFor = (url: string) => { const image = new Image(); image.src = url; return image; };
  const textures: FireTextures = { body: imageFor(vfxArtwork.body), flame: imageFor(vfxArtwork.flame),
    embers: [vfxArtwork.coal, vfxArtwork.fleck, vfxArtwork.ember].map(imageFor) };
  const render = (ctx: CanvasRenderingContext2D, tile: Tile, ms: number) => {
    if ([textures.body, textures.flame, ...textures.embers].every(image => image.complete && image.naturalWidth > 0))
      drawTile(ctx, textures, tile, ms);
  };
  return Object.assign(render, { ready: Promise.all([textures.body, textures.flame, ...textures.embers].map(image => image.decode())) });
};
