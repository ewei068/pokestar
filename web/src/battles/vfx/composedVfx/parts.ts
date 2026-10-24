import { sharedRecipes } from '../recipes/shared';
import { vfxArtwork } from '../recipes/artwork';
/** Material parts, never complete effect compositions. Units are one tile radius. */
import { random, clamp, ease } from '../math';
import type { Colors } from '../math';
export { random, clamp, ease };
export type Ctx = CanvasRenderingContext2D;
export type Point = [number, number];
export type Draw = (ctx: Ctx, ms: number, seed: number, c: Colors) => void;
export const TAU = Math.PI * 2;
export const age = (ms: number, birth: number, duration: number) => (ms - birth) / duration;
export const live = (u: number) => u > 0 && u < 1;
export const envelope = (u: number) => live(u) ? Math.min(1, u * sharedRecipes.opacityEnvelope.fadeInSpeed, (1 - u) * sharedRecipes.opacityEnvelope.fadeOutSpeed) : 0;
export const sin = (u: number) => Math.sin(clamp(u) * Math.PI);
export const withAlpha = (ctx: Ctx, a: number, draw: () => void) => {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); draw(); ctx.restore();
};
export const path = (ctx: Ctx, points: Point[], color: string, width: number, a = 1) => {
  withAlpha(ctx, a, () => {
    ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  });
};
export const poly = (ctx: Ctx, points: Point[], color: string) => {
  ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.closePath(); ctx.fill();
};
export const oval = (ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string, a = 1) => {
  if (rx <= 0 || ry <= 0) return;
  withAlpha(ctx,a,() => {ctx.fillStyle=color; ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();});
};
export const halo = (ctx: Ctx, x: number,y: number,r: number,color: string,a: number) => {
  if (r <= 0) return;
  withAlpha(ctx,a,() => {
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.3,color);g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  });
};
export const ring = (ctx: Ctx,x: number,y: number,r: number,color: string,width: number,a = 1,aspect = 1) => {
  if (r <= 0) return;
  withAlpha(ctx,a,()=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.ellipse(x,y,r,r*aspect,0,0,TAU);ctx.stroke();});
};
/** A moving head and a tapered tail along a sampled curve; the tail actually clears. */
export const ribbon = (ctx: Ctx, curve: (u:number)=>Point, head: number, length: number,
  width: number,color: string,a = 1) => {
  const start=Math.max(0,head-length), end=Math.min(1,head);
  if(end<=start)return;
  const edge: Point[]=[];
  for(const side of [1,-1]) for(let j=0;j<=24;j++) {
    const q=side===1?j/24:1-j/24, u=start+(end-start)*q;
    const [x,y]=curve(u), p0=curve(Math.max(0,u-.003)),p1=curve(Math.min(1,u+.003));
    const dx=p1[0]-p0[0],dy=p1[1]-p0[1],norm=Math.hypot(dx,dy)||1;
    const w=width*Math.pow(Math.sin(q*Math.PI),.75);
    edge.push([x-side*dy/norm*w,y+side*dx/norm*w]);
  }
  withAlpha(ctx,a,()=>poly(ctx,edge,color));
};
export const slash = (ctx:Ctx,ms:number,birth:number,angle:number,c:Colors,width=.12,offset:Point=[0,0],length=1)=>{
  const u=age(ms,birth,sharedRecipes.slash.lifetimeMs);if(!live(u))return;
  ctx.save();ctx.translate(...offset);ctx.rotate(angle);ctx.scale(length,1);
  const curve=(p:number):Point=>[-.9+1.8*p, -.32+1.3*p-.85*p*p];
  ribbon(ctx,curve,u*sharedRecipes.slash.headSpeed,sharedRecipes.slash.tail,width,c.dark,envelope(u));
  ribbon(ctx,curve,u*sharedRecipes.slash.headSpeed,sharedRecipes.slash.tail,width*sharedRecipes.slash.fillWidth,c.main,envelope(u));
  ribbon(ctx,curve,u*sharedRecipes.slash.headSpeed,sharedRecipes.slash.tail,width*sharedRecipes.slash.highlightWidth,c.light,envelope(u));ctx.restore();
};
export const shock = (ctx:Ctx,ms:number,birth:number,c:Colors,size=1,aspect=.8)=>{
  const recipe = sharedRecipes.pressure;
  for(let i=0;i<recipe.count;i++) {const u=age(ms,birth+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const r=(recipe.startRadius+ease(u)*recipe.growth)*size;
    ring(ctx,0,recipe.y,r,c.dark,recipe.outlineWidth*(1-u),envelope(u)*recipe.opacity,aspect);
    ring(ctx,0,recipe.y,r,c.light,recipe.highlightWidth*(1-u),envelope(u),aspect);
  }
};
export const spark=(ctx:Ctx,x:number,y:number,s:number,color:string,a=1,angle=0)=>{
  withAlpha(ctx,a,()=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    poly(ctx,[[0,-s],[s*.19,-s*.18],[s,0],[s*.19,s*.18],[0,s],[-s*.19,s*.18],[-s,0],[-s*.19,-s*.18]],color);ctx.restore();});
};
const ghostUrl = vfxArtwork.ghost;
const splashUrl = vfxArtwork.splash;
const dragonUrl = vfxArtwork.dragon;
const emberUrl = vfxArtwork.ember;
const fleckUrl = vfxArtwork.fleck;
const coalUrl = vfxArtwork.coal;
const starUrl = vfxArtwork.star;

export type Part = 'wing'|'rock'|'shard'|'leaf'|'feather'|'metal'|'scale'|'petal'|'claw'|'brain'|'head'|'ghost';
const cache=new Map<string,HTMLCanvasElement>();
/** Low-resolution authored silhouettes with hard facets, scaled like the reference fist. */
const makePart=(kind:Part,c:Colors,variant:number)=>{
  const key=`${kind}:${c.main}:${c.light}:${c.dark}:${variant%3}`;
  const prior=cache.get(key);if(prior)return prior;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=32;
  const p=canvas.getContext('2d')!;p.translate(16,16);p.scale(14,14);
  const shift=(variant%3)*.08;
  if(kind==='rock'||kind==='scale'||kind==='shard') {
    const pts:Point[]=kind==='shard'?[[0,-1],[.45,-.3],[.18,.85],[-.35,.5],[-.47,-.25]]:
      [[-.87,.24],[-.56,-.68+shift],[.14,-.86],[.76,-.42],[.83,.4],[.16,.82],[-.58,.68]];
    poly(p,pts,c.dark);p.scale(.87,.87);poly(p,pts,c.main);
    poly(p,[pts[0],pts[1],pts[2],[.03,.04]],c.light);
    poly(p,[[.03,.04],pts[2],pts[3],pts[4],[.22,.48]],c.main);
    path(p,[pts[1],[.03,.04],[.22,.48],pts[pts.length-1]],c.dark,.05);
  } else if(kind==='leaf'||kind==='feather'||kind==='petal') {
    const pts:Point[]=kind==='petal'?[[0,-.95],[.45,-.6],[.62,0],[.26,.6],[0,.92],[-.4,.46],[-.56,-.21],[-.4,-.65]]:
      [[-.66,.85],[-.7,.16],[-.39,-.48],[.5,-.93],[.7,-.43],[.55,.1],[.16,.63]];
    poly(p,pts,c.dark);p.scale(.87,.87);poly(p,pts,c.main);
    poly(p,[pts[0],pts[1],pts[2],pts[3],[.02,.06]],c.light);
    path(p,[[-.55,.85],[.04,-.02],[.47,-.75]],c.dark,.06);
    if(kind==='feather')for(let i=0;i<4;i++)path(p,[[-.48+i*.23,.62-i*.35],[.2+i*.1,.4-i*.32]],c.dark,.045);
  } else if(kind==='metal') {
    poly(p,[[-.35,-.94],[.45,-.82],[.45,.9],[-.35,.8]],c.dark);
    poly(p,[[-.3,-.89],[.19,-.81],[.19,.82],[-.3,.75]],c.main);
    poly(p,[[-.25,-.79],[-.13,-.77],[-.13,.67],[-.25,.67]],c.light);
    for(const y of [-.57,.55])oval(p,.03,y,.07,.07,c.dark);
  } else if(kind==='wing') {
    poly(p,[[-.82,.73],[-.75,-.05],[-.41,-.57],[.08,-.82],[.87,-.91],[.68,-.54],[.21,-.27],[.63,-.37],[.49,-.04],[.02,.11],[.39,.06],[.22,.35],[-.19,.37],[-.09,.56],[-.82,.73]],c.dark);
    poly(p,[[-.69,.57],[-.61,-.04],[-.32,-.45],[.12,-.66],[.62,-.77],[.36,-.48],[-.13,-.16],[.32,-.23],[.02,.01],[-.3,.22],[-.15,.27],[-.38,.43]],c.light);
    path(p,[[-.7,.59],[-.35,.03],[.19,-.43],[.63,-.75]],c.main,.06);
  } else if(kind==='claw') {
    poly(p,[[-.65,-.56],[.29,-.71],[.68,-.39],[.79,.17],[.55,.52],[-.57,.59],[-.84,.13]],c.dark);
    poly(p,[[-.55,-.43],[.25,-.57],[.54,-.31],[.64,.12],[.41,.36],[-.49,.43],[-.67,.08]],c.main);
    for(let i=0;i<3;i++) {
      const x=-.44+i*.39;oval(p,x,.26,.21,.24,c.main);
      poly(p,[[x-.12,.27],[x+.15,.3],[x+.11,.63],[x-.03,.81],[x-.08,.49]],c.dark);
      poly(p,[[x-.065,.33],[x+.09,.34],[x+.055,.59],[x-.015,.68]],c.light);
    }
    path(p,[[-.48,-.26],[-.2,-.36],[.17,-.37]],c.light,.07);
  } else if(kind==='brain') {
    for(let i=0;i<7;i++) {const a=i*TAU/7;oval(p,Math.cos(a)*.42,Math.sin(a)*.39,.36,.36,c.dark);oval(p,Math.cos(a)*.42,Math.sin(a)*.39-.04,.28,.28,c.main);}
    for(let i=0;i<4;i++)path(p,[[-.52+i*.27,-.36],[-.65+i*.32,-.06],[-.35+i*.25,.14],[-.49+i*.3,.44]],c.light,.07);
  } else if(kind==='head') {
    poly(p,[[-.7,.9],[-.73,-.19],[-.86,-.84],[-.31,-.48],[-.02,-.97],[.2,-.46],[.61,-.62],[.48,-.21],[.9,-.11],[.96,.15],[.37,.22],[.53,.5],[.02,.48],[-.18,.9]],c.dark);
    poly(p,[[-.55,.78],[-.5,-.17],[-.19,-.3],[.07,-.49],[.19,-.23],[.5,-.2],[.79,.06],[.23,.09],[.12,.34],[-.19,.54]],c.main);
    poly(p,[[.03,-.19],[.3,-.16],[.16,-.02]],c.light);
  } else { // An original spirit: scalloped tail, hollow eyes, no borrowed game sprite.
    for(let i=0;i<6;i++) oval(p,Math.cos(i*TAU/6)*.22,Math.sin(i*TAU/6)*.25-.1,.49,.48,c.main);
    for(let i=0;i<3;i++) poly(p,[[-.69+i*.46,.27],[-.64+i*.46,.87],[-.25+i*.46,.25]],c.main);
    oval(p,-.25,-.18,.12,.19,c.light);oval(p,.25,-.18,.12,.19,c.light);
    oval(p,0,.22,.15,.12,c.dark);
  }
  cache.set(key,canvas);return canvas;
};
export const part=(ctx:Ctx,kind:Part,c:Colors,x:number,y:number,size:number,rotation=0,a=1,variant=0)=>{
  if(size<=0||a<=0)return;
  withAlpha(ctx,a,()=>{ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.imageSmoothingEnabled=false;
    ctx.drawImage(makePart(kind,c,variant),-size/2,-size/2,size,size);ctx.restore();});
};
const textures=new Map<string,HTMLImageElement>();
let loading:Promise<void>|undefined;
export const loadParts=()=> loading ??= Promise.all(Object.entries({ghost:ghostUrl,splash:splashUrl,dragon:dragonUrl,ember:emberUrl,fleck:fleckUrl,coal:coalUrl,star:starUrl}).map(async([key,url])=>{
  const img=new Image();img.src=url;await img.decode();textures.set(key,img);
})).then(()=>undefined);
export type TextureName = 'ghost'|'splash'|'dragon'|'ember'|'fleck'|'coal'|'star';
export const texture=(ctx:Ctx,name:TextureName,x:number,y:number,size:number,angle:number,a:number)=>{
  const image=textures.get(name);if(!image)return;
  withAlpha(ctx,a,()=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.imageSmoothingEnabled=false;const width=name==='ghost'?size*image.naturalWidth/image.naturalHeight:size;ctx.drawImage(image,-width/2,-size/2,width,size);ctx.restore();});
};
/** Emitted fragments have independent birth, spin, ballistic arc, and lifetime. */
export const debris=(ctx:Ctx,ms:number,birth:number,seed:number,c:Colors,kind:Part,count=10,origin:Point=[0,.2],power=1)=>{
  const recipe = sharedRecipes.debris;
  for(let i=0;i<count;i++){
    const s=seed+i*83,u=age(ms,birth+random(s)*recipe.birthJitterMs,recipe.lifetimeMs+random(s+2)*recipe.lifetimeJitterMs);if(!live(u))continue;
    const vx=(random(s+3)-.5)*recipe.spread*power, vy=-recipe.rise-random(s+4)*recipe.riseJitter;
    part(ctx,kind,c,origin[0]+vx*u,origin[1]+vy*u+u*u*recipe.gravity,
      (recipe.size+random(s+5)*recipe.sizeJitter)*(1-u*.4),random(s+6)*6+u*(random(s+7)-.5)*7,envelope(u),i);
  }
};
/** Eight authored material frames: the edge and interior both evolve, as in the aura reference. */
export const orb=(ctx:Ctx,c:Colors,x:number,y:number,size:number,ms:number,a:number,material:'molten'|'spirit'|'arcane')=>{
  const frame=Math.floor(ms/65)%8,key=`orb:${material}:${c.main}:${frame}`;
  let image=cache.get(key);
  if(!image){
    image=document.createElement('canvas');image.width=image.height=28;const p=image.getContext('2d')!;
    for(let yy=1;yy<27;yy++)for(let xx=1;xx<27;xx++){
      const dx=xx-13.5,dy=yy-13.5,d=Math.hypot(dx,dy),angle=Math.atan2(dy,dx),edge=11.4+Math.sin(angle*5+frame*.65)*.5;
      if(d>edge)continue;
      const stream=Math.sin(angle*3+d*.55-frame*.8), vein=Math.sin(dx*.8+Math.sin(dy*.6+frame*.6)*1.9);
      p.fillStyle=d>edge-1?c.dark:material==='molten'?(vein>.68?c.light:vein>.2?c.main:c.dark):
        stream>.55?c.light:stream>-.35?c.main:c.dark;
      p.fillRect(xx,yy,1,1);
    }
    cache.set(key,image);
  }
  withAlpha(ctx,a,()=>{ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(image! ,x-size/2,y-size/2,size,size);ctx.restore();});
};
