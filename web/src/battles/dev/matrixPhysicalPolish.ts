/** Material details layered around the 14 review-directed Physical sequences. */
import type { VfxType } from "../vfx/types";
import { active, disk, ease, ellipse, fade, glint, glow, motif, progress, random, ring, stroke } from "./matrixVfxKit";
import type { Colors, VfxTile } from "./matrixVfxKit";

type Layer = "back" | "front";
type Draw = (ctx: CanvasRenderingContext2D, t: VfxTile, ms: number, c: Colors, layer: Layer) => void;

const flying: Draw = (ctx,t,ms,c,layer) => {
  const age=progress(ms,105,365);
  if(!active(age))return;
  if(layer==="back") {
    for(let i=0;i<4;i++) {
      const y=t.y+t.radius*(i*.23-.32);
      stroke(ctx,[t.x-t.radius*(1.05-age*.58),y,
        t.x+t.radius*(.15+age*.7),y-t.radius*.25],
        t.radius*(.06-i*.009),c.light,fade(age)*.3);
    }
  } else {
    for(let i=0;i<7;i++) {
      const seed=t.seed+i*47;
      const p=progress(ms,210+i*28,270);
      if(!active(p))continue;
      const x=t.x+t.radius*((random(seed)-.5)*.9+p*.72);
      const y=t.y+t.radius*((random(seed+2)-.5)*.75-p*.31);
      glint(ctx,x,y,t.radius*(.035+random(seed+3)*.035),c.light,fade(p)*.72);
    }
  }
};

const ground: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    for(let i=0;i<7;i++) {
      const seed=t.seed+i*53;
      const age=progress(ms,135+i*38,420);
      if(!active(age))continue;
      const x=t.x+t.radius*(random(seed)-.5)*1.8;
      const y=t.y+t.radius*(.31-age*.44);
      ellipse(ctx,x,y,t.radius*(.14+age*.24),t.radius*(.06+age*.1),
        i%2?c.main:c.dark,fade(age)*.18);
    }
  } else for(let i=0;i<11;i++) {
    const seed=t.seed+i*67;
    const age=progress(ms,205+random(seed)*95,270);
    if(!active(age))continue;
    const a=random(seed+2)*Math.PI*2;
    motif(ctx,"rock",c,t.x+Math.cos(a)*t.radius*(.12+age*.76),
      t.y+t.radius*.16+Math.sin(a)*t.radius*age*.37,
      t.radius*(.04+random(seed+3)*.045),a,fade(age)*.65);
  }
};

const rock: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    const age=ease(progress(ms,145,250));
    ellipse(ctx,t.x,t.y+t.radius*.64,t.radius*(.21+age*.69),
      t.radius*.13,c.dark,age*.16);
  } else for(let i=0;i<8;i++) {
    const seed=t.seed+i*59;
    const p=progress(ms,235+i*38,250);
    if(!active(p))continue;
    const a=random(seed)*Math.PI*2;
    const r=t.radius*(.18+p*.65);
    motif(ctx,"rock",{main:c.light,light:"#fff9e9",dark:c.main},
      t.x+Math.cos(a)*r,t.y+t.radius*.43+Math.sin(a)*r*.33,
      t.radius*(.028+random(seed+2)*.045),a+p,fade(p)*.7);
  }
};

const bug: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  for(let i=0;i<2;i++) {
    const age=progress(ms,85+i*145,300);
    if(!active(age))continue;
    const side=i?-1:1;
    stroke(ctx,[t.x-t.radius*.56*side,t.y-t.radius*.52,
      t.x+t.radius*.49*side,t.y+t.radius*.49],
      t.radius*.025,c.light,fade(age)*.45);
    if(age>.36)glint(ctx,t.x,t.y-t.radius*.04,t.radius*.16,c.light,
      fade((age-.36)/.64)*.86);
  }
  for(let i=0;i<6;i++) {
    const seed=t.seed+i*37;
    const age=progress(ms,180+i*32,220);
    if(!active(age))continue;
    disk(ctx,t.x+(random(seed)-.5)*t.radius*1.6,
      t.y+(random(seed+2)-.5)*t.radius*1.3,
      t.radius*.022,c.light,fade(age)*.65);
  }
};

const ghost: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y,t.radius*.9,c.main,fade(progress(ms,40,650))*.14);
    return;
  }
  for(let i=0;i<9;i++) {
    const seed=t.seed+i*71;
    const age=progress(ms,275+i*27,330);
    if(!active(age))continue;
    const side=i%2?-1:1;
    const x=t.x+t.radius*side*(.2+age*.95);
    const y=t.y+t.radius*((random(seed)-.5)*.7-age*.17);
    ellipse(ctx,x,y,t.radius*(.09+random(seed+2)*.09)*(1-age*.5),
      t.radius*.045,c.light,fade(age)*.28);
  }
};

const steel: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    for(let i=0;i<5;i++) {
      const age=progress(ms,30+i*60,240);
      if(!active(age))continue;
      const x=t.x+t.radius*(i-2)*.32;
      stroke(ctx,[x,t.y-t.radius*1.2,x,t.y-t.radius*(.4-age*.8)],
        t.radius*.06,c.light,fade(age)*.28);
    }
  } else {
    for(let i=0;i<5;i++) {
      const age=progress(ms,230+i*60,230);
      if(!active(age))continue;
      const x=t.x+t.radius*(i-2)*.32;
      glint(ctx,x-t.radius*.07,t.y+t.radius*.46,t.radius*.07,c.light,fade(age)*.75);
    }
  }
};

const fire: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y+t.radius*.24,t.radius*.75,c.main,
      fade(progress(ms,100,570))*.24);
    return;
  }
  for(let i=0;i<16;i++) {
    const seed=t.seed+i*41;
    const age=progress(ms,255+random(seed)*155,250+random(seed+2)*120);
    if(!active(age))continue;
    const angle=random(seed+3)*Math.PI*2;
    const x=t.x+Math.cos(angle)*t.radius*(.1+age*.8);
    const y=t.y+t.radius*.42-Math.abs(Math.sin(angle))*t.radius*age*.55;
    stroke(ctx,[x,y,x-Math.cos(angle)*t.radius*.12,
      y+t.radius*.09],t.radius*.025,i%3?c.light:c.main,fade(age)*.73);
  }
};

const water: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  const age=progress(ms,150,350);
  if(active(age)) {
    for(let i=0;i<5;i++) {
      const a=i*Math.PI/4+Math.PI*.98;
      const x=t.x+Math.cos(a)*t.radius*(.24+age*.47);
      const y=t.y+Math.sin(a)*t.radius*(.24+age*.47);
      ring(ctx,x,y,t.radius*(.055+age*.025),t.radius*.018,c.light,
        fade(age)*.72);
    }
  }
  for(let i=0;i<9;i++) {
    const seed=t.seed+i*67;
    const p=progress(ms,215+i*30,230);
    if(!active(p))continue;
    const a=random(seed)*Math.PI*2;
    glint(ctx,t.x+Math.cos(a)*t.radius*(.3+p*.73),
      t.y+Math.sin(a)*t.radius*(.23+p*.62),t.radius*.045,c.light,
      fade(p)*.58);
  }
};

const grass: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  for(let i=0;i<15;i++) {
    const seed=t.seed+i*79;
    const age=progress(ms,50+i*23,240);
    if(!active(age))continue;
    const x=t.x+t.radius*(-1.1+age*2.2);
    const y=t.y+t.radius*((random(seed)-.5)*1.3+
      Math.sin(age*7+i)*.13);
    stroke(ctx,[x-t.radius*.2,y+t.radius*.055,x-t.radius*.06,y],
      t.radius*.018,c.light,fade(age)*.5);
  }
};

const electric: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y,t.radius*.88,c.light,fade(progress(ms,90,570))*.16);
    return;
  }
  for(let i=0;i<8;i++) {
    const seed=t.seed+i*53;
    const age=progress(ms,195+i*30,240);
    if(!active(age))continue;
    const a=i*Math.PI/4+random(seed)*.17;
    const inner=t.radius*(.13+age*.31);
    const outer=inner+t.radius*(.14+random(seed+2)*.14);
    stroke(ctx,[t.x+Math.cos(a)*inner,t.y+Math.sin(a)*inner,
      t.x+Math.cos(a+.13)*outer,t.y+Math.sin(a+.13)*outer],
      t.radius*.027,c.light,fade(age)*.9);
  }
};

const psychic: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y,t.radius*.8,c.main,fade(progress(ms,45,600))*.16);
    return;
  }
  const age=progress(ms,185,360);
  if(active(age)) {
    stroke(ctx,[t.x-t.radius*.39,t.y-t.radius*.45,
      t.x-t.radius*.07,t.y-t.radius*.09,
      t.x+t.radius*.12,t.y+t.radius*.07,
      t.x+t.radius*.4,t.y+t.radius*.49],
      t.radius*.033,c.light,fade(age)*.8);
    glint(ctx,t.x,t.y,t.radius*.12,c.light,fade(age)*.65);
  }
};

const ice: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  for(let i=0;i<13;i++) {
    const seed=t.seed+i*47;
    const age=progress(ms,200+i*28,280);
    if(!active(age))continue;
    const a=random(seed)*Math.PI*2;
    const r=t.radius*(.15+age*.82);
    glint(ctx,t.x+Math.cos(a)*r,t.y+Math.sin(a)*r*.74,
      t.radius*(.025+random(seed+2)*.025),c.light,fade(age)*.78);
  }
};

const dark: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    for(let i=0;i<3;i++) {
      const age=progress(ms,80+i*95,480);
      if(!active(age))continue;
      ellipse(ctx,t.x+t.radius*(i-1)*.37,t.y+t.radius*(.2-age*.12),
        t.radius*(.3+age*.16),t.radius*.09,c.dark,fade(age)*.12);
    }
  } else for(let i=0;i<8;i++) {
    const seed=t.seed+i*67;
    const age=progress(ms,130+i*58,250);
    if(!active(age))continue;
    const a=random(seed)*Math.PI*2;
    stroke(ctx,[t.x+Math.cos(a)*t.radius*.2,t.y+Math.sin(a)*t.radius*.2,
      t.x+Math.cos(a+.2)*t.radius*(.3+age*.76),
      t.y+Math.sin(a+.2)*t.radius*(.3+age*.76)],
      t.radius*.02,c.light,fade(age)*.29);
  }
};

const fairy: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y,t.radius*.65,c.light,fade(progress(ms,80,460))*.18);
    return;
  }
  for(let i=0;i<12;i++) {
    const seed=t.seed+i*37;
    const age=progress(ms,150+i*31,270);
    if(!active(age))continue;
    const a=i*2.4+random(seed)*.23;
    const r=t.radius*(.19+age*.78);
    glint(ctx,t.x+Math.cos(a)*r,t.y+Math.sin(a)*r,
      t.radius*(.035+random(seed+2)*.025),c.light,fade(age)*.74);
  }
};

const effects: Partial<Record<VfxType,Draw>> = {
  flying, ground, rock, bug, ghost, steel, fire, water, grass, electric,
  psychic, ice, dark, fairy,
};

export const polishPhysicalTile = (ctx: CanvasRenderingContext2D,
  type: VfxType, tile: VfxTile, ms: number, colors: Colors, layer: Layer) => {
  effects[type]?.(ctx,tile,ms,colors,layer);
};
