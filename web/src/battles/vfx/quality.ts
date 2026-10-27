import { tileEffectRecipes } from './recipes';
import { qualityRecipes } from './recipes/quality';
import { vfxArtwork } from './recipes/artwork';
import type { VfxTile as Tile } from './renderTypes';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const fade = (value: number) => Math.sin(Math.PI * clamp(value));
const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
type FairySprites = { main: HTMLImageElement; glint: HTMLImageElement; pearl: HTMLImageElement };
const drawRing = (ctx: CanvasRenderingContext2D, tile: Tile, radius: number,
  opacity: number, color: string, width: number, squash = .72) => {
  ctx.save();
  ctx.globalAlpha = clamp(opacity);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.ellipse(tile.x, tile.y, radius, radius * squash, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const drawPressureCircles = (ctx: CanvasRenderingContext2D, tile: Tile,
  ms: number, count: number) => {
  const recipe = qualityRecipes.pressureCircles;
  for (let index = 0; index < count; index++) {
    const key = tile.seed + index * 73;
    const age = (ms - index * recipe.staggerMs - random(key + 3) * recipe.birthJitterMs) / recipe.lifetimeMs;
    if (age < 0 || age > 1) continue;
    const radius = tile.radius * (recipe.startRadius + age * recipe.growth + random(key + 7) * recipe.radiusJitter);
    const opacity = fade(age) * (index === 0 ? recipe.firstOpacity : recipe.laterOpacity);
    drawRing(ctx, tile, radius, opacity * .7, recipe.outlineColor,
      Math.max(2, tile.radius * recipe.outlineWidth), 1);
    drawRing(ctx, tile, radius, opacity, index % 2 ? recipe.oddColor : recipe.evenColor,
      Math.max(1.2, tile.radius * recipe.innerWidth), 1);
  }
};

const drawSpriteImpact = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  tile: Tile, ms: number) => {
  const recipe = tileEffectRecipes["normal-physical"];
  drawPressureCircles(ctx, tile, ms, recipe.pressureCount);
  // A radial burst: compact at contact, then each segment shoots outward and grows.
  for (let piece = 0; piece < recipe.arcCount; piece++) {
    const key=tile.seed+piece*137;
    const age=(ms-recipe.startMs-piece*recipe.staggerMs-random(key+7)*recipe.birthJitterMs)/recipe.lifetimeMs;
    if(age<0||age>1)continue;
    const travel=1-Math.pow(1-age,recipe.travelEasePower);
    const distance=tile.radius*(recipe.startRadius+travel*(recipe.travel+random(key+3)*recipe.travelJitter));
    const size=tile.radius*(recipe.startSize+travel*(recipe.growth+random(key)*recipe.growthJitter));
    const halfArc=(recipe.minArcDegrees+random(key+5)*recipe.arcDegreesJitter)*Math.PI/360;
    ctx.save();ctx.translate(tile.x,tile.y);ctx.scale(1,recipe.aspect);
    ctx.rotate(piece*Math.PI*2/recipe.arcCount+(random(key+2)-.5)*recipe.angleJitter);
    // Radial traces follow the arc tips; their tails clear as the burst leaves the center.
    ctx.globalAlpha=Math.min(1,age*12)*Math.pow(1-age,recipe.traceFadePower)*recipe.traceOpacity;
    ctx.strokeStyle="#d8e9f3";ctx.lineWidth=Math.max(.7,tile.radius*.022);
    for(const angle of [-halfArc*.7,0,halfArc*.7]) {
      const head=distance+size*.25,tail=Math.max(.035*tile.radius,head-tile.radius*.2*Math.sin(age*Math.PI));
      ctx.beginPath();ctx.moveTo(-Math.cos(angle)*tail,Math.sin(angle)*tail);
      ctx.lineTo(-Math.cos(angle)*head,Math.sin(angle)*head);ctx.stroke();
    }
    ctx.translate(-distance,0);
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,size,Math.PI-halfArc,Math.PI+halfArc);ctx.closePath();ctx.clip();
    ctx.globalAlpha=Math.min(1,age*recipe.fadeInSpeed)*Math.min(1,(1-age)/recipe.fadeOutPortion)*recipe.opacity;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(image,-size*.65,-size*.52,size,size);ctx.restore();
  }
};

const drawMote = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  x: number, y: number, size: number, angle: number, opacity: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = clamp(opacity);
  ctx.drawImage(image, -size / 2, -size / 2, size, size);
  ctx.restore();
};

const drawFairyGlow = (ctx: CanvasRenderingContext2D, tile: Tile, time: number) => {
  const strength = fade(time) * .26;
  if (!strength) return;
  const radius = tile.radius * 1.05;
  const gradient = ctx.createRadialGradient(tile.x, tile.y, 0, tile.x, tile.y, radius);
  gradient.addColorStop(0, `rgba(255, 246, 255, ${strength})`);
  gradient.addColorStop(.6, `rgba(225, 171, 250, ${strength * .44})`);
  gradient.addColorStop(1, "rgba(225, 171, 250, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(tile.x - radius, tile.y - radius, radius * 2, radius * 2);
};

const drawFairyOutwardMotes = (ctx: CanvasRenderingContext2D, sprites: FairySprites,
  tile: Tile, ms: number, count: number) => {
  const recipe = qualityRecipes.outwardMotes;
  for (let index = 0; index < count; index++) {
    const key = tile.seed + index * 131;
    const birth = recipe.startMs + index * recipe.staggerMs + random(key + 3) * recipe.birthJitterMs;
    const life = recipe.lifetimeMs + random(key + 7) * recipe.lifetimeJitterMs;
    const age = (ms - birth) / life;
    if (age < 0 || age > 1) continue;
    const angle = random(key + 11) * Math.PI * 2;
    const radius = tile.radius * (recipe.startRadius + age * (recipe.travel + random(key + 17) * recipe.travelJitter));
    const sprite = index % 6 === 0 ? sprites.main : index % 2 ? sprites.glint : sprites.pearl;
    const size = tile.radius * (index % 6 === 0 ? recipe.mainSize : recipe.smallSize + random(key + 23) * recipe.smallSizeJitter);
    drawMote(ctx, sprite, tile.x + Math.cos(angle) * radius,
      tile.y + Math.sin(angle) * radius * .75 - age * tile.radius * .12,
      size, (random(key + 29) - .5) * .7 + age * .35,
      Math.min(1, age * 9) * Math.pow(1 - age, .65) * recipe.opacity);
  }
};

const drawFairyStatus = (ctx: CanvasRenderingContext2D, sprites: FairySprites,
  tile: Tile, ms: number) => {
  const recipe = tileEffectRecipes["fairy-status"];
  const r = tile.radius;
  drawFairyGlow(ctx, tile, ms / recipe.glowDurationMs);
  {
    for (let pulse = 0; pulse < recipe.pulseCount; pulse++) {
      const age = (ms - pulse * recipe.pulseStaggerMs) / (pulse ? recipe.laterPulseLifetimeMs : recipe.firstPulseLifetimeMs);
      if (age < 0 || age > 1) continue;
      drawRing(ctx, tile, r * (recipe.startRadius + age * recipe.radiusGrowth), fade(age) * (pulse ? recipe.laterPulseOpacity : recipe.firstPulseOpacity),
        "#f4b7f2", Math.max(1.5, r * .055), recipe.ringAspect);
      drawRing(ctx, tile, r * (recipe.innerRadius + age * recipe.innerGrowth), fade(age) * recipe.innerOpacity,
        "#bbf7ff", Math.max(1, r * .03), recipe.ringAspect);
    }
  }
  drawFairyOutwardMotes(ctx, sprites, tile, ms, recipe.moteCount);
};
export const createQualityTileRenderer = (effect: 'normal-physical' | 'fairy-status') => {
  const urls = effect === 'normal-physical' ? [vfxArtwork.pixelImpact] :
    [vfxArtwork.fairy, vfxArtwork.fairyGlint, vfxArtwork.fairyPearl];
  const images = urls.map(url => { const image = new Image(); image.src = url; return image; });
  const render = (ctx: CanvasRenderingContext2D, tile: Tile, ms: number) => {
    if (!images.every(image => image.complete && image.naturalWidth > 0)) return;
    if (effect === 'normal-physical') drawSpriteImpact(ctx, images[0], tile, ms);
    else drawFairyStatus(ctx, { main: images[0], glint: images[1], pearl: images[2] }, tile, ms);
  };
  return Object.assign(render, { ready: Promise.all(images.map(image => image.decode())) });
};
