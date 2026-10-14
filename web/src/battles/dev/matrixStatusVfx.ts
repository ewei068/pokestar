/** Fields, wards, binds, and other non-damaging Status effects for the matrix review. */
import type { VfxType } from "../vfx/types";
import { active, disk, ease, ellipse, fade, glow, motif, progress,
  random, ring, stroke } from "./matrixVfxKit";
import type { Colors, VfxTile } from "./matrixVfxKit";

type Draw = (ctx: CanvasRenderingContext2D, tile: VfxTile, ms: number, c: Colors) => void;

const normal: Draw = (ctx,t,ms,c) => {
  const reveal=ease(progress(ms,40,250));
  const out=1-ease(progress(ms,540,200));
  if(reveal>0&&out>0) {
    ellipse(ctx,t.x,t.y,t.radius*(.32+reveal*.47),t.radius*(.15+reveal*.39),
      c.main,out*.12);
    for(let i=0;i<3;i++) {
      const a=progress(ms,135+i*105,400);
      if(active(a))ring(ctx,t.x,t.y,t.radius*(.3+reveal*.48),
        t.radius*.028,i===1?c.light:c.main,fade(a)*.45);
    }
  }
  for(let i=0;i<8;i++) {
    const seed=t.seed+i*67;
    const a=progress(ms,90+i*54,320);
    if(!active(a))continue;
    const angle=i*Math.PI/4+random(seed)*.3;
    const distance=t.radius*(.94-a*.27);
    disk(ctx,t.x+Math.cos(angle)*distance,t.y+Math.sin(angle)*distance*.77,
      t.radius*(.035+random(seed+2)*.03),i%3?c.light:c.main,fade(a)*.7);
  }
};

const flying: Draw = (ctx,t,ms,c) => {
  const lift=ease(progress(ms,35,330));
  const out=1-ease(progress(ms,560,170));
  for(const side of [-1,1]) {
    ctx.save();ctx.translate(t.x+side*t.radius*(.33+lift*.25),
      t.y+t.radius*(.25-lift*.6));ctx.scale(side,1);
    motif(ctx,"wing",c,0,0,t.radius*.65,-.55-lift*.6,out*Math.min(1,ms/90));
    ctx.restore();
  }
  for(let i=0;i<11;i++) {
    const seed=t.seed+i*47;
    const a=progress(ms,175+i*36,330);
    if(!active(a))continue;
    motif(ctx,"feather",c,t.x+(random(seed)-.5)*t.radius*1.75,
      t.y+t.radius*(.37-a*(.86+random(seed+2)*.5)),
      t.radius*(.055+random(seed+3)*.055),a*2,fade(a)*.8);
  }
};

const rock: Draw = (ctx,t,ms,c) => {
  const appear=ease(progress(ms,40,270));
  const out=1-ease(progress(ms,585,145));
  for(let i=0;i<7;i++) {
    const seed=t.seed+i*59;
    const angle=i*Math.PI*2/7+random(seed)*.18;
    const orbit=t.radius*(.72+random(seed+2)*.17);
    const x=t.x+Math.cos(angle+ms/1800)*orbit*appear;
    const y=t.y+Math.sin(angle+ms/1800)*orbit*.77*appear+
      Math.sin(ms/105+i)*t.radius*.06;
    motif(ctx,"rock",c,x,y,t.radius*(.14+random(seed+3)*.1)*appear,
      angle*.17,out);
  }
  if(appear>0)ring(ctx,t.x,t.y,t.radius*.51,t.radius*.025,c.light,
    appear*out*.35);
};

const bug: Draw = (ctx,t,ms,c) => {
  const stretch=ease(progress(ms,40,300));
  const out=1-ease(progress(ms,550,180));
  if(stretch<=0||out<=0)return;
  const radius=t.radius*(.16+stretch*.77);
  ctx.save();ctx.globalAlpha=out*.82;ctx.lineCap="round";
  ctx.strokeStyle=c.light;ctx.lineWidth=Math.max(1.3,t.radius*.027);
  const nodes=8;
  for(let layer=1;layer<=3;layer++) {
    ctx.beginPath();
    for(let i=0;i<=nodes;i++) {
      const a=i*Math.PI*2/nodes+Math.PI/8;
      const wobble=1+.06*Math.sin(ms/90+i+layer);
      const x=t.x+Math.cos(a)*radius*layer/3*wobble;
      const y=t.y+Math.sin(a)*radius*layer/3*.78*wobble;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  for(let i=0;i<nodes;i++) {
    const a=i*Math.PI*2/nodes+Math.PI/8;
    stroke(ctx,[t.x,t.y,t.x+Math.cos(a)*radius,
      t.y+Math.sin(a)*radius*.78],Math.max(1,t.radius*.025),c.dark,out*.8);
  }
  ctx.restore();
  for(let i=0;i<5;i++) {
    const a=progress(ms,180+i*90,250);
    if(!active(a))continue;
    disk(ctx,t.x+Math.cos(i*2.4)*radius*.7,t.y+Math.sin(i*2.4)*radius*.56,
      t.radius*.028,c.light,fade(a));
  }
};

// A project-owned tiny ghost silhouette, not a copy of a game sprite.
let ghostCanvas: HTMLCanvasElement | undefined;
const ghostPixels = () => {
  if(ghostCanvas)return ghostCanvas;
  const canvas=document.createElement("canvas");canvas.width=canvas.height=20;
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("VFX canvas is unavailable");
  const rows=[
    "......33333333......", "....332222222233....", "...32222222222223...",
    "..3222222222222223..", ".322222222222222223.", ".322211222222112223.",
    "32221111222211112223", "32221111222211112223", "32222112222221122223",
    "32222222222222222223", "32222222222222222223", ".322222222222222223.",
    ".322222233332222223.", "..322223....322223..", "..322223....322223..",
    ".322223......322223.", "32223..........32223", "323..............323",
    "33................33", "....................",
  ];
  const colors: Record<string,string>={"1":"#f4d0ff","2":"#a77ab8","3":"#594267"};
  rows.forEach((row,y)=>[...row].forEach((pixel,x)=>{
    if(colors[pixel]){ctx.fillStyle=colors[pixel];ctx.fillRect(x,y,1,1);}
  }));
  ghostCanvas=canvas;return canvas;
};
const ghost: Draw = (ctx,t,ms,c) => {
  const appear=ease(progress(ms,55,240));
  const out=1-ease(progress(ms,510,220));
  const alpha=appear*out;
  if(alpha<=0)return;
  glow(ctx,t.x,t.y,t.radius*.8,c.main,alpha*.18);
  const bob=Math.sin(ms/90)*t.radius*.075;
  const size=t.radius*1.15;
  ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(ghostPixels(),t.x-size/2,t.y-size/2+bob,size,size);ctx.restore();
  for(let i=0;i<7;i++) {
    const age=progress(ms,125+i*55,320);
    if(!active(age))continue;
    disk(ctx,t.x+(random(t.seed+i*47)-.5)*t.radius*1.1,
      t.y+t.radius*(.53-age*.95),t.radius*.035,c.light,fade(age)*.5);
  }
};

const steel: Draw = (ctx,t,ms,c) => {
  const reveal=ease(progress(ms,60,260));
  const out=1-ease(progress(ms,565,160));
  if(reveal<=0||out<=0)return;
  motif(ctx,"shield",c,t.x,t.y-t.radius*(.3-.3*reveal),
    t.radius*(.2+reveal*.67),0,reveal*out);
  const shine=progress(ms,340,250);
  if(active(shine)) {
    const sx=t.x+t.radius*(-.65+shine*1.3);
    motif(ctx,"star",{main:c.light,light:"#ffffff",dark:c.main},sx,
      t.y-t.radius*.26,t.radius*(.08+.1*fade(shine)),0,fade(shine));
    stroke(ctx,[sx-t.radius*.2,t.y-t.radius*.06,
      sx+t.radius*.15,t.y-t.radius*.55],t.radius*.04,c.light,fade(shine)*.65);
  }
};

const fire: Draw = (ctx,t,ms,c) => {
  const floor=t.y+t.radius*.34;
  for(let i=0;i<13;i++) {
    const seed=t.seed+i*61;
    const start=30+i*43+random(seed)*45;
    const age=progress(ms,start,260+random(seed+2)*135);
    if(!active(age))continue;
    const dir=i%2?-1:1;
    const x=t.x+t.radius*dir*(.75-age*1.45)+
      Math.sin(age*7+i)*t.radius*.08;
    const y=floor+(random(seed+3)-.5)*t.radius*.38-
      Math.sin(age*Math.PI)*t.radius*.16;
    motif(ctx,"flame",c,x,y,t.radius*(.09+random(seed+4)*.09),
      dir*.25,fade(age)*.85);
  }
  glow(ctx,t.x,floor,t.radius*.72,c.main,fade(progress(ms,0,730))*.13);
};

const grass: Draw = (ctx,t,ms,c) => {
  const field=fade(progress(ms,0,730));
  glow(ctx,t.x,t.y,t.radius*.72,c.main,field*.13);
  for(let i=0;i<22;i++) {
    const seed=t.seed+i*43;
    const age=progress(ms,25+i*24+random(seed)*35,270+random(seed+2)*150);
    if(!active(age))continue;
    const theta=i*2.4+age*3;
    const x=t.x+Math.sin(theta)*t.radius*(.24+age*.48);
    const y=t.y+t.radius*(-1.1+age*1.66);
    motif(ctx,i%4?"petal":"leaf",c,x,y,
      t.radius*(.045+random(seed+3)*.055),theta,fade(age)*.79);
  }
};

const electric: Draw = (ctx,t,ms,c) => {
  glow(ctx,t.x,t.y,t.radius*.9,c.main,fade(progress(ms,0,720))*.1);
  for(let p=0;p<4;p++) {
    const age=progress(ms,20+p*125,355);
    if(!active(age))continue;
    const radius=t.radius*(.15+age*.92);
    const corners=16;
    const path:number[]=[];
    for(let i=0;i<=corners;i++) {
      const theta=i*Math.PI*2/corners;
      const jitter=i%2?1.07:.93;
      path.push(t.x+Math.cos(theta)*radius*jitter,
        t.y+Math.sin(theta)*radius*jitter*.77);
    }
    stroke(ctx,path,t.radius*(.07-age*.035),p%2?c.light:c.main,fade(age)*.76);
  }
  for(let i=0;i<7;i++) {
    const age=progress(ms,140+i*50,260);
    if(!active(age))continue;
    const a=i*2.4;
    motif(ctx,"bolt",c,t.x+Math.cos(a)*t.radius*(.27+age*.58),
      t.y+Math.sin(a)*t.radius*(.2+age*.46),t.radius*.075,a,fade(age)*.75);
  }
};

const psychic: Draw = (ctx,t,ms,c) => {
  const appear=ease(progress(ms,50,230));
  const out=1-ease(progress(ms,560,160));
  motif(ctx,"eye",c,t.x,t.y,t.radius*(.17+appear*.51),0,appear*out);
  for(let p=0;p<3;p++) {
    const age=progress(ms,215+p*125,330);
    if(active(age))ring(ctx,t.x,t.y,t.radius*(.35+age*.76),
      t.radius*(.08-age*.035),p%2?c.light:c.main,fade(age)*.65);
  }
};

const ice: Draw = (ctx,t,ms,c) => {
  const freeze=ease(progress(ms,35,315));
  const thaw=ease(progress(ms,555,170));
  if(freeze>0&&thaw<1) {
    ctx.save();ctx.globalAlpha=(1-thaw)*.69;
    ctx.translate(t.x,t.y);ctx.scale(t.radius*freeze*.8,t.radius*freeze*.8);
    ctx.fillStyle=c.main;ctx.strokeStyle=c.dark;ctx.lineWidth=.09;
    ctx.beginPath();ctx.rect(-.76,-.73,1.52,1.46);ctx.fill();ctx.stroke();
    ctx.strokeStyle=c.light;ctx.lineWidth=.075;
    ctx.beginPath();ctx.moveTo(-.76,-.73);ctx.lineTo(-.4,-1);
    ctx.lineTo(.96,-1);ctx.lineTo(.76,-.73);
    ctx.moveTo(.76,-.73);ctx.lineTo(.96,-1);ctx.lineTo(.96,.43);
    ctx.lineTo(.76,.73);ctx.stroke();
    ctx.fillStyle=c.light;ctx.globalAlpha*=.48;
    ctx.fillRect(-.55,-.5,.17,.95);ctx.fillRect(-.3,-.5,.1,.55);
    ctx.restore();
  }
  for(let i=0;i<9;i++) {
    const seed=t.seed+i*67;
    const age=progress(ms,150+i*35,300);
    if(!active(age))continue;
    motif(ctx,"ice",c,t.x+(random(seed)-.5)*t.radius*1.7,
      t.y+(random(seed+2)-.5)*t.radius*1.5,
      t.radius*(.035+random(seed+3)*.045),age,fade(age)*.7);
  }
};

const dragon: Draw = (ctx,t,ms,c) => {
  const rear=ease(progress(ms,45,260));
  const out=1-ease(progress(ms,570,150));
  motif(ctx,"dragon",c,t.x,t.y+t.radius*(.35-rear*.46),
    t.radius*(.23+rear*.56),-.24+rear*.2,rear*out);
  for(let p=0;p<3;p++) {
    const age=progress(ms,285+p*110,330);
    if(!active(age))continue;
    ctx.save();ctx.globalAlpha=fade(age)*.64;ctx.strokeStyle=p%2?c.light:c.main;
    ctx.lineWidth=t.radius*.07;
    ctx.beginPath();ctx.arc(t.x+t.radius*.25,t.y+t.radius*.09,
      t.radius*(.12+age*.88),-.42,.48);ctx.stroke();ctx.restore();
  }
  for(let i=0;i<7;i++) {
    const age=progress(ms,315+i*37,260);
    if(!active(age))continue;
    disk(ctx,t.x+t.radius*(.31+age*.72),
      t.y+t.radius*((i-3)*.1+age*.14),t.radius*.035,c.light,fade(age)*.7);
  }
};

const dark: Draw = (ctx,t,ms,c) => {
  for(let layer=0;layer<5;layer++) {
    const birth=20+layer*105;
    const age=progress(ms,birth,410);
    if(!active(age))continue;
    const direction=layer%2?-1:1;
    const x=t.x+t.radius*direction*(-.92+age*1.84);
    const y=t.y+t.radius*((layer-2)*.22+Math.sin(age*5+layer)*.08);
    ellipse(ctx,x,y,t.radius*(.42+layer*.045),t.radius*(.19+layer*.025),
      layer%2?c.main:c.dark,fade(age)*.31);
    ellipse(ctx,x-direction*t.radius*.22,y+t.radius*.08,t.radius*.3,t.radius*.15,
      c.dark,fade(age)*.2);
  }
  glow(ctx,t.x,t.y,t.radius*.98,c.dark,fade(progress(ms,0,740))*.2);
};

const effects: Partial<Record<VfxType, Draw>> = {
  normal, flying, rock, bug, ghost, steel, fire, grass, electric,
  psychic, ice, dragon, dark,
};

export const drawStatusTile = (ctx: CanvasRenderingContext2D,
  type: VfxType, tile: VfxTile, ms: number, colors: Colors): boolean => {
  const draw=effects[type];
  if(!draw)return false;
  draw(ctx,tile,ms,colors);
  return true;
};
