/** Projected and environmental Special effects for the matrix review. */
import type { VfxType } from "../vfx/types";
import { active, disk, ease, ellipse, fade, glow, motif, progress,
  random, ring, stroke } from "./matrixVfxKit";
import type { Colors, VfxTile } from "./matrixVfxKit";

type Draw = (ctx: CanvasRenderingContext2D, tile: VfxTile, ms: number, c: Colors) => void;

const flying: Draw = (ctx,t,ms,c) => {
  const age = progress(ms,20,670);
  if (active(age)) {
    const sweep=ease(progress(ms,40,370));
    if(sweep>0) {
      ctx.save();ctx.globalAlpha=fade(progress(ms,35,650))*.19;
      ctx.fillStyle=c.main;ctx.beginPath();
      ctx.moveTo(t.x-t.radius*(1.4-sweep*.85),t.y+t.radius*.34);
      ctx.bezierCurveTo(t.x-t.radius*.52,t.y-t.radius*.68,
        t.x+t.radius*.32,t.y+t.radius*.41,
        t.x+t.radius*(.98+sweep*.3),t.y-t.radius*.51);
      ctx.lineTo(t.x+t.radius*(.98+sweep*.3),t.y+t.radius*.02);
      ctx.bezierCurveTo(t.x+t.radius*.21,t.y+t.radius*.85,
        t.x-t.radius*.45,t.y-t.radius*.16,
        t.x-t.radius*(1.4-sweep*.85),t.y+t.radius*.68);
      ctx.closePath();ctx.fill();ctx.restore();
    }
    for (let i=0;i<3;i++) {
      const sweep = ease(progress(ms,50+i*80,420));
      if (sweep <= 0) continue;
      ctx.save(); ctx.globalAlpha = fade(progress(ms,50+i*80,520))*.78;
      ctx.strokeStyle = i===1?c.light:c.main;
      ctx.lineWidth = t.radius*(.22-i*.045); ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(t.x-t.radius*(1.23-sweep*2.28),t.y+t.radius*(.38-i*.34));
      ctx.bezierCurveTo(t.x-t.radius*.48,t.y-t.radius*(.38+i*.1),
        t.x+t.radius*.38,t.y+t.radius*(.43-i*.18),
        t.x+t.radius*(.92+sweep*.2),t.y-t.radius*(.36+i*.07));
      ctx.stroke(); ctx.restore();
    }
  }
  for (let i=0;i<13;i++) {
    const seed=t.seed+i*37;
    const a=progress(ms,95+i*27+random(seed)*35,380);
    if (!active(a)) continue;
    motif(ctx,"feather",c,t.x+t.radius*(-.95+a*1.9),
      t.y+t.radius*((random(seed+2)-.5)*1.25+Math.sin(a*5+i)*.12),
      t.radius*(.07+random(seed+3)*.08),-.7+a*2,fade(a)*.75);
  }
};

const ground: Draw = (ctx,t,ms,c) => {
  const spread=ease(progress(ms,60,300));
  ellipse(ctx,t.x,t.y+t.radius*.68,t.radius*(.22+spread*.86),
    t.radius*(.1+spread*.18),c.dark,fade(progress(ms,0,740))*.88);
  for (let i=0;i<7;i++) {
    const seed=t.seed+i*51;
    const birth=75+i*52+random(seed)*40;
    const age=progress(ms,birth,310+random(seed+2)*90);
    if (!active(age)) continue;
    const x=t.x+t.radius*(random(seed+3)-.5)*1.5;
    const height=t.radius*(.55+random(seed+4)*.7);
    const y=t.y+t.radius*.52-height*Math.sin(age*Math.PI);
    ctx.save(); ctx.globalAlpha=fade(age)*.9;
    ctx.fillStyle=i%2?c.main:c.dark;
    ctx.beginPath(); ctx.moveTo(x-t.radius*.12,t.y+t.radius*.5);
    ctx.quadraticCurveTo(x-t.radius*.13,y,x,y-t.radius*.12);
    ctx.quadraticCurveTo(x+t.radius*.17,y,x+t.radius*.13,t.y+t.radius*.5);
    ctx.fill(); ctx.restore();
    for(let j=0;j<3;j++) {
      const a=(j-1)*.55+random(seed+j+8)*.3;
      disk(ctx,x+Math.sin(a)*t.radius*.3*age,y-t.radius*.11*age,
        t.radius*(.045+random(seed+j+11)*.04),c.light,fade(age)*.65);
    }
  }
};

const rock: Draw = (ctx,t,ms,c) => {
  const gather=ease(progress(ms,305,250));
  for (let i=0;i<7;i++) {
    const seed=t.seed+i*71;
    const a=i*Math.PI*2/7+random(seed)*.25;
    const r=t.radius*(.7+random(seed+2)*.25);
    const x=t.x+Math.cos(a)*r*(1-gather*.77);
    const y=t.y+Math.sin(a)*r*.65*(1-gather*.77)-
      t.radius*.11*Math.sin(ms/105+i);
    const alpha=Math.min(1,ms/120)*(1-ease(progress(ms,620,110)));
    ring(ctx,x,y,t.radius*(.17+random(seed+3)*.13),t.radius*.038,c.light,alpha*.66);
    motif(ctx,"rock",c,x,y,t.radius*(.19+random(seed+4)*.17),
      a*.2+gather*.5,alpha);
  }
  const impact=progress(ms,480,250);
  if (active(impact)) {
    glow(ctx,t.x,t.y,t.radius*.75,c.light,fade(impact)*.2);
    for (let i=0;i<6;i++) {
      const a=i*Math.PI/3+random(t.seed+i*3)*.22;
      motif(ctx,"rock",c,t.x+Math.cos(a)*t.radius*(.15+impact*.65),
        t.y+Math.sin(a)*t.radius*(.1+impact*.45),t.radius*.06,a,fade(impact)*.75);
    }
  }
};

const ghost: Draw = (ctx,t,ms,c) => {
  const grow=ease(progress(ms,180,310));
  glow(ctx,t.x,t.y,t.radius*(.3+grow*.75),c.main,fade(progress(ms,0,750))*.27);
  for(let i=0;i<19;i++) {
    const seed=t.seed+i*59;
    const birth=15+random(seed)*170;
    const age=progress(ms,birth,410+random(seed+2)*90);
    if(!active(age)) continue;
    const a=random(seed+3)*Math.PI*2+age*.5;
    const distance=t.radius*(1.06-age*.85);
    disk(ctx,t.x+Math.cos(a)*distance,t.y+Math.sin(a)*distance*.8,
      t.radius*(.025+random(seed+4)*.055),i%4?c.light:c.main,fade(age)*.77);
  }
  motif(ctx,"orb",c,t.x,t.y,t.radius*(.15+grow*.54),ms/700,
    Math.min(1,ms/130)*(1-ease(progress(ms,510,170))));
  const burst=progress(ms,520,220);
  if(active(burst)) {
    ring(ctx,t.x,t.y,t.radius*(.1+burst*.93),t.radius*.07,c.light,fade(burst)*.7);
    for(let i=0;i<9;i++) {
      const a=i*2.4+random(t.seed+i)*.4;
      disk(ctx,t.x+Math.cos(a)*t.radius*burst,t.y+Math.sin(a)*t.radius*burst*.8,
        t.radius*.055*(1-burst),c.main,fade(burst));
    }
  }
};

const water: Draw = (ctx,t,ms,c) => {
  const rise=ease(progress(ms,50,255));
  const crash=ease(progress(ms,310,230));
  const out=1-ease(progress(ms,555,180));
  if(rise>0 && out>0) {
    ctx.save(); ctx.globalAlpha=out*.75;
    const fill=ctx.createLinearGradient(t.x,t.y-t.radius,t.x,t.y+t.radius);
    fill.addColorStop(0,c.light); fill.addColorStop(.42,c.main); fill.addColorStop(1,c.dark);
    ctx.fillStyle=fill;
    const crest=t.y+t.radius*(.61-rise*1.45+crash*.68);
    ctx.beginPath(); ctx.moveTo(t.x-t.radius*1.08,t.y+t.radius*.88);
    ctx.lineTo(t.x-t.radius*1.08,crest);
    ctx.bezierCurveTo(t.x-t.radius*.65,crest-t.radius*(.18+crash*.24),
      t.x-t.radius*.16,crest+t.radius*.2,t.x+t.radius*.16,crest-t.radius*.22);
    ctx.bezierCurveTo(t.x+t.radius*.53,crest-t.radius*.52,
      t.x+t.radius*.86,crest-t.radius*.1,t.x+t.radius*1.08,crest+t.radius*.09);
    ctx.lineTo(t.x+t.radius*1.08,t.y+t.radius*.88); ctx.closePath(); ctx.fill();
    ctx.strokeStyle=c.light; ctx.lineWidth=t.radius*.085;
    ctx.beginPath(); ctx.moveTo(t.x-t.radius*1.08,crest);
    ctx.bezierCurveTo(t.x-t.radius*.65,crest-t.radius*(.18+crash*.24),
      t.x-t.radius*.16,crest+t.radius*.2,t.x+t.radius*.16,crest-t.radius*.22);
    ctx.bezierCurveTo(t.x+t.radius*.53,crest-t.radius*.52,
      t.x+t.radius*.86,crest-t.radius*.1,t.x+t.radius*1.08,crest+t.radius*.09);
    ctx.stroke();ctx.restore();
    for(let i=0;i<8;i++) {
      const seed=t.seed+i*37;
      const x=t.x+t.radius*((i-3.5)*.27);
      const y=crest+t.radius*(Math.sin(i*1.7)*.18-.08);
      ellipse(ctx,x,y,t.radius*(.055+random(seed)*.07),
        t.radius*(.025+random(seed+2)*.03),c.light,out*.7);
      stroke(ctx,[x,t.y+t.radius*.12,x+t.radius*.08,
        t.y+t.radius*(.32+random(seed+3)*.28)],
        t.radius*.025,c.light,out*.26);
    }
  }
  for(let i=0;i<11;i++) {
    const seed=t.seed+i*41;
    const age=progress(ms,310+i*21,290);
    if(!active(age)) continue;
    disk(ctx,t.x+t.radius*(random(seed)-.5)*1.7,
      t.y+t.radius*(.12-age*(.55+random(seed+2)*.55)),
      t.radius*(.025+random(seed+3)*.045),c.light,fade(age)*.8);
  }
};

const grass: Draw = (ctx,t,ms,c) => {
  const form=ease(progress(ms,45,190));
  const shrink=ease(progress(ms,410,210));
  const width=t.radius*(.6*form-.4*shrink);
  if(width>0) {
    glow(ctx,t.x,t.y,t.radius*.96,c.light,fade(progress(ms,0,730))*.25);
    ctx.save();ctx.globalAlpha=(1-ease(progress(ms,620,110)))*.82;
    const fill=ctx.createLinearGradient(t.x-width,t.y,t.x+width,t.y);
    fill.addColorStop(0,"transparent");fill.addColorStop(.25,c.main);
    fill.addColorStop(.5,c.light);fill.addColorStop(.75,c.main);fill.addColorStop(1,"transparent");
    ctx.fillStyle=fill;ctx.fillRect(t.x-width,t.y-t.radius*1.1,width*2,t.radius*2.2);
    ctx.restore();
  }
  for(let i=0;i<15;i++) {
    const seed=t.seed+i*53;
    const age=progress(ms,105+i*24+random(seed)*45,330);
    if(!active(age)) continue;
    const a=random(seed+2)*Math.PI*2+age*4;
    const distance=t.radius*(.17+age*.68);
    motif(ctx,"leaf",c,t.x+Math.cos(a)*distance,t.y+Math.sin(a)*distance,
      t.radius*(.055+random(seed+3)*.05),a,fade(age)*.8);
  }
};

const electric: Draw = (ctx,t,ms,c) => {
  for(let i=0;i<3;i++) {
    const birth=45+i*165;
    const age=progress(ms,birth,320);
    if(!active(age)) continue;
    const seed=t.seed+i*89;
    const x=t.x+(random(seed)-.5)*t.radius*.62;
    const top=t.y-t.radius*1.31;
    const length=ease(age/.52);
    const path=[x,top,x-t.radius*.16,top+t.radius*.28*length,
      x+t.radius*.11,top+t.radius*.52*length,
      x-t.radius*.12,top+t.radius*.78*length,
      x+t.radius*.04,t.y+t.radius*.38*length];
    stroke(ctx,path,t.radius*.18,c.dark,fade(age));
    stroke(ctx,path,t.radius*.09,c.light,fade(age));
    if(age>.44) {
      const branch=[x+t.radius*.11,top+t.radius*.52*length,
        x+t.radius*.4,top+t.radius*.65*length,x+t.radius*.25,top+t.radius*.82*length];
      stroke(ctx,branch,t.radius*.05,c.light,fade(age)*.7);
      glow(ctx,t.x,t.y,t.radius*.66,c.light,fade(age)*.21);
    }
  }
  for(let i=0;i<9;i++) {
    const seed=t.seed+i*47;
    const age=progress(ms,180+i*42,260);
    if(!active(age))continue;
    const a=random(seed)*Math.PI*2;
    motif(ctx,"bolt",c,t.x+Math.cos(a)*t.radius*(.14+age*.75),
      t.y+Math.sin(a)*t.radius*(.14+age*.65),t.radius*.07,a,fade(age));
  }
};

const psychic: Draw = (ctx,t,ms,c) => {
  glow(ctx,t.x,t.y,t.radius*1.08,c.main,fade(progress(ms,0,740))*.17);
  for(let p=0;p<5;p++) {
    const age=progress(ms,35+p*105,400);
    if(!active(age))continue;
    ctx.save();ctx.globalAlpha=fade(age)*.55;ctx.strokeStyle=p%2?c.light:c.main;
    ctx.lineWidth=t.radius*(.065-age*.03);
    ctx.beginPath();
    for(let i=0;i<=48;i++) {
      const a=i*Math.PI*2/48;
      const r=t.radius*(.18+age*.9)*(1+.045*Math.sin(a*6-ms/80+p));
      const x=t.x+Math.cos(a)*r;
      const y=t.y+Math.sin(a)*r*.77;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.stroke();ctx.restore();
  }
  for(let i=0;i<9;i++) {
    const seed=t.seed+i*37;
    const age=progress(ms,100+i*43,320);
    if(!active(age))continue;
    disk(ctx,t.x+Math.cos(i*2.4+age*1.9)*t.radius*(.22+age*.59),
      t.y+Math.sin(i*2.4+age*1.9)*t.radius*(.18+age*.42),
      t.radius*(.025+random(seed)*.04),c.light,fade(age)*.6);
  }
};

const dragon: Draw = (ctx,t,ms,c) => {
  glow(ctx,t.x,t.y,t.radius,c.dark,fade(progress(ms,0,740))*.28);
  const body=ease(progress(ms,50,250))*(1-ease(progress(ms,610,120)));
  if(body>0) {
    ctx.save();ctx.globalAlpha=body*.25;ctx.fillStyle="#6375b5";
    ctx.beginPath();ctx.moveTo(t.x-t.radius*.62,t.y+t.radius*.88);
    ctx.quadraticCurveTo(t.x-t.radius*.25,t.y-t.radius*.14,
      t.x-t.radius*.31,t.y-t.radius*.98);
    ctx.lineTo(t.x+t.radius*.32,t.y-t.radius*.98);
    ctx.quadraticCurveTo(t.x+t.radius*.22,t.y-t.radius*.07,
      t.x+t.radius*.68,t.y+t.radius*.88);
    ctx.closePath();ctx.fill();ctx.restore();
    for(let i=0;i<5;i++) {
      ellipse(ctx,t.x+t.radius*(i-2)*.24,t.y+t.radius*(.76+Math.sin(i*2)*.09),
        t.radius*.21,t.radius*.13,i%2?c.dark:c.main,body*.32);
    }
  }
  for(let layer=0;layer<4;layer++) {
    const age=progress(ms,20+layer*75,510);
    if(!active(age))continue;
    ctx.save();ctx.globalAlpha=fade(age)*.62;
    ctx.strokeStyle=layer%2?"#7aa4dc":c.main;
    ctx.lineWidth=t.radius*(.21-layer*.026);
    ctx.lineCap="round";
    ctx.beginPath();
    for(let i=0;i<=26;i++) {
      const u=i/26;
      const y=t.y+t.radius*(.85-u*1.8);
      const x=t.x+Math.sin(u*8+ms/130+layer)*t.radius*(.22+u*.36)*age;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();ctx.restore();
  }
  for(let i=0;i<17;i++) {
    const seed=t.seed+i*57;
    const age=progress(ms,55+i*28,310);
    if(!active(age))continue;
    const a=random(seed)*Math.PI*2+age*3;
    motif(ctx,"star",{main:"#6488cb",light:c.light,dark:c.dark},
      t.x+Math.cos(a)*t.radius*(.2+age*.75),
      t.y+t.radius*(.55-age*1.25),t.radius*(.035+random(seed+2)*.05),a,
      fade(age)*.7);
  }
};

const fairy: Draw = (ctx,t,ms,c) => {
  glow(ctx,t.x,t.y,t.radius*1.04,c.main,fade(progress(ms,0,750))*.2);
  for(let lane=0;lane<4;lane++) {
    const age=progress(ms,40+lane*100,390);
    if(!active(age))continue;
    const dir=lane%2?-1:1;
    ctx.save();ctx.globalAlpha=fade(age)*.71;
    ctx.strokeStyle=lane%2?c.light:c.main;
    ctx.lineWidth=t.radius*(.11-lane*.012);ctx.lineCap="round";
    ctx.beginPath();
    ctx.moveTo(t.x-dir*t.radius*1.12,t.y+t.radius*(lane*.19-.25));
    ctx.bezierCurveTo(t.x+dir*t.radius*.72,t.y-t.radius*.82,
      t.x-dir*t.radius*.64,t.y+t.radius*.72,
      t.x+dir*t.radius*(.33+age*.67),t.y+t.radius*(.15-lane*.09));
    ctx.stroke();ctx.restore();
  }
  for(let i=0;i<17;i++) {
    const seed=t.seed+i*29;
    const age=progress(ms,70+i*27,250+random(seed)*110);
    if(!active(age))continue;
    const a=random(seed+2)*Math.PI*2+age*2.8;
    motif(ctx,i%3?"petal":"star",c,
      t.x+Math.cos(a)*t.radius*(.18+age*.75),
      t.y+Math.sin(a)*t.radius*(.2+age*.67),
      t.radius*(.05+random(seed+3)*.06),a+age,fade(age)*.86);
  }
};

const effects: Partial<Record<VfxType, Draw>> = {
  flying, ground, rock, ghost, water, grass, electric, psychic, dragon, fairy,
};

export const drawSpecialTile = (ctx: CanvasRenderingContext2D,
  type: VfxType, tile: VfxTile, ms: number, colors: Colors): boolean => {
  const draw = effects[type];
  if(!draw)return false;
  draw(ctx,tile,ms,colors);
  return true;
};
