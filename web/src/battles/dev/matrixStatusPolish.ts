/** Secondary motion and surface details for the thirteen review-directed Status sequences. */
import type { VfxType } from "../vfx/types";
import { active, disk, fade, glint, glow, motif, progress, random, ring, stroke } from "./matrixVfxKit";
import type { Colors, VfxTile } from "./matrixVfxKit";

type Layer = "back" | "front";
type Draw = (ctx: CanvasRenderingContext2D, tile: VfxTile, ms: number,
  colors: Colors, layer: Layer) => void;

const normal: Draw = (ctx,t,ms,c,layer) => {
  const pulse=fade(progress(ms,40,670));
  if(layer==="back") {
    glow(ctx,t.x,t.y,t.radius*.85,c.light,pulse*.1);
    return;
  }
  for(let i=0;i<12;i++) {
    const a=i*Math.PI/6;
    const age=progress(ms,115+i*26,370);
    if(!active(age))continue;
    const r=t.radius*(.55+age*.18);
    const x=t.x+Math.cos(a)*r, y=t.y+Math.sin(a)*r*.76;
    stroke(ctx,[x,y,x+Math.cos(a)*t.radius*.08,y+Math.sin(a)*t.radius*.06],
      t.radius*.023,c.light,fade(age)*.57);
  }
};

const flying: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  for(let i=0;i<9;i++) {
    const seed=t.seed+i*47;
    const age=progress(ms,90+i*53,330);
    if(!active(age))continue;
    const side=i%2?-1:1;
    const x=t.x+side*t.radius*(.18+random(seed)*.64);
    const y=t.y+t.radius*(.43-age*1.21);
    motif(ctx,"feather",c,x,y,t.radius*(.035+random(seed+2)*.038),
      side*(.4+age*.4),fade(age)*.65);
    if(i%3===0)glint(ctx,x+side*t.radius*.08,y-t.radius*.1,
      t.radius*.04,c.light,fade(age)*.63);
  }
};

const rock: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    ring(ctx,t.x,t.y,t.radius*.51,t.radius*.022,c.dark,
      fade(progress(ms,60,620))*.28);
    return;
  }
  for(let i=0;i<11;i++) {
    const seed=t.seed+i*59;
    const age=progress(ms,195+i*28,285);
    if(!active(age))continue;
    const a=i*2.4+random(seed)*.3;
    const r=t.radius*(.46+age*.56);
    motif(ctx,"rock",c,t.x+Math.cos(a)*r,t.y+Math.sin(a)*r*.73,
      t.radius*(.026+random(seed+2)*.04),a,fade(age)*.57);
  }
};

const bug: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  for(let i=0;i<8;i++) {
    const a=i*Math.PI/4+Math.PI/8;
    const x=t.x+Math.cos(a)*t.radius*.68;
    const y=t.y+Math.sin(a)*t.radius*.52;
    const age=progress(ms,220+i*31,280);
    if(active(age))glint(ctx,x,y,t.radius*.045,c.light,fade(age)*.72);
  }
  const shimmer=fade(progress(ms,230,270));
  if(shimmer>0)stroke(ctx,[t.x-t.radius*.38,t.y-t.radius*.23,
    t.x+t.radius*.43,t.y+t.radius*.31],t.radius*.015,c.light,shimmer*.34);
};

const ghost: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    for(let i=0;i<3;i++) {
      const age=progress(ms,100+i*125,420);
      if(!active(age))continue;
      glow(ctx,t.x+t.radius*(i-1)*.18,t.y+t.radius*.1,
        t.radius*(.52+age*.35),c.main,fade(age)*.1);
    }
    return;
  }
  for(let i=0;i<10;i++) {
    const seed=t.seed+i*37;
    const age=progress(ms,170+i*39,280);
    if(!active(age))continue;
    disk(ctx,t.x+(random(seed)-.5)*t.radius*1.4,
      t.y+t.radius*(.55-age*1.2),t.radius*(.017+random(seed+2)*.027),
      c.light,fade(age)*.58);
  }
};

const steel: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  const sweep=progress(ms,240,310);
  if(active(sweep)) {
    const x=t.x+t.radius*(-.57+sweep*1.14);
    stroke(ctx,[x-t.radius*.16,t.y-t.radius*.54,
      x+t.radius*.08,t.y+t.radius*.34],t.radius*.034,c.light,fade(sweep)*.75);
  }
  for(let i=0;i<4;i++) {
    const age=progress(ms,170+i*116,240);
    if(!active(age))continue;
    const x=t.x+t.radius*(i-1.5)*.4;
    glint(ctx,x,t.y+t.radius*((i%2?1:-1)*.42),t.radius*.046,
      c.light,fade(age)*.68);
  }
};

const fire: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y+t.radius*.27,t.radius*.72,c.main,
      fade(progress(ms,60,640))*.17);
    return;
  }
  for(let i=0;i<14;i++) {
    const seed=t.seed+i*67;
    const age=progress(ms,175+random(seed)*300,210+random(seed+2)*115);
    if(!active(age))continue;
    const side=i%2?-1:1;
    const x=t.x+side*t.radius*(.12+random(seed+3)*.68);
    const y=t.y+t.radius*(.25-age*(.55+random(seed+4)*.4));
    stroke(ctx,[x,y,x-side*t.radius*.07,y+t.radius*.11],
      t.radius*.02,c.light,fade(age)*.75);
  }
};

const grass: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  for(let i=0;i<24;i++) {
    const seed=t.seed+i*41;
    const age=progress(ms,85+i*21+random(seed)*30,255+random(seed+2)*125);
    if(!active(age))continue;
    const x=t.x+t.radius*(random(seed+3)-.5)*1.5;
    const y=t.y+t.radius*(-.85+age*1.42);
    disk(ctx,x,y,t.radius*(.013+random(seed+4)*.019),
      i%3?c.light:c.main,fade(age)*.65);
  }
};

const electric: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  for(let i=0;i<10;i++) {
    const seed=t.seed+i*41;
    const age=progress(ms,110+i*46,250);
    if(!active(age))continue;
    const a=i*2.4+random(seed)*.4;
    const r=t.radius*(.22+age*.74);
    const x=t.x+Math.cos(a)*r, y=t.y+Math.sin(a)*r*.75;
    stroke(ctx,[x-t.radius*.06,y+t.radius*.04,x,y-t.radius*.055,
      x+t.radius*.04,y+t.radius*.01],t.radius*.025,c.light,fade(age)*.74);
  }
};

const psychic: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back") {
    glow(ctx,t.x,t.y,t.radius*.71,c.main,
      fade(progress(ms,105,515))*.14);
    return;
  }
  const blink=fade(progress(ms,270,235));
  glint(ctx,t.x-t.radius*.08,t.y-t.radius*.12,t.radius*.065,c.light,blink*.8);
  for(let i=0;i<8;i++) {
    const age=progress(ms,170+i*54,255);
    if(!active(age))continue;
    const a=i*Math.PI/4+ms/650;
    disk(ctx,t.x+Math.cos(a)*t.radius*.68,
      t.y+Math.sin(a)*t.radius*.5,t.radius*.022,c.light,fade(age)*.63);
  }
};

const ice: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  for(let i=0;i<8;i++) {
    const a=i*Math.PI/4;
    const age=progress(ms,135+i*32,350);
    if(!active(age))continue;
    const r=t.radius*(.24+age*.66);
    const x=t.x+Math.cos(a)*r, y=t.y+Math.sin(a)*r*.78;
    stroke(ctx,[x,y,x+Math.cos(a+.52)*t.radius*.12,
      y+Math.sin(a+.52)*t.radius*.1],t.radius*.018,c.light,fade(age)*.7);
    if(i%2===0)glint(ctx,x,y,t.radius*.044,c.light,fade(age)*.57);
  }
};

const dragon: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  for(let i=0;i<12;i++) {
    const seed=t.seed+i*43;
    const age=progress(ms,250+i*31,290);
    if(!active(age))continue;
    const x=t.x+t.radius*(.31+age*.78);
    const y=t.y+t.radius*((random(seed)-.5)*.94);
    stroke(ctx,[x-t.radius*.11,y,x+t.radius*.09,y-t.radius*.015],
      t.radius*(.018+random(seed+2)*.015),c.light,fade(age)*.57);
  }
};

const dark: Draw = (ctx,t,ms,c,layer) => {
  if(layer==="back")return;
  for(let i=0;i<9;i++) {
    const seed=t.seed+i*59;
    const age=progress(ms,100+i*51,340);
    if(!active(age))continue;
    const side=i%2?-1:1;
    const x=t.x+side*t.radius*(.18+age*.72);
    const y=t.y+t.radius*((random(seed)-.5)*.78);
    stroke(ctx,[x-side*t.radius*.36,y+t.radius*.08,x,y,
      x+side*t.radius*.12,y-t.radius*.09],t.radius*.045,
      i%3?c.main:c.light,fade(age)*.25);
  }
};

const effects: Partial<Record<VfxType,Draw>> = {
  normal, flying, rock, bug, ghost, steel, fire, grass, electric,
  psychic, ice, dragon, dark,
};

export const polishStatusTile = (ctx: CanvasRenderingContext2D,
  type: VfxType, tile: VfxTile, ms: number, colors: Colors, layer: Layer) => {
  effects[type]?.(ctx,tile,ms,colors,layer);
};
