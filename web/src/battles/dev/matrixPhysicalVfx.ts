/** Focused Physical contact, cuts, falls, and strikes for the matrix review. */
import type { VfxType } from "../vfx/types";
import { active, cut, disk, ease, ellipse, fade, glow, motif, progress,
  random, ring, stroke } from "./matrixVfxKit";
import type { Colors, VfxTile } from "./matrixVfxKit";

type Draw = (ctx: CanvasRenderingContext2D, tile: VfxTile, ms: number, c: Colors) => void;
const particle = (ctx: CanvasRenderingContext2D, tile: VfxTile, ms: number,
  birth: number, duration: number, x: number, y: number, size: number, c: Colors,
  name: "feather" | "rock" | "leaf" | "bolt" | "ice" | "star" | "flame" | "petal") => {
  const age = progress(ms, birth, duration);
  if (!active(age)) return;
  motif(ctx, name, c, tile.x + x * tile.radius, tile.y + y * tile.radius,
    size * tile.radius * (1 - age * .3), age * 2.1, fade(age));
};

const flying: Draw = (ctx, t, ms, c) => {
  const impact = ease(progress(ms, 25, 265));
  motif(ctx, "wing", c, t.x - t.radius * (.25 - impact * .34),
    t.y + t.radius * (-1.25 + impact * 1.27), t.radius * (1.05 + impact * .2),
    -.95 + impact * 1.12, (1 - ease(progress(ms, 440, 210))) * Math.min(1, ms / 55));
  for (let i = 0; i < 9; i++) {
    const a = random(t.seed + i * 31) * Math.PI * 2;
    const age = progress(ms, 235 + i * 26, 340);
    if (!active(age)) continue;
    motif(ctx, "feather", c, t.x + Math.cos(a) * t.radius * (.14 + age * .85),
      t.y - t.radius * .08 + Math.sin(a) * t.radius * age * .58,
      t.radius * (.09 + random(t.seed + i * 7) * .07), a + age * 2, fade(age));
  }
};

const ground: Draw = (ctx, t, ms, c) => {
  const grow = ease(progress(ms, 85, 290));
  if (grow > 0) {
    glow(ctx, t.x, t.y + t.radius * .18, t.radius * .93, c.main, fade(progress(ms, 70, 610)) * .22);
    for (let i = 0; i < 3; i++) {
      const age = progress(ms, 125 + i * 84, 400);
      if (active(age)) ring(ctx, t.x, t.y + t.radius * .13, t.radius * (.14 + age * .93),
        t.radius * (.095 - age * .035), c.dark, fade(age) * .6);
    }
    const main = [t.x-t.radius*.76*grow,t.y-t.radius*.34*grow,
      t.x-t.radius*.3*grow,t.y-t.radius*.08*grow,t.x-t.radius*.2*grow,t.y+t.radius*.27*grow,
      t.x+t.radius*.16*grow,t.y+t.radius*.14*grow,t.x+t.radius*.4*grow,t.y+t.radius*.56*grow,
      t.x+t.radius*.87*grow,t.y+t.radius*.7*grow];
    stroke(ctx, main, Math.max(2, t.radius * .13), c.dark, .9);
    stroke(ctx, main, Math.max(1, t.radius * .035), c.light, .68);
    stroke(ctx, [t.x-t.radius*.2*grow,t.y+t.radius*.27*grow,
      t.x-t.radius*.55*grow,t.y+t.radius*.63*grow,t.x-t.radius*.72*grow,t.y+t.radius*.67*grow],
    Math.max(1.5,t.radius*.07),c.dark,.8);
    stroke(ctx, [t.x+t.radius*.16*grow,t.y+t.radius*.14*grow,
      t.x+t.radius*.45*grow,t.y-t.radius*.17*grow,t.x+t.radius*.6*grow,t.y-t.radius*.2*grow],
    Math.max(1.5,t.radius*.07),c.dark,.8);
  }
};

const rock: Draw = (ctx, t, ms, c) => {
  for (let i = 0; i < 6; i++) {
    const seed = t.seed + i * 47;
    const birth = 25 + i * 39 + random(seed) * 40;
    const age = progress(ms, birth, 290);
    if (!active(age)) continue;
    const x = t.x + (random(seed + 2) - .5) * t.radius * 1.55;
    const landing = t.y + t.radius * (.36 + random(seed + 3) * .33);
    const fall = ease(age / .72);
    const bounce = age > .72 ? Math.sin((age - .72) / .28 * Math.PI) * t.radius * .2 : 0;
    motif(ctx,"rock",c,x,landing - t.radius * 1.85 * (1 - fall) - bounce,
      t.radius * (.23 + random(seed + 4) * .22), (random(seed + 5)-.5)*.7, fade(age));
    if (age > .68) for (let j = 0; j < 3; j++) {
      const shardAge = (age - .68) / .32;
      const a = (j / 3 + random(seed + j + 8) * .13) * Math.PI * 2;
      motif(ctx,"rock",c,x + Math.cos(a)*t.radius*.36*shardAge,
        landing + Math.sin(a)*t.radius*.18*shardAge,t.radius*.07,a,fade(shardAge)*.7);
    }
  }
};

const bug: Draw = (ctx, t, ms, c) => {
  for (let i = 0; i < 2; i++) {
    const age = progress(ms, 45 + i * 145, 320);
    if (!active(age)) continue;
    const sign = i ? -1 : 1;
    const start: [number,number] = [-.8*sign,-.85];
    const mid: [number,number] = [.03*sign,-.17];
    const end: [number,number] = [.75*sign,.86];
    cut(ctx,t,start,mid,end,.13,c.dark,fade(age),ease(age));
    cut(ctx,t,start,mid,end,.075,c.light,fade(age),ease(age));
  }
  for (let i = 0; i < 6; i++) {
    const a = i*2.4 + random(t.seed+i*4);
    particle(ctx,t,ms,190+i*31,290,Math.cos(a)*.57,Math.sin(a)*.48,.08,c,"leaf");
  }
};

const ghost: Draw = (ctx, t, ms, c) => {
  const fog = fade(progress(ms, 0, 640));
  for (let i = 0; i < 5; i++) {
    const x = t.x + t.radius * ((i-2)*.33 + Math.sin(ms/180+i)*.18);
    ellipse(ctx,x,t.y+t.radius*(.17+Math.sin(i*2)*.16),t.radius*.44,t.radius*.23,
      i%2?c.main:c.dark,fog*.3);
  }
  const age = progress(ms, 220, 310);
  if (active(age)) {
    cut(ctx,t,[-.94,.71],[-.09,-.72],[.96,-.7],.2,c.dark,fade(age),ease(age));
    cut(ctx,t,[-.94,.71],[-.09,-.72],[.96,-.7],.095,c.light,fade(age),ease(age));
  }
  for (let i = 0; i < 7; i++) {
    const age = progress(ms,315+i*18,330);
    if (!active(age)) continue;
    const dir = i%2?-1:1;
    ellipse(ctx,t.x+dir*t.radius*(.18+age*.88),t.y+t.radius*(random(t.seed+i*23)-.5),
      t.radius*.2*(1-age*.5),t.radius*.09,c.main,fade(age)*.36);
  }
};

const steel: Draw = (ctx, t, ms, c) => {
  for (let i = 0; i < 5; i++) {
    const seed = t.seed + i * 41;
    const age = progress(ms, 25 + i * 60, 390);
    if (age < 0) continue;
    const land = ease(age / .62);
    const x = t.x + (i-2)*t.radius*.32 + (random(seed)-.5)*t.radius*.13;
    const y = t.y + t.radius*(.34-1.8*(1-land));
    motif(ctx,"beam",c,x,y,t.radius*(.26+random(seed+2)*.08),
      (random(seed+3)-.5)*.2,1-ease(progress(ms,650,110)));
    if (age > .59 && age < 1) {
      const dust = (age-.59)/.41;
      disk(ctx,x+(i%2?-1:1)*t.radius*dust*.37,t.y+t.radius*.66,
        t.radius*.07*(1-dust),c.light,fade(dust)*.55);
    }
  }
};

const fire: Draw = (ctx, t, ms, c) => {
  const age = progress(ms, 25, 440);
  if (active(age)) {
    const fall = ease(age / .62);
    const y = t.y + t.radius * (-1.5 + 1.7 * fall);
    glow(ctx,t.x,y,t.radius*.58,c.main,.22*fade(age));
    motif(ctx,"rock",{main:"#bd5538",light:"#ffbf65",dark:c.dark},t.x,y,
      t.radius*.52,age*.65,1-ease(progress(ms,380,190)));
    motif(ctx,"flame",c,t.x-t.radius*.11,y-t.radius*.2,t.radius*.27,-.16,
      fade(age)*.85);
  }
  for (let i = 0; i < 13; i++) {
    const seed = t.seed + i * 73;
    const birth = 250 + random(seed)*160;
    const a = progress(ms,birth,260+random(seed+2)*130);
    if (!active(a)) continue;
    const x = t.x + (random(seed+3)-.5)*t.radius*1.65 + (a-.4)*t.radius*.26;
    const y = t.y + t.radius*(.28-a*(.3+random(seed+4)*.68));
    motif(ctx,"flame",c,x,y,t.radius*(.08+random(seed+5)*.08),
      (random(seed+6)-.5)*.5,fade(a));
  }
};

const water: Draw = (ctx, t, ms, c) => {
  const hit = progress(ms, 75, 500);
  if (active(hit)) {
    glow(ctx,t.x,t.y,t.radius*.8,c.main,fade(hit)*.18);
    ring(ctx,t.x,t.y,t.radius*(.14+hit*.88),t.radius*(.12-hit*.06),c.dark,fade(hit)*.75);
    ring(ctx,t.x,t.y,t.radius*(.09+hit*.79),t.radius*.035,c.light,fade(hit)*.8);
  }
  for (let i = 0; i < 15; i++) {
    const seed = t.seed + i*53;
    const age = progress(ms,155+random(seed)*165,260+random(seed+2)*160);
    if (!active(age)) continue;
    const a = random(seed+3)*Math.PI*2;
    const distance = t.radius*(.15+age*(.67+random(seed+4)*.36));
    disk(ctx,t.x+Math.cos(a)*distance,t.y+Math.sin(a)*distance*.8,
      t.radius*(.035+random(seed+5)*.07)*(1-age*.3),c.light,fade(age)*.95);
    ring(ctx,t.x+Math.cos(a)*distance,t.y+Math.sin(a)*distance*.8,
      t.radius*(.035+random(seed+5)*.07)*(1-age*.3),1,c.dark,fade(age)*.7);
  }
};

const grass: Draw = (ctx, t, ms, c) => {
  for (let i = 0; i < 21; i++) {
    const seed = t.seed + i*79;
    const birth = 15 + i*20 + random(seed)*65;
    const age = progress(ms,birth,230+random(seed+2)*150);
    if (!active(age)) continue;
    const lane = (random(seed+3)-.5)*1.45;
    const x = t.x + t.radius*(-1.25+age*2.5);
    const y = t.y + t.radius*(lane + Math.sin(age*7+i)*.13);
    motif(ctx,"leaf",c,x,y,t.radius*(.105+random(seed+4)*.11),
      -.55+age*.7+random(seed+5)*.6,fade(age));
  }
};

const electric: Draw = (ctx, t, ms, c) => {
  for (let p = 0; p < 3; p++) {
    const age = progress(ms,110+p*125,330);
    if (active(age)) ring(ctx,t.x,t.y,t.radius*(.14+age*.9),
      t.radius*(.11-age*.05),p%2?c.main:c.light,fade(age)*.78);
  }
  for (let i = 0; i < 13; i++) {
    const seed = t.seed+i*43;
    const age = progress(ms,150+random(seed)*160,230+random(seed+2)*110);
    if (!active(age)) continue;
    const angle = random(seed+3)*Math.PI*2;
    const dist = t.radius*(.13+age*.94);
    motif(ctx,"bolt",c,t.x+Math.cos(angle)*dist,t.y+Math.sin(angle)*dist*.8,
      t.radius*(.09+random(seed+4)*.13),angle+.65,fade(age));
  }
};

const psychic: Draw = (ctx, t, ms, c) => {
  const hold = 1-ease(progress(ms,440,220));
  motif(ctx,"brain",c,t.x,t.y,t.radius*.56,0,Math.min(1,ms/95)*hold);
  const age = progress(ms,170,340);
  if (active(age)) {
    cut(ctx,t,[-.9,-.7],[.07,-.2],[.85,.79],.2,c.dark,fade(age),ease(age));
    cut(ctx,t,[-.9,-.7],[.07,-.2],[.85,.79],.1,c.light,fade(age),ease(age));
    glow(ctx,t.x,t.y,t.radius*.85,c.light,fade(age)*.14);
  }
  for (let i = 0; i < 5; i++) {
    const a = i*Math.PI*2/5 + random(t.seed+i)*.3;
    particle(ctx,t,ms,310+i*35,280,Math.cos(a)*.65,Math.sin(a)*.55,.07,c,"petal");
  }
};

const ice: Draw = (ctx, t, ms, c) => {
  for (let i = 0; i < 8; i++) {
    const seed = t.seed+i*61;
    const age = progress(ms,10+i*40+random(seed)*35,310);
    if (!active(age)) continue;
    const x = t.x + (random(seed+2)-.5)*t.radius*1.65;
    const land = ease(age/.77);
    const y = t.y + t.radius*(.48-1.85*(1-land));
    motif(ctx,"ice",c,x,y,t.radius*(.15+random(seed+3)*.2),
      (random(seed+4)-.5)*.6,fade(age));
    if (age>.75) for (let j=0;j<3;j++) {
      const a = j*2.3+random(seed+j+6);
      motif(ctx,"ice",c,x+Math.cos(a)*t.radius*.25*(age-.75)*4,
        y+Math.sin(a)*t.radius*.19*(age-.75)*4,t.radius*.045,a,
        fade((age-.75)*4)*.75);
    }
  }
};

const dark: Draw = (ctx, t, ms, c) => {
  glow(ctx,t.x,t.y,t.radius*1.1,c.dark,fade(progress(ms,0,760))*.24);
  for (let i = 0; i < 6; i++) {
    const seed = t.seed+i*41;
    const age = progress(ms,35+i*82+random(seed)*40,280);
    if (!active(age)) continue;
    const angle = i*Math.PI*.63+random(seed+2)*.4;
    const cx = Math.cos(angle)*.36;
    const cy = Math.sin(angle)*.28;
    const dx = Math.cos(angle+1.4)*(.4+random(seed+3)*.38);
    const dy = Math.sin(angle+1.4)*(.4+random(seed+3)*.38);
    const start: [number,number] = [cx-dx,cy-dy];
    const end: [number,number] = [cx+dx,cy+dy];
    const control: [number,number] = [cx+.15*Math.sin(angle),cy-.15*Math.cos(angle)];
    cut(ctx,t,start,control,end,.1+random(seed+4)*.07,c.dark,fade(age),ease(age));
    cut(ctx,t,start,control,end,.04,c.light,fade(age)*.55,ease(age));
  }
};

const fairy: Draw = (ctx, t, ms, c) => {
  const impact = progress(ms,90,460);
  if (active(impact)) {
    glow(ctx,t.x,t.y,t.radius*.72,c.main,fade(impact)*.16);
    ring(ctx,t.x,t.y,t.radius*(.11+impact*.83),t.radius*.04,c.light,fade(impact)*.55);
  }
  const strike=progress(ms,145,310);
  if(active(strike)) {
    motif(ctx,"star",c,t.x,t.y,t.radius*(.18+.44*ease(strike/.43)),
      .23,fade(strike)*.85);
    for(let i=0;i<6;i++) {
      const a=i*Math.PI/3+.18;
      stroke(ctx,[t.x+Math.cos(a)*t.radius*.29,t.y+Math.sin(a)*t.radius*.29,
        t.x+Math.cos(a)*t.radius*(.41+strike*.43),
        t.y+Math.sin(a)*t.radius*(.41+strike*.43)],
      t.radius*(.045-strike*.015),c.light,fade(strike)*.65);
    }
  }
  for (let i = 0; i < 9; i++) {
    const seed = t.seed+i*73;
    const age = progress(ms,45+i*48,270);
    if (!active(age)) continue;
    const a = random(seed)*Math.PI*2;
    const dist = t.radius*(.18+age*(.4+random(seed+2)*.54));
    motif(ctx,"star",c,t.x+Math.cos(a)*dist,t.y+Math.sin(a)*dist,
      t.radius*(.1+random(seed+3)*.17)*(1-age*.3),a+age*.25,fade(age));
  }
};

const effects: Partial<Record<VfxType, Draw>> = {
  flying, ground, rock, bug, ghost, steel, fire, water, grass, electric,
  psychic, ice, dark, fairy,
};

export const drawPhysicalTile = (ctx: CanvasRenderingContext2D,
  type: VfxType, tile: VfxTile, ms: number, colors: Colors): boolean => {
  const draw = effects[type];
  if (!draw) return false;
  draw(ctx,tile,ms,colors);
  return true;
};
