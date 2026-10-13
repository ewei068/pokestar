/** Secondary motion and texture for the ten review-directed Special sequences. */
import type { VfxType } from "../vfx/types";
import { active, disk, ease, ellipse, fade, glint, glow, motif, progress,
  random, ring, stroke } from "./matrixVfxKit";
import type { Colors, VfxTile } from "./matrixVfxKit";

type Layer = "back" | "front";
type Draw = (ctx: CanvasRenderingContext2D, t: VfxTile, ms: number, c: Colors, layer: Layer) => void;

const flying: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    for(let i=0;i<6;i++) {
      const age=progress(ms,60+i*67,365);
      if(!active(age))continue;
      const y=t.y+t.radius*((i-2.5)*.19+Math.sin(age*5+i)*.08);
      stroke(ctx,[t.x+t.radius*(-1.2+age*1.9),y,
        t.x+t.radius*(-.53+age*1.9),y-t.radius*.18],
        t.radius*.025,c.light,fade(age)*.28);
    }
  } else for(let i=0;i<12;i++) {
    const seed=t.seed+i*43;
    const age=progress(ms,155+i*30,300);
    if(!active(age))continue;
    const x=t.x+t.radius*(-.83+age*1.8);
    const y=t.y+t.radius*((random(seed)-.5)*1.17);
    glint(ctx,x,y,t.radius*.025,c.light,fade(age)*.5);
  }
};

const ground: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y+t.radius*.43,t.radius*.96,c.main,
      fade(progress(ms,75,630))*.16);
    return;
  }
  for(let i=0;i<18;i++) {
    const seed=t.seed+i*59;
    const age=progress(ms,155+random(seed)*255,240+random(seed+2)*140);
    if(!active(age))continue;
    const x=t.x+t.radius*(random(seed+3)-.5)*1.75;
    const y=t.y+t.radius*(.4-age*(.52+random(seed+4)*.75));
    disk(ctx,x,y,t.radius*(.026+random(seed+5)*.06),
      i%3?c.main:c.light,fade(age)*.66);
  }
};

const rock: Draw = (ctx,t,ms,c,layer) => {
  const reveal=fade(progress(ms,10,650));
  if(layer==="back") {
    ring(ctx,t.x,t.y,t.radius*.76,t.radius*.025,c.light,reveal*.3);
    return;
  }
  for(let i=0;i<7;i++) {
    const seed=t.seed+i*71;
    const angle=i*Math.PI*2/7+random(seed)*.25;
    const x=t.x+Math.cos(angle)*t.radius*.79;
    const y=t.y+Math.sin(angle)*t.radius*.59;
    const alpha=reveal*(1-ease(progress(ms,355,180)));
    if(alpha<=0)continue;
    stroke(ctx,[x-t.radius*.06,y,x+t.radius*.06,y],
      t.radius*.02,c.light,alpha*.65);
    glint(ctx,x+t.radius*.09,y-t.radius*.1,t.radius*.035,c.light,alpha*.65);
  }
  const impact=progress(ms,510,200);
  if(active(impact))ring(ctx,t.x,t.y,t.radius*(.12+impact*.64),
    t.radius*.025,c.light,fade(impact)*.45);
};

const ghost: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y,t.radius*.97,c.dark,
      fade(progress(ms,55,680))*.15);
    return;
  }
  const swirl=progress(ms,195,360);
  if(active(swirl)) {
    ctx.save();ctx.globalAlpha=fade(swirl)*.57;ctx.strokeStyle=c.light;
    ctx.lineWidth=t.radius*.035;
    ctx.beginPath();ctx.arc(t.x,t.y,t.radius*(.16+swirl*.27),
      ms/180,ms/180+Math.PI*1.2);ctx.stroke();ctx.restore();
    for(let i=0;i<7;i++) {
      const a=i*2.4+ms/160;
      disk(ctx,t.x+Math.cos(a)*t.radius*(.24+swirl*.19),
        t.y+Math.sin(a)*t.radius*(.24+swirl*.19),
        t.radius*.023,c.light,fade(swirl)*.64);
    }
  }
  const burst=progress(ms,520,220);
  if(active(burst))for(let i=0;i<11;i++) {
    const seed=t.seed+i*31;
    const a=random(seed)*Math.PI*2;
    stroke(ctx,[t.x+Math.cos(a)*t.radius*(.18+burst*.48),
      t.y+Math.sin(a)*t.radius*(.18+burst*.48),
      t.x+Math.cos(a)*t.radius*(.31+burst*.73),
      t.y+Math.sin(a)*t.radius*(.31+burst*.73)],
      t.radius*.025,c.light,fade(burst)*.5);
  }
};

const water: Draw = (ctx,t,ms,c,layer) => {
  const lift=ease(progress(ms,60,290));
  if(layer==="back") {
    ellipse(ctx,t.x,t.y+t.radius*.68,t.radius*.95,t.radius*.13,
      c.dark,fade(progress(ms,25,705))*.19);
    return;
  }
  for(let i=0;i<20;i++) {
    const seed=t.seed+i*47;
    const age=progress(ms,245+random(seed)*235,230+random(seed+2)*110);
    if(!active(age))continue;
    const x=t.x+(random(seed+3)-.5)*t.radius*1.96;
    const y=t.y+t.radius*(.42-lift*.96-age*.34);
    disk(ctx,x,y,t.radius*(.018+random(seed+4)*.032),
      c.light,fade(age)*.64);
  }
  for(let i=0;i<5;i++) {
    const age=progress(ms,325+i*47,300);
    if(!active(age))continue;
    const x=t.x+t.radius*((i-2)*.34);
    ctx.save();ctx.globalAlpha=fade(age)*.45;ctx.strokeStyle=c.light;
    ctx.lineWidth=t.radius*.025;ctx.beginPath();
    ctx.arc(x,t.y+t.radius*.35,t.radius*(.09+age*.11),Math.PI*1.05,Math.PI*1.9);
    ctx.stroke();ctx.restore();
  }
};

const grass: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    const pulse=fade(progress(ms,90,580));
    glow(ctx,t.x,t.y,t.radius*.85,c.light,pulse*.15);
    return;
  }
  for(let i=0;i<18;i++) {
    const seed=t.seed+i*37;
    const age=progress(ms,85+i*25,320);
    if(!active(age))continue;
    const turn=age*5+i*2.4;
    const radius=t.radius*(.15+age*.44);
    const x=t.x+Math.cos(turn)*radius;
    const y=t.y+t.radius*(.8-age*1.6);
    glint(ctx,x,y,t.radius*(.022+random(seed)*.018),c.light,fade(age)*.58);
    stroke(ctx,[x,y+t.radius*.1,x-Math.sin(turn)*t.radius*.08,y],
      t.radius*.018,c.light,fade(age)*.45);
  }
};

const electric: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y,t.radius*.87,c.light,
      (fade(progress(ms,75,390))+fade(progress(ms,390,310)))*.14);
    return;
  }
  for(let i=0;i<12;i++) {
    const seed=t.seed+i*41;
    const age=progress(ms,195+random(seed)*270,170);
    if(!active(age))continue;
    const x=t.x+(random(seed+2)-.5)*t.radius*1.4;
    const y=t.y+t.radius*(random(seed+3)-.5)*1.15;
    stroke(ctx,[x,y,x+t.radius*.09,y-t.radius*.08,
      x+t.radius*.02,y-t.radius*.14],t.radius*.028,
      i%3?c.light:c.main,fade(age)*.7);
  }
};

const psychic: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y,t.radius*1.08,c.main,
      fade(progress(ms,50,650))*.13);
    return;
  }
  for(let p=0;p<4;p++) {
    const age=progress(ms,110+p*128,360);
    if(!active(age))continue;
    const r=t.radius*(.17+age*.89);
    ctx.save();ctx.globalAlpha=fade(age)*.32;ctx.strokeStyle=c.light;
    ctx.lineWidth=t.radius*.018;ctx.beginPath();
    for(let i=0;i<=36;i++) {
      const a=i*Math.PI*2/36;
      const wave=1+.11*Math.sin(a*8-ms/70+p);
      const x=t.x+Math.cos(a)*r*wave;
      const y=t.y+Math.sin(a)*r*.78*wave;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.stroke();ctx.restore();
  }
};

const dragon: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    for(let i=0;i<4;i++) {
      const age=progress(ms,60+i*75,470);
      if(!active(age))continue;
      ellipse(ctx,t.x+t.radius*Math.sin(age*5+i)*.43,
        t.y+t.radius*(.7-age*1.35),t.radius*(.18+age*.12),
        t.radius*.08,i%2?c.main:c.dark,fade(age)*.25);
    }
  } else for(let i=0;i<15;i++) {
    const seed=t.seed+i*57;
    const age=progress(ms,130+i*27,280);
    if(!active(age))continue;
    const a=i*2.4+age*3;
    const x=t.x+Math.cos(a)*t.radius*(.13+age*.64);
    const y=t.y+t.radius*(.56-age*1.18);
    glint(ctx,x,y,t.radius*(.025+random(seed)*.022),
      i%3?c.light:"#7aa4dc",fade(age)*.63);
  }
};

const fairy: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y,t.radius*.96,c.main,
      fade(progress(ms,70,600))*.13);
    return;
  }
  for(let i=0;i<19;i++) {
    const seed=t.seed+i*43;
    const age=progress(ms,105+i*22,270+random(seed)*80);
    if(!active(age))continue;
    const a=i*2.4+age*3.2;
    const r=t.radius*(.21+age*.72);
    const x=t.x+Math.cos(a)*r;
    const y=t.y+Math.sin(a)*r*.78;
    if(i%4===0)motif(ctx,"star",c,x,y,t.radius*.047,a,fade(age)*.77);
    else disk(ctx,x,y,t.radius*(.017+random(seed+2)*.02),c.light,fade(age)*.75);
  }
};

const effects: Partial<Record<VfxType,Draw>> = {
  flying, ground, rock, ghost, water, grass, electric, psychic, dragon, fairy,
};

export const polishSpecialTile = (ctx: CanvasRenderingContext2D,
  type: VfxType, tile: VfxTile, ms: number, colors: Colors, layer: Layer) => {
  effects[type]?.(ctx,tile,ms,colors,layer);
};
